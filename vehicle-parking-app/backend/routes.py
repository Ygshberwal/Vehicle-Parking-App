from flask import current_app as app, jsonify, render_template, request
from flask_security import auth_required
from flask_security.utils import hash_password, verify_password
from backend.models.models import db
import os

datastore = app.security.datastore

@app.route('/')
def home():
    return render_template('index.html')

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
        return jsonify({'token' : user.get_auth_token(), 'email' : user.email, 'role' : user.roles[0].name, 'id' : user.id})
    
    return jsonify({'message' : "wrong password"})


@app.route('/register', methods=['POST'])
def register():
    data =  request.get_json()        # whatever we get from request, we store it in data variable

    email = data.get('email')
    name = data.get('name')
    password =  data.get('password')
    role = data.get('role')

    if not email or not password  or not name or role != 'user':
        return jsonify({"message" : "invalid input"}), 400
    
    user = datastore.find_user(email =  email)

    if user:
        return jsonify({"message" : "user already exists"}), 400

    try:
        datastore.create_user(email = email, name =name, password = hash_password(password), roles = [role])
        db.session.commit()
        return jsonify({"message" : "user created"}), 200
    except: 
        db.session.rollback()
        return jsonify({"message" : "error creating user"}), 400