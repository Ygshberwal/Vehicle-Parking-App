"""Initialize an empty hosted demo without deleting existing data."""
import argparse
from pathlib import Path

from flask_migrate import upgrade
from sqlalchemy import text

from app import app
from backend.models.models import db
from seed_demo import seed_demo


def initialize_demo(application, profile="large", if_empty=False):
    if application.config["APP_ENV"] != "demo":
        raise RuntimeError("Hosted initialization requires APP_ENV=demo; use seed_demo.py for local resets")
    with application.app_context():
        # Serializes simultaneous Render starts against the same Neon database.
        with db.engine.begin() as connection:
            if db.engine.dialect.name == "postgresql":
                connection.execute(text("SELECT pg_advisory_xact_lock(721605093)"))
            upgrade(directory=str(Path(__file__).parent / "migrations"))
            populated = any(db.session.execute(db.select(table).limit(1)).first() for table in db.metadata.sorted_tables)
            if populated:
                if if_empty:
                    print("Existing application data found; preserving it (no demo reset).")
                    return
                raise RuntimeError("Database already contains application data; refusing to overwrite it")
            seed_demo(profile, application=application, reset=False)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["init-demo"])
    parser.add_argument("--profile", choices=["small", "large"], default="large")
    parser.add_argument("--if-empty", action="store_true", help="Preserve existing data and exit successfully")
    args = parser.parse_args()
    initialize_demo(app, args.profile, args.if_empty)
