# mail_service.py

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_SERVER = "localhost"
SMTP_PORT = 1025
SENDER_EMAIL = "admin@example"

def send_email(to, subject, content, attachment_path=None, attachment_name=None):
    msg = MIMEMultipart()
    msg['To'] = to
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL

    # Attach HTML content
    msg.attach(MIMEText(content, 'html'))

    # Send via local SMTP (MailHog)
    with smtplib.SMTP(host=SMTP_SERVER, port=SMTP_PORT) as client:
        client.send_message(msg)
        client.quit()
