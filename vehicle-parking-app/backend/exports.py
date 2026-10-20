"""Safe CSV data shared by hosted downloads and local Celery tasks."""
import csv
from datetime import datetime
from io import StringIO
from backend.models.models import ParkingLot, ReserveParkingSlot, User

EXPORTS = {
    "lot": (ParkingLot, ["id", "location_name", "price", "address", "pincode", "available_slot", "occupied_slot", "created_at"]),
    "users": (User, ["id", "name", "email", "pincode", "active"]),
    "bookings": (ReserveParkingSlot, ["id", "u_id", "s_id", "parking_timestamp", "leaving_timestamp", "cost", "vehicle_no"]),
}


def csv_data(kind):
    model, columns = EXPORTS[kind]
    output = StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(columns)
    for record in model.query.order_by(model.id).yield_per(500):
        row = []
        for column in columns:
            value = getattr(record, column)
            if isinstance(value, datetime):
                value = value.isoformat()
            # Prevent user-controlled values becoming spreadsheet formulas.
            if isinstance(value, str) and value.startswith(("=", "+", "-", "@", "\t", "\r", "\n")):
                value = "'" + value
            row.append(value)
        writer.writerow(row)
    return output.getvalue().encode("utf-8-sig")
