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
        <button 
            class="btn btn-success" 
            @click="bookSlot" 
            :disabled="lot.available_slot <= 0"
            >
            Book Slot
        </button>
    </div>
    `,
    data(){
        return{
            lot : {}
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
        async bookSlot(){
            const res = await fetch(`${location.origin}/api/lots/${this.id}/book`,{
            method:"POST",
            headers : {
                "Authentication-Token" : this.$store.state.auth_token,
                "Content-Type": "application/json"
            }
        })

        const data = await res.json();

        if (res.ok){
            alert("Booking successfull. Slot ID: " + data.slot_id + " at time " + data.parking_timestamp)

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