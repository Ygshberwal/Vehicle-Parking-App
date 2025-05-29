# Have to change the database, this is temperary db, also think about how to handle roles (in user add attribute of role or another Role table)

from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime


db=SQLAlchemy()

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(10), default="user")  # 'admin' or 'user'

    reservations = db.relationship('Reservation', backref='user', lazy=True)


class Role(db.Model, RoleMixin):
    id = db. Column(db. Integer, primary_key = True)
    name = db. Column(db.String, unique = True, nullable = False)
    description = db.Column(db.String, nullable = False)

class ParkingLot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    price = db.Column(db.Float, nullable=False)
    address = db.Column(db.String(200))
    pincode = db.Column(db.String(10))
    num_spots = db.Column(db.Integer, default=0)

    spots = db.relationship('ParkingSpot', backref='lot', cascade="all, delete-orphan", lazy=True)


class ParkingSpot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lot_id = db.Column(db.Integer, db.ForeignKey('parking_lot.id'), nullable=False)
    status = db.Column(db.String(1), default="A")  # A - Available, O - Occupied

    reservations = db.relationship('Reservation', backref='spot', lazy=True)


class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    spot_id = db.Column(db.Integer, db.ForeignKey('parking_spot.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    parked_at = db.Column(db.DateTime, default=datetime.utcnow)
    left_at = db.Column(db.DateTime, nullable=True)
    cost = db.Column(db.Float, default=0.0)
