from celery.schedules import crontab


def configure_schedule(celery_app):
    from backend.celery.tasks import (
        email_reminder, send_daily_reminder_to_users,
        send_monthly_reports_to_all_users, send_new_lot_alert_to_users,
    )
    celery_app.conf.beat_schedule = {
        "daily test reminder": {
            "task": email_reminder.name,
            "schedule": crontab(hour=19, minute=56),
            "args": ("yogesh@example", "Test Daily Reminder", "<h1>This is your daily parking reminder</h1>"),
        },
        "daily user reminder": {
            "task": send_daily_reminder_to_users.name, "schedule": crontab(hour=17, minute=50),
        },
        "new lot alert": {
            "task": send_new_lot_alert_to_users.name, "schedule": crontab(hour=17, minute=54),
        },
        "monthly reports to all users": {
            "task": send_monthly_reports_to_all_users.name,
            "schedule": crontab(hour=17, minute=50, day_of_month="15"),
        },
    }
