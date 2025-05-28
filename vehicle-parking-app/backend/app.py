from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from celery import Celery
import os

db = SQLAlchemy()
jwt = JWTManager()
celery = Celery(__name__, broker='redis://localhost:6379/0')

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///parking.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # change for prod

    db.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        from . import routes
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
