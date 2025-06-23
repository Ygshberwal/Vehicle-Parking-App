from celery import shared_task
import time
import flask_excel 
from backend.models.models import ParkingLot, ReserveParkingSlot, User
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
def email_reminder(to, subject, content):                  #just call the send_email function mail_service.py
    send_email(to, subject, content)