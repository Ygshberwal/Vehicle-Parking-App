from celery import shared_task
import time
import flask_excel 
from backend.models.models import ParkingLot

@shared_task(ignore_result = False)
def add(x,y):
    time.sleep(10)
    return x+y

@shared_task(ignore_result = False)
def create_csv():
    resource = ParkingLot.query.all()

    column_names = [column.name for column in ParkingLot.__table__.columns]
    csv_out = flask_excel.make_response_from_query_sets(resource, column_names = column_names, file_type='csv')

    with open('./backend/celery/user-downloads/lot.csv', 'wb') as file:
        file.write(csv_out.data)

    return 'lot.csv'