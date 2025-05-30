from flask import current_app as app
from backend.models.models import db
from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password


with app.app_context():
    db.create_all()

    userdatastore : SQLAlchemyUserDatastore = app.security.datastore

    userdatastore.find_or_create_role(name = 'admin', description = 'superuser')
    userdatastore.find_or_create_role(name = 'user', description = 'general user')

    if (not userdatastore.find_user(email = 'admin@parking.com')):
        userdatastore.create_user(email = 'admin@parking.com', password = hash_password('admin123'), roles = ['admin'] )
        print("Admin created successfully\nusername: admin@parking.com\npass: admin123")

    if (not userdatastore.find_user(email = 'user01@parking.com')):
        userdatastore.create_user(email = 'user01@parking.com', password = hash_password('user123'), roles = ['user'] ) # for testing
        print("User created successfully\nusername: user01@parking.com\npass: user123")

    db.session.commit()