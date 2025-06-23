export default {
    props :['id'],
    template :`
    <div class="jumbotron">
        <h2>Lot Name: {{lot.location_name}} </h2>
        <p>Lot Address: {{lot.address}} </p>
        <p>Pincode: {{lot.pincode}} </p>
        <hr>
        <p>Price per hour: ₹{{lot.price}} </p>
        <p>Max Capacity: {{lot.available_slot+lot.occupied_slot}} </p>
        <p>Available Slots {{lot.available_slot}} </p>
        <p>Occupied Slots {{lot.occupied_slot}} </p>
        <div v-if="showInput">
            <p>
                <label>Vehicle Number:</label>
                <input v-model="vehicle_number" type="text" placeholder="e.g. MH12AB1234" class="form-control" />
            </p>
            <button 
                class="btn btn-primary"
                @click="confirmBooking"
                :disabled="!vehicle_number.trim()"
            >
                Confirm Booking
            </button>
            <button class="btn btn-secondary ml-2" @click="showInput = false , vehicle_number='' ">Cancel</button>
        </div>

        <div v-else>
            <button 
                class="btn btn-success"
                @click="showInput = true"
                :disabled="lot.available_slot <= 0"
            >
                Book Slot
            </button>
        </div>
    </div>
    `,
    data(){
        return{
            lot : {},
            vehicle_number : "",
            showInput : false,
        }
    },
    async mounted(){
        const res = await fetch(`${location.origin}/api/lots/${this.id}`,{
            headers : {
                "Authentication-Token" : this.$store.state.auth_token
            }
        })
        if (res.ok){
            this.lot = await res.json()
        }
    },
    methods: {
        async confirmBooking(){
            const res = await fetch(`${location.origin}/api/lots/${this.id}/book`,{
            method:"POST",
            headers : {
                "Authentication-Token" : this.$store.state.auth_token,
                "Content-Type": "application/json"
            },
        body: JSON.stringify({
            vehicle_number: this.vehicle_number
        })
        })

        const data = await res.json();

        if (res.ok){
            alert("Booking successfull. Slot ID: " + data.slot_id + " at time " + data.parking_timestamp)
            this.vehicle_number=""
            const refresh = await fetch(`${location.origin}/api/lots/${this.id}`, {
                headers: {
                    "Authentication-Token": this.$store.state.auth_token
                }
            });
            if (refresh.ok) {
                this.lot = await refresh.json();
            }}
            else{
                alert("Booking Failed: "+ data.message)
            }
        }
    }
}