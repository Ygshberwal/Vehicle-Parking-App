from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_security import Security, SQLAlchemyUserDatastore
from backend.config import LocalDevelopmentConfig
from backend.models.models import db, User, Role

def createApp():
    app=Flask(__name__)

    app.config.from_object(LocalDevelopmentConfig)

    # model initialize
    db.init_app(app)

    # flask secuirty 
    datastore =  SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore=datastore)
    app.app_context().push()

    db.create_all()
    import backend.models.create_initial_data
    
    return app
app=createApp()

import backend.models
@app.get('/')
def home():
    return '<h1> Hello World </h1>'

if __name__ == '__main__':
    app.run(debug=True)
