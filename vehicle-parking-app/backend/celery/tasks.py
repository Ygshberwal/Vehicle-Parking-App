from datetime import datetime, timedelta
from celery import shared_task
import time
import flask_excel 
from backend.models.models import ParkingLot, ParkingSlot, ReserveParkingSlot, Role, User
from backend.celery.mail_service import send_email

@shared_task(ignore_result = False)
def add(x,y):
    time.sleep(10)
    return x+y

@shared_task(bind=True, ignore_result = False)         #have to use bind=True if we are using self
def lot_csv(self):
    resource = ParkingLot.query.all()

    task_id = self.request.id
    file_name = f'lot_data_{task_id}.csv'
    column_names = [column.name for column in ParkingLot.__table__.columns]
    lot_out = flask_excel.make_response_from_query_sets(resource, column_names = column_names, file_type='csv')

    with open(f'./backend/celery/user-downloads/{file_name}', 'wb') as file:
        file.write(lot_out.data)

    return file_name

@shared_task(ignore_result=False)
def users_csv():
    resource = User.query.all()
    file_name = 'users_data.csv'
    column_names = [column.name for column in User.__table__.columns]
    users_out = flask_excel.make_response_from_query_sets(resource, column_names = column_names, file_type='csv')

    with open(f'./backend/celery/user-downloads/{file_name}', 'wb') as file:
        file.write(users_out.data)

    return file_name

@shared_task(ignore_result=False)
def bookings_csv():
    resource = ReserveParkingSlot.query.all()
    file_name = 'bookings_data.csv'
    column_names = [column.name for column in ReserveParkingSlot.__table__.columns]
    bookings_out = flask_excel.make_response_from_query_sets(resource, column_names = column_names, file_type='csv')

    with open(f'./backend/celery/user-downloads/{file_name}', 'wb') as file:
        file.write(bookings_out.data)

    return file_name

@shared_task(ignore_result = True)
def email_reminder(to, subject, content, attachment_path=None, attachment_name=None):                 #just call the send_email function mail_service.py
    send_email(to, subject, content, attachment_path, attachment_name)


@shared_task
def send_daily_reminder_to_users():
    from backend.models.models import User

    users = User.query.all()

    for user in users:
        email_reminder.delay(
            user.email,
            'Daily Parking Reminder',
            f"<p>Hi {user.name},<br>Don't forget to book your parking spot for today </p>"
        )


@shared_task
def send_new_lot_alert_to_users():
    since = datetime.now() - timedelta(hours=24)
    new_lots = ParkingLot.query.filter(ParkingLot.created_at >= since).all()

    if not new_lots:
        print("No new lots added in last 24 hours.")
        return

    users = User.query.all()
    for user in users:
        email_reminder.delay(
            user.email,
            'New Parking Lot Alert',
            f"""
            <h2>Hi {user.name},</h2>
            <h4>New parking lots have been added in the last 24 hours. Here are some of them:</h4>
            <ul>
                {''.join(f"<li>{lot.location_name} - {lot.address}</li>" for lot in new_lots)}
            </ul>
            <p>Visit your dashboard to explore and book now!</p>
            """
        )


@shared_task
def remind_inactive_users():
    print("Sending test reminder to yogesh@example")
    email_reminder.delay(
        'yogesh@example',
        'Test Parking Reminder',
        '<h3>Hello , this is your test reminder!</h3>'
    )

@shared_task
def send_monthly_reports_to_all_users():
    today = datetime.now()
    start_date = today - timedelta(days=30)

    users = User.query.all()

    for user in users:
        bookings = ReserveParkingSlot.query.filter(ReserveParkingSlot.u_id == user.id).filter(ReserveParkingSlot.parking_timestamp >= start_date).all()

        if not bookings:
            print(f"Skipping {user.email} — No bookings in last 30 days.")
            continue

        lot_counter = {}
        total_cost = 0

        for b in bookings:
            slot = ParkingSlot.query.get(b.s_id)
            if not slot:
                continue
            lot = ParkingLot.query.get(slot.lot_id)
            if not lot:
                continue
            lot_name = lot.location_name
            lot_counter[lot_name] = lot_counter.get(lot_name, 0) + 1
            total_cost += b.cost or 0

        most_used_lot = max(lot_counter, key=lot_counter.get)

        html_report = f"""
            <div style="font-family: Arial, sans-serif; padding: 10px;">
                <h2 style="color: #333;">Monthly Parking Report for {user.name}</h2>
                <table style="border-collapse: collapse; width: 100%;">
                    <tr><td><strong>Total Bookings:</strong></td> <td>{len(bookings)}</td></tr>
                    <tr><td><strong>Most Used Lot:</strong></td> <td>{most_used_lot}</td></tr>
                    <tr><td><strong>Total Spent:</strong></td> <td>₹{total_cost}</td></tr>
                </table>
                <p style="margin-top: 20px;">Thank you for using our parking service!</p>
            </div>
        """

        #send html_report
        email_reminder.delay(
            to=user.email,
            subject='Your Monthly Parking Report',
            content=html_report
        )
        print(f"Sent report to {user.email}")
