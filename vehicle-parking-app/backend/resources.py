from collections import defaultdict
from datetime import datetime
from math import ceil
from flask import jsonify, request, current_app as app
from flask_restful import Api, Resource, fields, marshal, marshal_with
from flask_security import auth_required, current_user, roles_required
from backend.models.models import ParkingLot, ParkingSlot, ReserveParkingSlot, Role, User, db
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError

from backend.extensions import cache
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


def validated_lot_data():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ValueError("Missing lot details")
    name, address = data.get("location_name"), data.get("address")
    if not isinstance(name, str) or not 1 <= len(name.strip()) <= 100:
        raise ValueError("Invalid name")
    if not isinstance(address, str) or not 1 <= len(address.strip()) <= 250:
        raise ValueError("Invalid address")
    price, pincode, capacity = int(data.get("price")), int(data.get("pincode")), int(data.get("max_slot"))
    if not 1 <= price <= 10000 or not 100000 <= pincode <= 999999 or not 1 <= capacity <= 200:
        raise ValueError("Invalid price, PIN or capacity")
    return dict(location_name=name.strip(), address=address.strip(), price=price, pincode=pincode, max_slot=capacity)


class LotAPI(Resource):

    @auth_required('token')
    @cache.memoize(timeout = 5)                  # get fxn takes parameter so memoize
    def get(self, lot_id):
        lot = db.session.get(ParkingLot, lot_id)

        if not lot :
            return {"message" : "Not found"}, 404
        return marshal(lot, lot_fields)
    
    @auth_required("token")
    @roles_required("admin")
    def put(self, lot_id):
        lot = db.session.get(ParkingLot, lot_id)

        if not lot :
            return {"message" : "Not found"}, 404
        
        try: 
            data = validated_lot_data()

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
                    db.session.rollback()
                    return {"message": "Cannot delete slots that are already occupied"}, 400

                # Remove only from available slots
                removable_slots = ParkingSlot.query.filter_by(
                    lot_id=lot.id, status="available"
                ).filter(~ParkingSlot.id.in_(db.select(ReserveParkingSlot.s_id))).limit(slots_to_remove).all()

                if len(removable_slots) < slots_to_remove:
                    db.session.rollback()
                    return {"message": "Cannot remove slots referenced by booking history"}, 400

                for slot in removable_slots:
                    db.session.delete(slot)

                lot.available_slot -= slots_to_remove

            # else: same number of slots → only update metadata

            db.session.commit()
            cache.delete("lot_list")
            cache.delete_memoized(LotAPI.get)
            return {"message": "lot updated"}, 201

        except (ValueError, TypeError):
            db.session.rollback()
            return {"message": "Provide a name, address, six-digit PIN, positive price and 1–200 slots"}, 400
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Error in PUT /lots: {e}")
            return {"message": "Unable to update lot"}, 500


    @auth_required('token')
    @roles_required("admin")
    def delete(self, lot_id):
        lot = db.session.get(ParkingLot, lot_id)

        if not lot :
            return {"message" : "Not found"}, 404
        
        if current_user.has_role("admin"):
            # occupied_slots = ParkingSlot.query.filter_by(lot_id= lot.id).filter(ParkingSlot.status != "available").all()
            if lot.occupied_slot:
                return {"message" : "Cannot delete lot, one or more slots are occupied"}, 400
            
            history = ReserveParkingSlot.query.join(ParkingSlot, ReserveParkingSlot.s_id == ParkingSlot.id).filter(ParkingSlot.lot_id == lot.id).first()
            if history:
                return {"message": "Cannot delete a lot referenced by booking history"}, 400
            ParkingSlot.query.filter_by(lot_id = lot.id).delete()
            db.session.delete(lot)
            db.session.commit()
            cache.delete("lot_list")
            cache.delete_memoized(LotAPI.get)
            return {"message": "Lot deleted"}, 200
        else:
            return {"message" : "you are not admin"}, 403
        
class LotListAPI(Resource):

    @auth_required('token')
    @cache.cached(timeout = 5, key_prefix = "lot_list")                 # get fxn does not take any parameter so cached
    @marshal_with(lot_fields)
    def get(self):
        lots = ParkingLot.query.all()
        return lots
    
    @auth_required('token')
    @roles_required("admin")
    def post(self):
        try:
            data = validated_lot_data()
            if app.config["APP_ENV"] == "demo" and ParkingLot.query.count() >= app.config["DEMO_MAX_LOTS"]:
                return {"message": "The public demo lot limit has been reached"}, 409

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
        except (ValueError, TypeError):
            db.session.rollback()
            return {"message": "Provide a name, address, six-digit PIN, positive price and 1–200 slots"}, 400
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Error in POST /lots: {e}")
            return {"message": "Unable to create lot"}, 500

        # can clear cache after pushing 

class UserAPI(Resource):

    @auth_required('token')
    def get(self, user_id):
        if not current_user.has_role("admin") and current_user.id != user_id:
            return {"message": "Access denied"}, 403
        user = db.session.get(User, user_id)
        
        if not user :
            return {"message" : "Not found"}, 404
        return marshal(user, user_fields)
    
    @auth_required("token")
    @roles_required("admin")
    def put(self, user_id):
        user = db.session.get(User, user_id)

        if not user:
            return {"message": "User not found"}, 404

        if user.has_role("admin"):
            return {"message": "Admin accounts cannot be blocked"}, 400

        try:
            app.logger.info(f"PUT /users received for user_id={user_id}")

            if user.active == 0:
                user.active = 1
            else :
                user.active = 0

            db.session.commit()
            cache.delete("users_list")

            app.logger.info(f"User {user.name} blocked successfully")
            return marshal(user, user_fields), 200

        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Error in PUT /users: {e}")
            return {"message": "Unable to update user"}, 500

class UserListAPI(Resource):
    @auth_required('token')
    @roles_required("admin")
    @cache.cached(timeout = 5, key_prefix = "users_list")                 # get fxn does not take any parameter so cached
    @marshal_with(user_fields)
    def get(self):
        users = User.query.filter(~User.roles.any(Role.name == 'admin')).options(joinedload(User.roles)).all()

        return users

class BookSlotAPI(Resource):
    @auth_required('token')
    def post(self, lot_id):
        data = request.get_json(silent=True) or {}
        if not isinstance(data, dict):
            return {"message": "Provide a vehicle number"}, 400
        vehicle_number = data.get("vehicle_number")

        if not isinstance(vehicle_number, str) or not 1 <= len(vehicle_number.strip()) <= 20:
            return {"message": "Vehicle number is required"}, 400

        vehicle_number = vehicle_number.strip().upper()

        if app.config["APP_ENV"] == "demo" and ReserveParkingSlot.query.count() >= app.config["DEMO_MAX_BOOKINGS"]:
            return {"message": "The public demo booking limit has been reached"}, 409
        lot = ParkingLot.query.filter_by(id=lot_id).with_for_update().first()
        if not lot:
            return {"message": "Lot not found"}, 404

        existing_reservation = (
            db.session.query(ReserveParkingSlot)
            .filter(
                ReserveParkingSlot.vehicle_no == vehicle_number,
                ReserveParkingSlot.leaving_timestamp == None
            )
            .first()
        )
        if existing_reservation:
            return {"message": "This vehicle is already parked"}, 400

        if lot.available_slot <= 0:
            return {"message": "No available slots"}, 400

        slot = ParkingSlot.query.filter_by(lot_id=lot.id, status="available").first()
        if not slot:
            return {"message": "Lot not found"}, 404

        slot.status = "occupied"
        lot.available_slot -= 1
        lot.occupied_slot += 1

        reservation = ReserveParkingSlot(
            u_id=current_user.id,
            s_id=slot.id,
            parking_timestamp=datetime.now(),
            vehicle_no=vehicle_number
        )

        db.session.add(reservation)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {"message": "This vehicle or slot was just booked. Refresh and try again."}, 409
        cache.delete("lot_list")
        cache.delete_memoized(LotAPI.get)

        return {
            "message": "Slot booked",
            "slot_id": slot.id,
            "parking_timestamp": reservation.parking_timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }, 201

class BookingList(Resource):
    @auth_required('token')
    def get(self, user_id):
        if current_user.has_role("admin"):
            bookings = ReserveParkingSlot.query.all()
        else:
            if current_user.id != user_id:
                return {"message": "Access denied"}, 403
            bookings = ReserveParkingSlot.query.filter_by(u_id=user_id).all()

        result = []
        slots = {slot.id: slot for slot in ParkingSlot.query.all()}
        lots = {lot.id: lot for lot in ParkingLot.query.all()}
        for booking in bookings:
            slot = slots.get(booking.s_id)
            lot = lots.get(slot.lot_id) if slot else None

            parking_ts = booking.parking_timestamp

            result.append({
                "id": booking.id,
                "u_id": booking.u_id,
                "s_id": booking.s_id,
                "parking_timestamp": parking_ts.isoformat(),
                "leaving_timestamp": booking.leaving_timestamp.isoformat() if booking.leaving_timestamp else None,
                "cost": booking.cost,
                "vehicle_no": booking.vehicle_no,
                "lot_name": lot.location_name if lot else "Unknown",
                "lot_address": lot.address if lot else "Unknown",
                "slot_status": slot.status if slot else "Unknown",
                "_is_active": booking.leaving_timestamp is None,
                "_parking_ts": parking_ts,  # for sorting
            })

        # Sort: Active bookings first, then by latest parking timestamp
        result.sort(
            key=lambda x: (
                not x["_is_active"],                # Active first (False comes before True)
                -x["_parking_ts"].timestamp()       # Most recent timestamp first
            )
        )

        for item in result:
            del item["_is_active"]
            del item["_parking_ts"]

        return result, 200

class ReleaseSlotAPI(Resource):
    @auth_required('token')
    def put(self, booking_id):
        booking = ReserveParkingSlot.query.filter_by(id=booking_id).with_for_update().first()

        if not booking or booking.leaving_timestamp:
            return {"message": "Invalid or already released booking."}, 400

        if not current_user.has_role("admin") and booking.u_id != current_user.id:
            return {"message": "Access denied"}, 403


        # To get rate: ReserveParkingSlot -> ParkingSlot -> ParkingLot(rate)
        slot = db.session.get(ParkingSlot, booking.s_id)
        if not slot:
            return {"message": "Slot not found."}, 404

        lot = ParkingLot.query.filter_by(id=slot.lot_id).with_for_update().first()
        if not lot:
            return {"message": "Lot not found."}, 404

        # Duration in hours
        booking.leaving_timestamp = datetime.now()
        duration = ceil((booking.leaving_timestamp - booking.parking_timestamp).total_seconds() / 3600)
        booking.cost = int(duration * lot.price)

        # Free the slot (optional)
        slot.status = 'available'
        lot.available_slot += 1
        lot.occupied_slot -= 1

        db.session.commit()
        cache.delete("lot_list")
        cache.delete_memoized(LotAPI.get)

        return {
            "message": "Slot released successfully.",
            "leaving_timestamp": booking.leaving_timestamp.isoformat(),
            "cost": booking.cost
        }

class UserStatsAPI(Resource):
    @auth_required('token')
    def get(self, user_id):
        if not current_user.has_role("admin") and current_user.id != user_id:
            return {"message": "Access denied"}, 403
        bookings = ReserveParkingSlot.query.filter_by(u_id=user_id).all()

        monthly_cost = defaultdict(int)
        lot_usage = defaultdict(int)
        slots = {slot.id: slot for slot in ParkingSlot.query.all()}
        lots = {lot.id: lot for lot in ParkingLot.query.all()}

        for booking in bookings:
            if booking.parking_timestamp:
                month = booking.parking_timestamp.strftime('%Y-%m')
                monthly_cost[month] += booking.cost or 0

            slot = slots.get(booking.s_id)
            lot = lots.get(slot.lot_id) if slot else None
            if lot:
                lot_usage[lot.location_name] += 1

        result = {
            "raw_bookings": [
                {
                    "id": b.id,
                    "cost": b.cost,
                    "vehicle_no": b.vehicle_no,
                    "parking_timestamp": b.parking_timestamp.isoformat(),
                    "leaving_timestamp": b.leaving_timestamp.isoformat() if b.leaving_timestamp else None
                } for b in bookings
            ],
            "monthly_cost": monthly_cost,
            "lot_usage": lot_usage
        }

        return result
    
class AllStatsAPI(Resource):
    @auth_required('token')
    def get(self):
        if not current_user.has_role('admin'):
            return {"error": "Access denied"}, 403

        bookings = ReserveParkingSlot.query.all()
        lots = ParkingLot.query.all()
        users = User.query.all()
        slots_by_id = {slot.id: slot for slot in ParkingSlot.query.all()}
        lots_by_id = {lot.id: lot for lot in lots}
        users_by_id = {user.id: user for user in users}

        revenue_by_month = defaultdict(int)
        booking_count_by_month = defaultdict(int)
        revenue_per_lot = defaultdict(int)
        lot_usage = defaultdict(int)
        user_usage = defaultdict(int)

        for b in bookings:
            if not b.parking_timestamp:
                continue
            month = b.parking_timestamp.strftime('%Y-%m')
            revenue_by_month[month] += b.cost or 0
            booking_count_by_month[month] += 1

            slot = slots_by_id.get(b.s_id)
            lot = lots_by_id.get(slot.lot_id) if slot else None
            if lot:
                revenue_per_lot[lot.location_name] += b.cost or 0
                lot_usage[lot.location_name] += 1

            user = users_by_id.get(b.u_id)
            if user:
                user_usage[user.name] += 1

        lot_occupancy = {
            lot.location_name: {
                "available": lot.available_slot,
                "occupied": lot.occupied_slot
            } for lot in lots
        }

        return {
            "revenue_by_month": revenue_by_month,
            "booking_count_by_month": booking_count_by_month,
            "revenue_per_lot": revenue_per_lot,
            "lot_usage": lot_usage,
            "user_usage": user_usage,
            "lot_occupancy": lot_occupancy
        }

api.add_resource(LotAPI, '/lots/<int:lot_id>')
api.add_resource(LotListAPI, '/lots')
api.add_resource(UserAPI, '/users/<int:user_id>')
api.add_resource(UserListAPI, '/users')
api.add_resource(BookSlotAPI, '/lots/<int:lot_id>/book')
api.add_resource(BookingList, '/user-dashboard/<int:user_id>')
api.add_resource(ReleaseSlotAPI, '/release-slot/<int:booking_id>')
api.add_resource(UserStatsAPI, '/user-stats/<int:user_id>')
api.add_resource(AllStatsAPI, '/all-stats')
