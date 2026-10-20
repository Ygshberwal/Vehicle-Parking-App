"""Tracked configuration for local development and the free hosted demo."""

import os


def environment_config():
    environment = os.getenv("APP_ENV", "local")
    if environment not in {"local", "demo"}:
        raise ValueError("APP_ENV must be local or demo")
    demo = environment == "demo"
    database_url = os.getenv("DATABASE_URL", "" if demo else "sqlite:///database.sqlite3")
    # Explicitly select psycopg 3, including for Neon URLs using postgres://.
    for prefix in ("postgres://", "postgresql://"):
        if database_url.startswith(prefix):
            database_url = "postgresql+psycopg://" + database_url[len(prefix):]
            break
    return {
        "APP_ENV": environment,
        "DEBUG": not demo,
        "SQLALCHEMY_DATABASE_URI": database_url,
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        "SQLALCHEMY_ENGINE_OPTIONS": {"pool_pre_ping": True, "pool_recycle": 300},
        "SECRET_KEY": os.getenv("SECRET_KEY", "" if demo else "anothersecuritykey"),
        "SECURITY_PASSWORD_SALT": os.getenv("SECURITY_PASSWORD_SALT", "" if demo else "mysecretsaltkey"),
        "SECURITY_PASSWORD_HASH": "bcrypt",
        "SECURITY_TOKEN_AUTHENTICATION_HEADER": "Authentication-Token",
        "SECURITY_TOKEN_MAX_AGE": 86400,
        "WTF_CSRF_ENABLED": False,  # APIs require an explicit header token, not cookies.
        "SESSION_COOKIE_SECURE": demo,
        "SESSION_COOKIE_HTTPONLY": True,
        "SESSION_COOKIE_SAMESITE": "Lax",
        "MAX_CONTENT_LENGTH": 1024 * 1024,
        "CACHE_TYPE": "SimpleCache" if demo else "RedisCache",
        "CACHE_REDIS_URL": os.getenv("CACHE_REDIS_URL", "redis://localhost:6379/2"),
        "CACHE_DEFAULT_TIMEOUT": 5,
        "ENABLE_CELERY": not demo,
        "ENABLE_EMAIL": not demo,
        "AUTO_INIT_LOCAL_DB": not demo,
        "DEMO_MAX_USERS": 500,
        "DEMO_MAX_LOTS": 100,
        "DEMO_MAX_BOOKINGS": 20000,
    }


def validate_config(app):
    if app.config["APP_ENV"] == "demo":
        for key in ("SECRET_KEY", "SECURITY_PASSWORD_SALT"):
            if len(app.config.get(key, "")) < 32:
                raise ValueError(f"Demo deployment requires {key} with at least 32 characters")
        if not app.config.get("TESTING") and not app.config["SQLALCHEMY_DATABASE_URI"].startswith("postgresql+psycopg://"):
            raise ValueError("Demo deployment requires a PostgreSQL DATABASE_URL")
