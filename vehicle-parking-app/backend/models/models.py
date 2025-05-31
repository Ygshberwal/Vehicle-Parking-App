# User, Role, User-Role tables with initital hashedpasswords with flask_security integrated
import uuid
from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime
from sqlalchemy import LargeBinary


db=SQLAlchemy()

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, nullable =  False)
    email = db.Column(db.String, unique = True, nullable = False)
    password = db.Column(db.String, nullable = False)
    dp = db.Column(LargeBinary, nullable = True)
    pincode = db.Column(db.Integer, nullable = True)
    # flask-security specific
    fs_uniquifier = db.Column(db.String, unique = True, nullable = False, default=lambda: str(uuid.uuid4()))
    active = db.Column(db.Boolean, default = True)
    roles = db.Relationship('Role', backref = 'bearers', secondary='user_roles')
    

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, unique = True, nullable  = False)
    description = db.Column(db.String, nullable = False)

class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

# Parking specific columns
class ParkingLot(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    location_name = db.Column(db.String, nullable =  False)
    price = db.Column(db.Integer, nullable =  False)
    address = db.Column(db.String, nullable =  False)
    pincode = db.Column(db.Integer, nullable =  False)
    max_spots = db.Column(db.Integer, nullable =  False)

class ParkingSlot(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    lot_id = db.Column(db.Integer, db.ForeignKey('parking_lot.id'))
    status = db.Column(db.String, nullable =  False)

class ReserveParkingSlot(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    u_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    s_id = db.Column(db.Integer, db.ForeignKey('parking_slot.id'))
    parking_timestamp = db.Column(db.DateTime, index = True, default = datetime.now())
    leaving_timestamp = db.Column(db.DateTime, index = True, nullable = True)
    cost = db.Column(db.Integer, nullable = True)
    vehicle_no = db.Column(db.String, nullable = False)
