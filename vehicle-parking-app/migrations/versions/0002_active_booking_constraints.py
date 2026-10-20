"""Prevent concurrent requests from double-booking a vehicle or slot."""
from alembic import op
import sqlalchemy as sa

revision = "0002_active_booking_constraints"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade():
    for name, column in (("uq_active_vehicle", "vehicle_no"), ("uq_active_slot", "s_id")):
        condition = sa.text(f"leaving_timestamp IS NULL AND {column} IS NOT NULL")
        op.create_index(name, "reserve_parking_slot", [column], unique=True,
                        postgresql_where=condition, sqlite_where=condition)


def downgrade():
    op.drop_index("uq_active_slot", table_name="reserve_parking_slot")
    op.drop_index("uq_active_vehicle", table_name="reserve_parking_slot")
