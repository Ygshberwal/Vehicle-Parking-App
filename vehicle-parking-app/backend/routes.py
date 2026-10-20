from io import BytesIO
from pathlib import Path
from uuid import UUID

from celery.result import AsyncResult
from email_validator import EmailNotValidError, validate_email
from flask import Blueprint, current_app as app, render_template, request, send_file
from flask_security import auth_required, roles_required
from flask_security.utils import hash_password, verify_password

from backend.exports import csv_data, EXPORTS
from backend.extensions import cache
from backend.models.models import db, User

routes = Blueprint("main", __name__)


@routes.get("/")
def home():
    return render_template("index.html", demo_mode=app.config["APP_ENV"] == "demo")


@routes.get("/app-config")
def app_config():
    return {"demo": app.config["APP_ENV"] == "demo", "async_exports": app.config["ENABLE_CELERY"]}


@routes.get("/exports/<kind>")
@auth_required("token")
@roles_required("admin")
def direct_export(kind):
    if kind not in EXPORTS:
        return {"message": "Unknown export"}, 404
    return send_file(BytesIO(csv_data(kind)), mimetype="text/csv", as_attachment=True, download_name=f"{kind}_data.csv")


@routes.get("/<kind>-create")
@auth_required("token")
@roles_required("admin")
def create_export(kind):
    if kind not in EXPORTS:
        return {"message": "Unknown export"}, 404
    if not app.config["ENABLE_CELERY"]:
        return {"download_url": f"/exports/{kind}"}
    from backend.celery.tasks import lot_csv, users_csv, bookings_csv
    task = {"lot": lot_csv, "users": users_csv, "bookings": bookings_csv}[kind].delay()
    return {"task_id": task.id}


@routes.get("/<kind>-download/<task_id>")
@auth_required("token")
@roles_required("admin")
def download_export(kind, task_id):
    if kind not in EXPORTS or not app.config["ENABLE_CELERY"]:
        return {"message": "Background exports are disabled or unknown"}, 404
    try:
        UUID(task_id)
    except ValueError:
        return {"message": "Invalid task ID"}, 400
    result = AsyncResult(task_id, app=app.extensions["celery"])
    if result.failed():
        return {"message": "Export failed; please try again"}, 500
    if not result.ready():
        return {"message": "Export is not ready"}, 202
    filename = result.result
    if not isinstance(filename, str) or filename != Path(filename).name or not filename.startswith(f"{kind}_data_") or not filename.endswith(".csv"):
        return {"message": "Not an export of this type"}, 404
    directory = Path(app.config.get("EXPORT_DIRECTORY") or Path(app.root_path) / "backend" / "celery" / "user-downloads")
    path = directory / filename
    if not path.is_file():
        return {"message": "Export expired; generate a new one"}, 404
    return send_file(path, as_attachment=True)


@routes.post("/login")
def login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return {"message": "Provide an email and password"}, 400
    email, password = data.get("email"), data.get("password")
    if not isinstance(email, str) or not isinstance(password, str) or not email.strip() or not 1 <= len(password) <= 128:
        return {"message": "Provide an email and password"}, 400
    user = app.security.datastore.find_user(email=email.strip().lower())
    if not user or not user.active or not verify_password(password, user.password):
        return {"message": "Invalid email or password, or account disabled"}, 401
    return {"token": user.get_auth_token(), "email": user.email, "name": user.name,
            "role": "admin" if user.has_role("admin") else "user", "id": user.id}


@routes.post("/register")
def register():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return {"message": "Invalid registration details"}, 400
    name, email, password = data.get("name"), data.get("email"), data.get("password")
    if (not isinstance(name, str) or not 1 <= len(name.strip()) <= 80
            or not isinstance(email, str) or not isinstance(password, str)
            or not 8 <= len(password) <= 72 or data.get("role") != "user"):
        return {"message": "Provide a name, email, user role and an 8–72 character password"}, 400
    try:
        email = validate_email(email.strip(), check_deliverability=False).normalized.lower()
        pincode = int(data["pincode"]) if data.get("pincode") else None
        if pincode is not None and not 100000 <= pincode <= 999999:
            raise ValueError("Invalid PIN")
    except (EmailNotValidError, ValueError, TypeError):
        return {"message": "Provide a valid email and six-digit PIN code"}, 400
    if app.config["APP_ENV"] == "demo" and User.query.count() >= app.config["DEMO_MAX_USERS"]:
        return {"message": "The public demo user limit has been reached"}, 409
    if app.security.datastore.find_user(email=email):
        return {"message": "User already exists"}, 409
    try:
        app.security.datastore.create_user(name=name.strip(), email=email, password=hash_password(password), pincode=pincode, roles=["user"])
        db.session.commit()
        cache.delete("users_list")
    except Exception:
        db.session.rollback()
        app.logger.exception("Registration failed")
        return {"message": "Unable to register this account"}, 400
    return {"message": "User created"}, 201


@routes.get("/celery")
@auth_required("token")
@roles_required("admin")
def celery_test():
    if not app.config["ENABLE_CELERY"]:
        return {"message": "Background tasks are disabled in the hosted demo"}, 404
    from backend.celery.tasks import add
    return {"task_id": add.delay(10, 20).id}


@routes.get("/get-celery-data/<task_id>")
@auth_required("token")
@roles_required("admin")
def celery_result(task_id):
    if not app.config["ENABLE_CELERY"]:
        return {"message": "Background tasks are disabled"}, 404
    result = AsyncResult(task_id, app=app.extensions["celery"])
    if result.failed():
        return {"message": "Task failed"}, 500
    if result.ready():
        return {"result": result.result}
    return {"message": "Task is not ready"}, 202
