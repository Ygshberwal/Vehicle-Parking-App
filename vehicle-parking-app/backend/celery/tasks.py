from celery import shared_task
import time
import flask_excel 
from backend.models.models import ParkingLot

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