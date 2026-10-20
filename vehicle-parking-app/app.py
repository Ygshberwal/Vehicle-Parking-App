import hashlib
import time
from threading import Lock

from flask import Flask, jsonify, request
from flask_security import Security, SQLAlchemyUserDatastore
from sqlalchemy import text

from backend.extensions import cache, migrate
from backend.models.models import db, User, Role
from backend.settings import environment_config, validate_config


def createApp(test_config=None):
    app = Flask(__name__, template_folder="frontend", static_folder="frontend", static_url_path="/static")
    app.config.from_mapping(environment_config())
    if test_config:
        app.config.update(test_config)
    validate_config(app)

    db.init_app(app)
    cache.init_app(app)
    app.cache = cache
    migrate.init_app(app, db)
    security = Security(app, SQLAlchemyUserDatastore(db, User, Role), register_blueprint=False)
    app.security = security

    @security.unauthn_handler
    def unauthenticated(mechanisms, headers=None):
        response = jsonify(message="Your session has expired. Please log in again.")
        response.status_code = 401
        return response

    @security.unauthz_handler
    def unauthorized(function, parameters):
        response = jsonify(message="You do not have permission to perform this action.")
        response.status_code = 403
        return response

    from backend.resources import api
    from backend.routes import routes
    api.init_app(app)
    app.register_blueprint(routes)

    rate_lock = Lock()

    @app.before_request
    def demo_write_limits():
        if app.config["APP_ENV"] != "demo" or request.method not in {"POST", "PUT", "DELETE"}:
            return None
        category = "auth" if request.path in {"/login", "/register"} else "write"
        limit = 30 if category == "auth" else 90
        address = hashlib.sha256((request.remote_addr or "unknown").encode()).hexdigest()
        key = f"rate:{category}:{address}:{int(time.time() // 60)}"
        with rate_lock:
            count = cache.get(key) or 0
            if count >= limit:
                return jsonify(message="Demo request limit reached. Please try again in a minute."), 429, {"Retry-After": "60"}
            cache.set(key, count + 1, timeout=65)

    @app.get("/healthz")
    def health():
        try:
            db.session.execute(text("SELECT 1"))
            return {"status": "ok"}
        except Exception:
            app.logger.exception("Database health check failed")
            return {"status": "unavailable"}, 503

    @app.after_request
    def response_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if app.config["APP_ENV"] == "demo":
            response.headers["X-Robots-Tag"] = "noindex, nofollow"
        if app.config["APP_ENV"] == "demo" or response.mimetype == "application/json":
            response.headers["Cache-Control"] = "no-store"
        return response

    if app.config["ENABLE_CELERY"]:
        from backend.celery.celery_factory import celery_init_app
        from backend.celery.celery_schedule import configure_schedule
        celery = celery_init_app(app)
        configure_schedule(celery)

    if app.config["AUTO_INIT_LOCAL_DB"]:
        from backend.models.create_initial_data import initialize_local_data
        with app.app_context():
            initialize_local_data()
    return app


app = createApp()
celery_app = app.extensions.get("celery")

if __name__ == "__main__":
    app.run()
