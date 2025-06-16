from datetime import datetime
from flask import jsonify, request, current_app as app
from flask_restful import Api, Resource, fields, marshal_with
from flask_security import auth_required, current_user
from backend.models.models import ParkingLot, ParkingSlot, ReserveParkingSlot, User, db

cache = app.cache
api = Api(prefix='/api')

lot_fields = {
    "id" : fields.Integer,
    "location_name" : fields.String,
    "price" : fields.Integer,
    "address" : fields.String,
    "pincode" : fields.Integer,
    # "max_slot" : fields.Integer,
    "available_slot" : fields.Integer,
    "occupied_slot" : fields.Integer,
}

user_fields = {
    "id" : fields.Integer,
    "name" : fields.String,
    "email" : fields.String,
    "active" : fields.Integer
}

booking_fields = {
    'id': fields.Integer,
    'u_id': fields.Integer,
    's_id': fields.Integer,
    'parking_timestamp': fields.DateTime(dt_format='iso8601'),
    'leaving_timestamp': fields.DateTime(dt_format='iso8601'),
    'cost': fields.Integer,
    'vehicle_no': fields.String
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
            current_total_slots = lot.available_slot + lot.occupied_slot

            if new_max_slot > current_total_slots:
            # Add slots
                additional_slots = new_max_slot - current_total_slots
                lot.available_slot += additional_slots

                for _ in range(additional_slots):
                    slot = ParkingSlot(lot_id=lot.id, status="available")
                    db.session.add(slot)

            elif new_max_slot < current_total_slots:
                # Try to remove slots
                slots_to_remove = current_total_slots - new_max_slot

                if slots_to_remove > lot.available_slot:
                    return {"message": "Cannot delete slots that are already occupied"}, 400

                # Remove only from available slots
                removable_slots = ParkingSlot.query.filter_by(
                    lot_id=lot.id, status="available"
                ).limit(slots_to_remove).all()

                for slot in removable_slots:
                    db.session.delete(slot)

                lot.available_slot -= slots_to_remove

            # else: same number of slots → only update metadata

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
            # occupied_slots = ParkingSlot.query.filter_by(lot_id= lot.id).filter(ParkingSlot.status != "available").all()
            if lot.occupied_slot:
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
            available_slot = int(data.get('max_slot'))

            lot = ParkingLot(
                location_name=location_name,
                price=price,
                address=address,
                pincode=pincode,
                available_slot=available_slot,
                occupied_slot =0
            )

            db.session.add(lot)
            db.session.flush()
            
            for _ in range(available_slot):                        #add max_slot slots for a given parking lot automatically
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

class BookSlotAPI(Resource):
    @auth_required('token')
    def post(self, lot_id):
        lot = ParkingLot.query.get(lot_id)
        if not lot:
            return {"message": "Lot not found"}, 404

        if lot.available_slot <= 0:
            return {"message": "No available slots"}, 400

        slot = ParkingSlot.query.filter_by(lot_id = lot.id, status="available").first()
        if not slot:
            return {"message": "Lot not found"}, 404
        
        slot.status = "occupied"
        lot.available_slot-=1
        lot.occupied_slot+=1

        reservation = ReserveParkingSlot(
            u_id = current_user.id,
            s_id = slot.id,
            parking_timestamp = datetime.now()
        )

        db.session.add(reservation)
        db.session.commit()
        return {"message": "Slot booked", "slot_id": slot.id, "parking_timestamp": reservation.parking_timestamp.strftime("%Y-%m-%d %H:%M:%S")}, 201
    

class BookingList(Resource):
    @auth_required('token')
    def get(self, user_id):
        bookings = ReserveParkingSlot.query.filter_by(u_id=user_id).all()

        result = []
        for booking in bookings:
            slot = ParkingSlot.query.get(booking.s_id)
            lot = ParkingLot.query.get(slot.lot_id) if slot else None

            result.append({
                "id": booking.id,
                "u_id": booking.u_id,
                "s_id": booking.s_id,
                "parking_timestamp": booking.parking_timestamp.isoformat(),
                "leaving_timestamp": booking.leaving_timestamp.isoformat() if booking.leaving_timestamp else None,
                "cost": booking.cost,
                "vehicle_no": booking.vehicle_no,
                "lot_name": lot.location_name if lot else "Unknown",
                "lot_address": lot.address if lot else "Unknown",
                "slot_status": slot.status if slot else "Unknown"
            })

        return result, 200


api.add_resource(LotAPI, '/lots/<int:lot_id>')
api.add_resource(LotListAPI, '/lots')
api.add_resource(UserAPI, '/users/<int:user_id>')
api.add_resource(UserListAPI, '/users')
api.add_resource(BookSlotAPI, '/lots/<int:lot_id>/book')
api.add_resource(BookingList, '/user-dashboard/<int:user_id>')

