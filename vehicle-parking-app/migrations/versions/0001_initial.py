"""Initial parking schema, equivalent to the existing SQLite models."""
from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("user",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("password", sa.String(), nullable=False),
        sa.Column("dp", sa.LargeBinary()),
        sa.Column("pincode", sa.Integer()),
        sa.Column("fs_uniquifier", sa.String(), nullable=False, unique=True),
        sa.Column("active", sa.Boolean()),
    )
    op.create_table("role",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False, unique=True),
        sa.Column("description", sa.String(), nullable=False),
    )
    op.create_table("user_roles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id")),
        sa.Column("role_id", sa.Integer(), sa.ForeignKey("role.id")),
    )
    op.create_table("parking_lot",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("location_name", sa.String(), nullable=False),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("address", sa.String(), nullable=False),
        sa.Column("pincode", sa.Integer(), nullable=False),
        sa.Column("available_slot", sa.Integer()),
        sa.Column("occupied_slot", sa.Integer()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_table("parking_slot",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("lot_id", sa.Integer(), sa.ForeignKey("parking_lot.id")),
        sa.Column("status", sa.String(), nullable=False),
    )
    op.create_table("reserve_parking_slot",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("u_id", sa.Integer(), sa.ForeignKey("user.id")),
        sa.Column("s_id", sa.Integer(), sa.ForeignKey("parking_slot.id")),
        sa.Column("parking_timestamp", sa.DateTime()),
        sa.Column("leaving_timestamp", sa.DateTime()),
        sa.Column("cost", sa.Integer()),
        sa.Column("vehicle_no", sa.String()),
    )
    op.create_index("ix_reserve_parking_slot_parking_timestamp", "reserve_parking_slot", ["parking_timestamp"])
    op.create_index("ix_reserve_parking_slot_leaving_timestamp", "reserve_parking_slot", ["leaving_timestamp"])


def downgrade():
    for table in ("reserve_parking_slot", "parking_slot", "parking_lot", "user_roles", "role", "user"):
        op.drop_table(table)
