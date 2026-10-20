"""Explicit, destructive reset of the local development database to demo data."""

import argparse
from datetime import datetime, timedelta
from math import ceil
from pathlib import Path


USERS = [
    ("user01", "user01@parking.com", "user123", 110001),
    ("Aarav Sharma", "aarav@parking.com", "AaravDemo123!", 110001),
    ("Diya Patel", "diya@parking.com", "DiyaDemo123!", 110017),
    ("Kabir Singh", "kabir@parking.com", "KabirDemo123!", 110085),
    ("Meera Gupta", "meera@parking.com", "MeeraDemo123!", 110019),
    ("Riya Verma", "riya@parking.com", "RiyaDemo123!", 110075),
]

LOTS = [
    ("Connaught Place Central", 60, "Block A, Connaught Place, New Delhi", 110001, 12),
    ("Saket Metro Parking", 40, "Gate 2, Saket Metro Station, New Delhi", 110017, 8),
    ("Rohini Market Parking", 30, "Sector 7 Market, Rohini, New Delhi", 110085, 6),
    ("Nehru Place Plaza", 50, "Nehru Place Commercial Complex, New Delhi", 110019, 4),
    ("Dwarka Express Parking", 25, "Sector 10 Metro Station, Dwarka, New Delhi", 110075, 3),
]


def large_specs():
    first_names = ["Aarav", "Diya", "Kabir", "Meera", "Riya", "Arjun", "Ananya", "Vivaan", "Ishaan", "Saanvi",
                   "Aditya", "Nisha", "Rohan", "Priya", "Dev", "Tara", "Kunal", "Neha", "Rahul", "Pooja"]
    last_names = ["Sharma", "Patel", "Singh", "Gupta", "Verma", "Joshi", "Kapoor", "Malhotra",
                  "Mehta", "Rao", "Shah", "Bhatia", "Saxena", "Jain", "Sethi"]
    areas = ["Karol Bagh", "Lajpat Nagar", "Janakpuri", "Pitampura", "Vasant Kunj", "Mayur Vihar",
             "Hauz Khas", "Rajouri Garden", "Green Park", "Chandni Chowk", "Greater Kailash"]
    kinds = ["Metro", "Market", "Mall", "Office", "Community"]
    users = list(USERS)
    for index in range(6, 300):
        name = f"{first_names[index % len(first_names)]} {last_names[index // len(first_names)]}"
        users.append((name, f"demo{index + 1:03d}@parking.com", "ParkingDemo123!", 110001 + index % 90))
    lots = list(LOTS)
    for index in range(5, 60):
        area = areas[(index - 5) % len(areas)]
        kind = kinds[(index - 5) // len(areas)]
        lots.append((f"{area} {kind} Parking", 20 + index % 12 * 10,
                     f"Block {chr(65 + index % 12)}, {area}, New Delhi",
                     110001 + index % 90, 20 + index % 9 * 5))
    return users, lots


def add_large_bookings(db, booking_model, users, lots, slots, now):
    # One visit every 43 minutes across the dataset, spread over almost a year.
    # Users recur about every eight days; slots recur much less often than visits last.
    visiting_users = users[:5] + users[6:281]
    historical_lots = [index for index in range(len(lots)) if index not in (3, 59)]
    for index in range(12000):
        user_index = index % len(visiting_users)
        lot_index = historical_lots[index % len(historical_lots)]
        slot = slots[lot_index][(index // len(historical_lots)) % len(slots[lot_index])]
        start = now - timedelta(days=365) + timedelta(minutes=index * 43)
        duration = timedelta(hours=1 + index % 8, minutes=15 + index % 40)
        db.session.add(booking_model(
            u_id=visiting_users[user_index].id, s_id=slot.id,
            parking_timestamp=start, leaving_timestamp=start + duration,
            cost=ceil(duration.total_seconds() / 3600) * lots[lot_index].price,
            vehicle_no=f"DL02CD{1000 + user_index}",
        ))

    # Fully occupy Dwarka and Karol Bagh Metro; distribute the rest across lots.
    allocation = [4] * len(slots[4]) + [5] * len(slots[5])
    partial_lots = [index for index in range(len(lots)) if index not in (2, 3, 4, 5, 59)]
    allocation += [partial_lots[index % len(partial_lots)] for index in range(180 - len(allocation))]
    for index, lot_index in enumerate(allocation):
        slot = next(slot for slot in slots[lot_index] if slot.status == "available")
        slot.status = "occupied"
        lots[lot_index].available_slot -= 1
        lots[lot_index].occupied_slot += 1
        db.session.add(booking_model(
            u_id=visiting_users[index].id, s_id=slot.id,
            parking_timestamp=now - timedelta(minutes=15 + index * 3),
            leaving_timestamp=None, cost=None, vehicle_no=f"DL02CD{1000 + index}",
        ))


def seed_demo(profile="small", application=None, reset=True):
    # Import only after explicit confirmation: importing app initializes its DB.
    if application is None:
        from app import app
    else:
        app = application
    from backend.models.models import db, ParkingLot, ParkingSlot, ReserveParkingSlot
    from flask_security.utils import hash_password

    root = Path(__file__).resolve().parent
    user_specs, lot_specs = large_specs() if profile == "large" else (USERS, LOTS)
    with app.app_context():
        expected = root / "instance" / "database.sqlite3"
        if reset and (db.engine.url.get_backend_name() != "sqlite" or (
            Path(db.engine.url.database).resolve() != expected
        )):
            raise RuntimeError("Refusing to reset anything except the local instance/database.sqlite3")

        now = datetime.now().replace(microsecond=0)
        datastore = app.security.datastore
        try:
            # Delete children before parents; commit the reset and seed together.
            if reset:
                for table in reversed(db.metadata.sorted_tables):
                    db.session.execute(table.delete())
            elif any(db.session.execute(db.select(table).limit(1)).first() for table in db.metadata.sorted_tables):
                raise RuntimeError("Refusing to seed a database that already contains application data")

            # Fictional seed accounts share documented passwords. Hash each distinct
            # seed password once so the free host can initialize promptly. Real
            # registrations still get independently salted hashes via hash_password.
            hashes = {}

            def seed_password(password):
                if password not in hashes:
                    hashes[password] = hash_password(password)
                return hashes[password]

            datastore.create_role(name="admin", description="superuser")
            datastore.create_role(name="user", description="general user")
            datastore.create_user(
                name="admin", email="admin@parking.com",
                password=seed_password("admin123"), roles=["admin"],
            )
            users = [
                datastore.create_user(
                    name=name, email=email, password=seed_password(password),
                    pincode=pincode, roles=["user"],
                )
                for name, email, password, pincode in user_specs
            ]
            lots, slots = [], []
            for index, (name, price, address, pincode, capacity) in enumerate(lot_specs):
                lot = ParkingLot(
                    location_name=name, price=price, address=address, pincode=pincode,
                    available_slot=capacity, occupied_slot=0,
                    created_at=now - timedelta(days=400 + index),
                )
                db.session.add(lot)
                db.session.flush()
                lot_slots = [ParkingSlot(lot_id=lot.id, status="available") for _ in range(capacity)]
                db.session.add_all(lot_slots)
                lots.append(lot)
                slots.append(lot_slots)
            db.session.flush()

            # Twelve non-overlapping historical visits for each of five users.
            # Riya remains a new user with no history; Nehru Place has no bookings.
            historical_lots = [0, 1, 2, 4]
            if profile == "large":
                add_large_bookings(db, ReserveParkingSlot, users, lots, slots, now)
            for visit in range(12 if profile == "small" else 0):
                for index, user in enumerate(users[:5]):
                    lot_index = historical_lots[(visit + index) % len(historical_lots)]
                    start = now - timedelta(days=100 - visit * 8, hours=index)
                    duration = timedelta(hours=1 + (visit + index) % 5, minutes=15)
                    db.session.add(ReserveParkingSlot(
                        u_id=user.id, s_id=slots[lot_index][index % len(slots[lot_index])].id,
                        parking_timestamp=start, leaving_timestamp=start + duration,
                        cost=ceil(duration.total_seconds() / 3600) * lots[lot_index].price,
                        vehicle_no=f"DL01AB{1001 + index}",
                    ))

            # Two partially occupied lots and one completely full lot.
            for index, lot_index in enumerate([0, 1, 4, 4, 4] if profile == "small" else []):
                lot = lots[lot_index]
                slot = next(slot for slot in slots[lot_index] if slot.status == "available")
                slot.status = "occupied"
                lot.available_slot -= 1
                lot.occupied_slot += 1
                db.session.add(ReserveParkingSlot(
                    u_id=users[index].id, s_id=slot.id,
                    parking_timestamp=now - timedelta(minutes=30 + index * 40),
                    leaving_timestamp=None, cost=None, vehicle_no=f"DL01AB{1001 + index}",
                ))
            db.session.flush()
            expected_active = 180 if profile == "large" else 5
            expected_completed = 12000 if profile == "large" else 60
            assert sum(lot.available_slot + lot.occupied_slot for lot in lots) == sum(spec[4] for spec in lot_specs)
            assert ParkingSlot.query.filter_by(status="occupied").count() == expected_active
            assert ReserveParkingSlot.query.count() == expected_completed + expected_active
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        print(f"Created {profile} profile: 1 admin, {len(users)} users, {len(lots)} lots, "
              f"{sum(spec[4] for spec in lot_specs)} slots, {expected_completed} completed "
              f"and {expected_active} active bookings.")
        print("Credentials and scenarios: ../DEMO_DATA.md")

    if not reset:
        return

    # Remove only known generated local artifacts, never environments or source.
    artifacts = list((root / "backend" / "celery" / "user-downloads").glob("*.csv"))
    artifacts += list(root.glob("celerybeat-schedule*"))
    artifacts += [root / "dump.rdb", root.parent / "dump.rdb"]
    for path in artifacts:
        if path.is_file() and not path.is_symlink():
            path.unlink()
            print(f"Removed generated file: {path.relative_to(root.parent)}")
    (root / "backend" / "celery" / "user-downloads").mkdir(parents=True, exist_ok=True)
    print("Redis is not flushed. Stop old tasks and clear app-specific cache before resetting.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reset", action="store_true", help="Delete existing local data and seed demo data")
    parser.add_argument("--profile", choices=["small", "large"], default="small", help="Dataset size (default: small)")
    args = parser.parse_args()
    if not args.reset:
        parser.error("Destructive operation: stop Flask, Celery worker and Beat, then pass --reset to confirm.")
    seed_demo(args.profile)
