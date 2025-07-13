from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder, send_daily_reminder_to_users, send_monthly_reports_to_all_users, send_new_lot_alert_to_users

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Daily email reminder (for testing or inactive user reminders)
    sender.add_periodic_task(
        crontab(hour=19, minute=56),
        email_reminder.s(
            'yogesh@example',
            'Test Daily Reminder',
            '<h1>This is your daily parking reminder</h1>'
        ),
        name='daily test reminder'
    )
    
    # Daily reminder to all users 
    sender.add_periodic_task(
        crontab(hour=20, minute=14),
        send_daily_reminder_to_users.s(),
        name='daily user reminder'
    )

    # Daily alert if new parking lot added in last 24 hours
    sender.add_periodic_task(
        crontab(hour=20, minute=21),
        send_new_lot_alert_to_users.s(),
        name='new lot alert'
    )

    # Monthly report of user
    sender.add_periodic_task(
        crontab(hour=20, minute=27, day_of_month='13'),
        send_monthly_reports_to_all_users.s(),
        name='monthly reports to all users'
    )