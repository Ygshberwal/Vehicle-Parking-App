from datetime import datetime
from flask import current_app as app, jsonify, render_template, request, send_file
from flask_security import auth_required, roles_required
from flask_security.utils import hash_password, verify_password
from backend.models.models import db
from backend.celery.tasks import add, create_csv
from celery.result import AsyncResult
import os

datastore = app.security.datastore
cache = app.cache

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/cache')
@cache.cached(timeout = 5)
def cache():
     return {'time': str(datetime.now() )}

@app.get('/celery')
def celery():
    task = add.delay(10, 20)
    return {'task_id': task.id}

@app.get('/get-celery-data/<id>')
def getData(id):
    result = AsyncResult(id)

    if result.ready():
        return {'result' : result.result}, 200
    else :
        return {'message': 'task not ready'}, 405
    
@app.get('/create-csv')
@auth_required('token')
def createCSV():
    task = create_csv.delay()          #use delay to run it in celery
    return {'task_id': task.id}, 200

@app.route('/get-csv/<id>')
# @auth_required('token')
def getCSV(id):
    result = AsyncResult(id)

    if result.ready():
        return send_file(f'./backend/celery/user-downloads/{result.result}', as_attachment=True), 200
    else:
        return {'message' : 'task not ready'}, 405

@app.route('/debug-template')
def debug_template():
    files = os.listdir(app.template_folder)
    return f"Templates found: {files}"

@app.get('/protected')
@auth_required('token')        # only using token based authentication
def protected():
    return '<h1> only accessible by auth user</h1>'


@app.route('/login', methods=['POST'])
def login():
    data =  request.get_json()        # whatever we get from request, we store it in data variable

    email = data.get('email')
    password =  data.get('password')

    if not email or not password:
        return jsonify({"message" : "invalid input"}), 400
    
    user = datastore.find_user(email =  email)

    if not user:
        return jsonify({"message" : "invalid email"}), 400 
    
    if verify_password(password, user.password):         # flask security feature, handles hashed pass matching implicitly
        return jsonify({'token' : user.get_auth_token(), 'email' : user.email, 'name': user.name, 'role' : user.roles[0].name, 'id' : user.id})
    
    return jsonify({'message' : "wrong password"})


@app.route('/register', methods=['POST'])
def register():
    data =  request.get_json()        # whatever we get from request, we store it in data variable

    email = data.get('email')
    name = data.get('name')
    password =  data.get('password')
    role = data.get('role')
    dp = data.get('dp')
    pincode = data.get('pincode')


    if not email or not password  or not name or role != 'user':
        return jsonify({"message" : "invalid input"}), 400
    
    user = datastore.find_user(email =  email)

    if user:
        return jsonify({"message" : "user already exists"}), 400

    try:
        datastore.create_user(email = email, name =name, password = hash_password(password), roles = [role], dp = dp, pincode = pincode)
        db.session.commit()
        return jsonify({"message" : "user created"}), 200
    except: 
        db.session.rollback()
        return jsonify({"message" : "error creating user"}), 400
    

@app.route('/add-lot', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def addLot():
    data =  request.get_json()        # whatever we get from request, we store it in data variable

    email = data.get('email')
    name = data.get('name')
    password =  data.get('password')
    role = data.get('role')
    dp = data.get('dp')
    pincode = data.get('pincode')


    if not email or not password  or not name or role != 'user':
        return jsonify({"message" : "invalid input"}), 400
    
    user = datastore.find_user(email =  email)

    if user:
        return jsonify({"message" : "user already exists"}), 400

    try:
        datastore.create_user(email = email, name =name, password = hash_password(password), roles = [role], dp = dp, pincode = pincode)
        db.session.commit()
        return jsonify({"message" : "user created"}), 200
    except: 
        db.session.rollback()
        return jsonify({"message" : "error creating user"}), 400
    