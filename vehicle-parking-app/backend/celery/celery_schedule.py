# adding the schedule here
from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder
celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect              #it is basically a life cycle hook, after configuration and connection this function will auto run 
def setup_periodic_tasks(sender, **kwargs):
    # sending email every 10 second
    # sender.add_periodic_task(10.0, email_reminder.s('yogesh@example', 'Test Email', '<h1> Hello there celery schedule</h1>'))      
    
    # sending email at a specific time, every day
    sender.add_periodic_task(crontab(hour=12, minute=53), email_reminder.s('yogesh@example', 'Time Specific', '<h1> Hello there celery schedule</h1>'), name='daily reminder')      
    
    # sending email at a specific time, on every monday
    sender.add_periodic_task(crontab(hour=12, minute=53, day_of_week='monday'), email_reminder.s('yogesh@example', 'Time Specific', '<h1> Hello there celery schedule</h1>'), name='weekly reminder')      


