from flask import jsonify, request, current_app as app
from flask_restful import Api, Resource, fields, marshal_with
from flask_security import auth_required, current_user
from backend.models.models import ParkingLot, ParkingSlot, User, db

cache = app.cache
api = Api(prefix='/api')

lot_fields = {
    "id" : fields.Integer,
    "location_name" : fields.String,
    "price" : fields.Integer,
    "address" : fields.String,
    "pincode" : fields.Integer,
    "max_slot" : fields.Integer,
    "available_slot" : fields.Integer,
    "occupied_slot" : fields.Integer,
}

user_fields = {
    "id" : fields.Integer,
    "name" : fields.String,
    "email" : fields.String,
    "active" : fields.Integer
}

class LotAPI(Resource):

    @auth_required('token')
    @cache.memoize(timeout = 5)                  # get fxn takes parameter so memoize
    @marshal_with(lot_fields)
    def get(self, lot_id):
        lot = ParkingLot.query.get(lot_id)
        occupied_slots = ParkingSlot.query.filter_by(lot_id= lot.id).filter(ParkingSlot.status != "available").all()
        available_slots = ParkingSlot.query.filter_by(lot_id= lot.id).filter(ParkingSlot.status == "available").all()
        
        lot.available_slot=len(available_slots)
        lot.occupied_slot = len(occupied_slots)

        if not lot :
            return {"message" : "Not found"}, 404
        return lot
    
    @auth_required("token")
    def put(self, lot_id):
        lot = ParkingLot.query.get(lot_id)

        if not lot :
            return {"message" : "Not found"}, 404
        
        if current_user.roles[0] != "admin":            
            return {"message" : "Not authorized"}
        
        try: 
            data = request.get_json()
            app.logger.info(f"PUT /lots received: {data}")

            lot.location_name = data.get('location_name')
            lot.price = int(data.get('price'))
            lot.address = data.get('address')
            lot.pincode = int(data.get('pincode'))

            new_max_slot = int(data.get('max_slot'))
            old_max_slot = lot.max_slot

            if new_max_slot >= old_max_slot:
                additional_slots = new_max_slot - old_max_slot
                for _ in range(additional_slots):
                    slot = ParkingSlot(lot_id= lot.id, status = "available")
                    db.session.add(slot)
            elif new_max_slot < old_max_slot:
                removable_slots = old_max_slot - new_max_slot
                available_slots = ParkingSlot.query.filter_by(lot_id= lot.id, status = "available").limit(removable_slots).all()

                if len(available_slots)< removable_slots:
                    return {"message" :  "Cannot delete slots that are already occupied"}, 400

                for slot in available_slots:
                    db.session.delete(slot)

            lot.max_slot = new_max_slot

            db.session.commit()
            return {"message": "lot updated"}, 201
        
        except Exception as e:
            app.logger.error(f"Error in PUT /lots: {e}")
            return {"error": str(e)}, 500


    @auth_required('token')
    def delete(self, lot_id):
        lot = ParkingLot.query.get(lot_id)

        if not lot :
            return {"message" : "Not found"}, 404
        
        if current_user.roles[0] == "admin":            
            occupied_slots = ParkingSlot.query.filter_by(lot_id= lot.id).filter(ParkingSlot.status != "available").all()
            if occupied_slots:
                return {"message" : "Cannot delete lot, one or more slots are occupied"}, 400
            
            ParkingSlot.query.filter_by(lot_id = lot.id).delete()
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
        try:
            data = request.get_json()
            app.logger.info(f"POST /lots received: {data}")

            location_name = data.get('location_name')
            price = int(data.get('price'))
            address = data.get('address')
            pincode = int(data.get('pincode'))
            max_slot = int(data.get('max_slot'))

            lot = ParkingLot(
                location_name=location_name,
                price=price,
                address=address,
                pincode=pincode,
                max_slot=max_slot
            )

            db.session.add(lot)
            db.session.flush()
            
            for _ in range(max_slot):                        #add max_slot slots for a given parking lot automatically
                slot = ParkingSlot(lot_id = lot.id, status = "available")
                db.session.add(slot)

            db.session.commit()
            cache.delete("lot_list")  # clear cache if needed

            return {"message": "lot created"}, 201
        except Exception as e:
            app.logger.error(f"Error in POST /lots: {e}")
            return {"error": str(e)}, 500

        # can clear cache after pushing 

class UserAPI(Resource):

    @auth_required('token')
    @cache.memoize(timeout = 5)                  # get fxn takes parameter so memoize
    @marshal_with(user_fields)
    def get(self, user_id):
        user = User.query.get(user_id)
        
        if not user :
            return {"message" : "Not found"}, 404
        return user
    
    @auth_required("token")
    @marshal_with(user_fields)
    def put(self, user_id):
        user = User.query.get(user_id)

        if not user:
            return {"message": "User not found"}, 404

        if current_user.roles[0] != "admin":
            return {"message": "Not authorized"}, 403

        try:
            app.logger.info(f"PUT /users received for user_id={user_id}")

            if user.active == 0:
                user.active = 1
            else :
                user.active = 0

            db.session.commit()

            app.logger.info(f"User {user.name} blocked successfully")
            return user, 200  

        except Exception as e:
            app.logger.error(f"Error in PUT /users: {e}")
            return {"error": str(e)}, 500
class UserListAPI(Resource):

    @auth_required('token')
    @cache.cached(timeout = 5, key_prefix = "lot_list")                 # get fxn does not take any parameter so cached
    @marshal_with(user_fields)
    def get(self):
        users = User.query.all()
        return users
    


api.add_resource(LotAPI, '/lots/<int:lot_id>')
api.add_resource(LotListAPI, '/lots')
api.add_resource(UserAPI, '/users/<int:user_id>')
api.add_resource(UserListAPI, '/users')

