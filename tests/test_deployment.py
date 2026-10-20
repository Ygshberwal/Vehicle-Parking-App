"""Run from the repository root: python -m unittest discover -s tests -v."""
import csv
from io import StringIO
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "vehicle-parking-app"))
# Importing the module must never initialize the developer's real SQLite DB.
os.environ.update(APP_ENV="demo", DATABASE_URL="postgresql://unused:unused@localhost/unused",
                  SECRET_KEY="test-secret-" * 6, SECURITY_PASSWORD_SALT="test-salt-" * 6)

from app import createApp
from backend.extensions import cache
from backend.models.models import db, User, ParkingLot, ParkingSlot, ReserveParkingSlot
from manage import initialize_demo
from seed_demo import seed_demo


class DeploymentTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(dir=os.getenv("PARKING_TEST_TMPDIR"))
        self.app = createApp({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///" + str(Path(self.temp.name) / "test.sqlite3"),
            "SQLALCHEMY_ENGINE_OPTIONS": {},
            "SECURITY_PASSWORD_HASH_PASSLIB_OPTIONS": {"bcrypt__rounds": 4},
            "EXPORT_DIRECTORY": self.temp.name,
        })
        with self.app.app_context():
            db.create_all()
        seed_demo(application=self.app, reset=False)
        self.client = self.app.test_client()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.engine.dispose()
        self.temp.cleanup()

    def login(self, email="admin@parking.com", password="admin123"):
        response = self.client.post("/login", json={"email": email, "password": password})
        self.assertEqual(response.status_code, 200, response.get_json())
        return {"Authentication-Token": response.get_json()["token"]}

    def test_no_background_services_and_demo_banner(self):
        self.assertNotIn("celery", self.app.extensions)
        self.assertFalse(self.app.config["ENABLE_EMAIL"])
        self.assertEqual(self.app.config["CACHE_TYPE"], "SimpleCache")
        self.assertIn(b"Portfolio demo", self.client.get("/").data)
        self.assertEqual(self.client.get("/healthz").status_code, 200)
        self.assertEqual(self.client.get("/app-config").get_json(), {"demo": True, "async_exports": False})

    def test_login_validation_and_stale_tokens(self):
        self.assertEqual(self.client.post("/login", json=[]).status_code, 400)
        self.assertEqual(self.client.post("/login", json={"email": "admin@parking.com", "password": "wrong"}).status_code, 401)
        for headers in ({}, {"Authentication-Token": "expired-or-invalid"}):
            response = self.client.get("/api/lots", headers=headers)
            self.assertEqual(response.status_code, 401)
            self.assertIn("message", response.get_json())

    def test_all_original_accounts_can_log_in(self):
        from seed_demo import USERS
        self.login()
        for _, email, password, _ in USERS:
            self.login(email, password)

    def test_role_and_ownership_permissions(self):
        headers = self.login("user01@parking.com", "user123")
        with self.app.app_context():
            own_id = User.query.filter_by(email="user01@parking.com").one().id
            other_id = User.query.filter_by(email="aarav@parking.com").one().id
            other_booking = ReserveParkingSlot.query.filter_by(u_id=other_id, leaving_timestamp=None).one().id
        for path in ("/api/users", "/api/all-stats", f"/api/users/{other_id}",
                     f"/api/user-stats/{other_id}", f"/api/user-dashboard/{other_id}", "/exports/users", "/lot-create"):
            self.assertEqual(self.client.get(path, headers=headers).status_code, 403, path)
        self.assertEqual(self.client.post("/api/lots", headers=headers, json={}).status_code, 403)
        self.assertEqual(self.client.put("/api/lots/1", headers=headers, json={}).status_code, 403)
        self.assertEqual(self.client.delete("/api/lots/1", headers=headers).status_code, 403)
        self.assertEqual(self.client.put(f"/api/release-slot/{other_booking}", headers=headers).status_code, 403)
        self.assertEqual(self.client.get(f"/api/user-dashboard/{own_id}", headers=headers).status_code, 200)

    def test_direct_exports_are_safe_and_do_not_write_files(self):
        headers = self.login()
        with self.app.app_context():
            user = User.query.filter_by(email="user01@parking.com").one()
            user.name = "=HYPERLINK(\"bad\")"
            db.session.commit()
        for kind, count in (("lot", 5), ("users", 7), ("bookings", 65)):
            created = self.client.get(f"/{kind}-create", headers=headers)
            response = self.client.get(created.get_json()["download_url"], headers=headers)
            self.assertEqual(response.status_code, 200)
            rows = list(csv.DictReader(StringIO(response.data.decode("utf-8-sig"))))
            self.assertEqual(len(rows), count)
            if kind == "users":
                self.assertNotIn("password", rows[0])
                self.assertNotIn("fs_uniquifier", rows[0])
                self.assertTrue(next(row for row in rows if row["email"] == "user01@parking.com")["name"].startswith("'="))
        self.assertEqual(list(Path(self.temp.name).glob("*.csv")), [])

    def test_booking_release_and_cache_invalidation(self):
        headers = self.login("riya@parking.com", "RiyaDemo123!")
        self.client.get("/api/lots", headers=headers)  # Prime cached occupancy.
        with self.app.app_context():
            lot_id = ParkingLot.query.filter_by(location_name="Nehru Place Plaza").one().id
        response = self.client.post(f"/api/lots/{lot_id}/book", headers=headers, json={"vehicle_number": "DL99ZZ9999"})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.client.post(f"/api/lots/{lot_id}/book", headers=headers, json={"vehicle_number": "DL99ZZ9999"}).status_code, 400)
        lots = self.client.get("/api/lots", headers=headers).get_json()
        self.assertEqual(next(lot for lot in lots if lot["id"] == lot_id)["occupied_slot"], 1)
        with self.app.app_context():
            booking_id = ReserveParkingSlot.query.filter_by(vehicle_no="DL99ZZ9999").one().id
        self.assertEqual(self.client.put(f"/api/release-slot/{booking_id}", headers=headers).status_code, 200)
        with self.app.app_context():
            self.assertEqual(db.session.get(ParkingLot, lot_id).occupied_slot, 0)
            self.assertGreater(db.session.get(ReserveParkingSlot, booking_id).cost, 0)

    def test_registration_and_blocked_login(self):
        data = {"email": "new@parking.com", "password": "NewDemo123!", "name": "New User", "role": "admin"}
        self.assertEqual(self.client.post("/register", json=data).status_code, 400)
        data["role"] = "user"
        self.assertEqual(self.client.post("/register", json=data).status_code, 201)
        self.assertEqual(self.client.post("/register", json=data).status_code, 409)
        with self.app.app_context():
            User.query.filter_by(email="new@parking.com").one().active = False
            db.session.commit()
        self.assertEqual(self.client.post("/login", json=data).status_code, 401)

    def test_blocking_user_revokes_existing_access(self):
        user_headers = self.login("user01@parking.com", "user123")
        admin_headers = self.login()
        with self.app.app_context():
            user_id = User.query.filter_by(email="user01@parking.com").one().id
        self.assertEqual(self.client.put(f"/api/users/{user_id}", headers=admin_headers).status_code, 200)
        self.assertEqual(self.client.get("/api/lots", headers=user_headers).status_code, 401)

    def test_demo_limits(self):
        admin = self.login()
        self.app.config["DEMO_MAX_LOTS"] = 5
        data = {"location_name": "Test", "address": "Test street", "pincode": 110001, "price": 20, "max_slot": 5}
        self.assertEqual(self.client.post("/api/lots", json=data, headers=admin).status_code, 409)
        self.app.config["DEMO_MAX_BOOKINGS"] = 65
        self.assertEqual(self.client.post("/api/lots/1/book", json={"vehicle_number": "NEW"}, headers=admin).status_code, 409)
        self.app.config["DEMO_MAX_USERS"] = 7
        data = {"email": "new@parking.com", "password": "NewDemo123!", "name": "New User", "role": "user"}
        self.assertEqual(self.client.post("/register", json=data).status_code, 409)

    def test_demo_authentication_rate_limit(self):
        with patch("app.time.time", return_value=1800000000):
            for _ in range(30):
                self.assertEqual(self.client.post("/login", json=[]).status_code, 400)
            response = self.client.post("/login", json=[])
            self.assertEqual(response.status_code, 429)
            self.assertEqual(response.headers["Retry-After"], "60")

    def test_admin_edit_delete_and_input_validation(self):
        headers = self.login()
        with self.app.app_context():
            lot_id = ParkingLot.query.filter_by(location_name="Nehru Place Plaza").one().id
        data = {"location_name": "Edited", "address": "Demo street", "pincode": 110001, "price": 20, "max_slot": 5}
        self.assertEqual(self.client.put(f"/api/lots/{lot_id}", json=data, headers=headers).status_code, 201)
        self.assertEqual(self.client.delete(f"/api/lots/{lot_id}", headers=headers).status_code, 200)
        self.assertEqual(self.client.delete("/api/lots/3", headers=headers).status_code, 400)  # Preserve history.
        data["max_slot"] = 100000
        self.assertEqual(self.client.post("/api/lots", json=data, headers=headers).status_code, 400)

    def test_demo_email_is_not_sent(self):
        from backend.celery.mail_service import send_email
        with self.app.app_context(), patch("smtplib.SMTP") as smtp:
            send_email("nobody@parking.com", "Test", "Test")
            smtp.assert_not_called()

    def test_no_remote_destructive_reset_or_overwrite(self):
        with self.assertRaises(RuntimeError):
            seed_demo(application=self.app, reset=True)
        with self.assertRaises(RuntimeError):
            seed_demo(application=self.app, reset=False)
        with self.app.app_context():
            self.assertEqual(User.query.count(), 7)

    def test_hosted_configuration_requires_secrets_and_postgres(self):
        with self.assertRaises(ValueError):
            createApp({"SECRET_KEY": "short"})
        with self.assertRaises(ValueError):
            createApp({"SQLALCHEMY_DATABASE_URI": "sqlite:///not-persistent.sqlite3"})

    def test_local_celery_export_still_works(self):
        local = createApp({
            "TESTING": True, "APP_ENV": "local", "ENABLE_CELERY": True,
            "AUTO_INIT_LOCAL_DB": False, "CACHE_TYPE": "SimpleCache",
            "SQLALCHEMY_DATABASE_URI": self.app.config["SQLALCHEMY_DATABASE_URI"],
            "SQLALCHEMY_ENGINE_OPTIONS": {}, "EXPORT_DIRECTORY": self.temp.name,
        })
        local.extensions["celery"].conf.update(
            broker_url="memory://", result_backend="cache+memory://",
            task_always_eager=True, task_store_eager_result=True,
        )
        for task in local.extensions["celery"].tasks.values():
            task.store_eager_result = True
        client = local.test_client()
        token = client.post("/login", json={"email": "admin@parking.com", "password": "admin123"}).get_json()["token"]
        headers = {"Authentication-Token": token}
        result = client.get("/users-create", headers=headers)
        self.assertIn("task_id", result.get_json())
        task_id = result.get_json()["task_id"]
        self.assertEqual(client.get(f"/users-download/{task_id}").status_code, 401)
        downloaded = client.get(f"/users-download/{task_id}", headers=headers)
        self.assertEqual(downloaded.status_code, 200)
        self.assertNotIn(b"password", downloaded.data.splitlines()[0])
        downloaded.close()
        with local.app_context():
            db.session.remove()
            db.engine.dispose()


class InitializationTests(unittest.TestCase):
    def test_migrations_and_repeat_start_preserve_existing_data(self):
        with tempfile.TemporaryDirectory(dir=os.getenv("PARKING_TEST_TMPDIR")) as directory:
            app = createApp({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///" + str(Path(directory) / "new.sqlite3"),
                             "SQLALCHEMY_ENGINE_OPTIONS": {}, "SECURITY_PASSWORD_HASH_PASSLIB_OPTIONS": {"bcrypt__rounds": 4}})
            initialize_demo(app, "small", if_empty=True)
            with app.app_context():
                first_token = User.query.filter_by(email="admin@parking.com").one().fs_uniquifier
                ParkingLot.query.first().location_name = "Preserve this edit"
                db.session.commit()
            initialize_demo(app, "large", if_empty=True)
            with app.app_context():
                self.assertEqual(User.query.count(), 7)
                self.assertEqual(ReserveParkingSlot.query.count(), 65)
                self.assertEqual(User.query.filter_by(email="admin@parking.com").one().fs_uniquifier, first_token)
                self.assertEqual(ParkingLot.query.first().location_name, "Preserve this edit")
                db.session.remove()
                db.engine.dispose()


if __name__ == "__main__":
    unittest.main()
