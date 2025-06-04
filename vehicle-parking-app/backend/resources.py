from flask import jsonify, request, current_app as app
from flask_restful import Api, Resource, fields, marshal_with
from flask_security import auth_required, current_user
from backend.models.models import ParkingLot, db

cache = app.cache
api = Api(prefix='/api')

lot_fields = {
    "id" : fields.Integer,
    "location_name" : fields.String,
    "price" : fields.Integer,
    "address" : fields.String,
    "pincode" : fields.Integer,
    "max_slot" : fields.Integer
}

class LotAPI(Resource):

    @auth_required('token')
    @cache.memoize(timeout = 5)                  # get fxn takes parameter so memoize
    @marshal_with(lot_fields)
    def get(self, lot_id):
        lot = ParkingLot.query.get(lot_id)

        if not lot :
            return {"message" : "Not found"}, 404
        return lot
    
    @auth_required('token')
    def delete(self, lot_id):
        lot = ParkingLot.query.get(lot_id)

        if not lot :
            return {"message" : "Not found"}, 404
        
        if current_user.roles[0] == "admin":            #only delete lot if user is admin
            db.session.delete(lot)
            db.session.commit()
        else:
            return {"message" : "you are not admin"}
        
class LotListAPI(Resource):

    @auth_required('token')
    @cache.cached(timeout = 5, key_prefix = "lot_list")                 # get fxn does not take any parameter so cached
    @marshal_with(lot_fields)
    def get(self):
        lots = ParkingLot.query.all()
        return lots
    
    @auth_required('token')
    def post(self):
        data = request.get_json()

        location_name = data.get('location_name')
        price = data.get('price')
        address = data.get('address')
        pincode = data.get('pincode')
        max_slot = data.get('max_slot')

        lot = ParkingLot( location_name = location_name, price = price, address = address, pincode = pincode, max_slot = max_slot)

        db.session.add(lot)
        db.session.commit()
        return jsonify({"message" : "lot created"}) 
        # can clear cache after pushing 

api.add_resource(LotAPI, '/lots/<int:lot_id>')
api.add_resource(LotListAPI, '/lots')

