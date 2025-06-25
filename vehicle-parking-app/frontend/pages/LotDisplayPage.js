export default {
    props :['id'],
    template :`
    <div class="container py-5">
      <div class="bg-white p-5 shadow rounded" style="border-left: 6px solid #0d6efd;">
        <h2 class="mb-3 text-primary fw-semibold">
          <i class="bi bi-geo-alt-fill me-2"></i>{{ lot.location_name }}
        </h2>
        <p class="text-muted"><i class="bi bi-map me-2"></i>{{ lot.address }}</p>
        <p class="text-muted mb-4">Pincode: {{ lot.pincode }}</p>

        <div class="row mb-4 g-4">
          <div class="col-md-4">
            <div class="text-muted small">Price per Hour</div>
            <div class="fs-5 fw-medium">₹{{ lot.price }}</div>
          </div>
          <div class="col-md-4">
            <div class="text-muted small">Max Capacity</div>
            <div class="fs-5 fw-medium">{{ lot.available_slot + lot.occupied_slot }}</div>
          </div>
          <div class="col-md-4">
            <div class="text-muted small">Availability</div>
            <div>
              <div>
              <span class="text-success">{{ lot.available_slot }} Available</span> -
              <span class="text-danger">{{ lot.occupied_slot }} Occupied</span>
            </div>
            </div>
          </div>
        </div>

        <hr class="my-4">


        <div v-if="showInput" class=" pt-4">
          <h5 class="mb-3">Book a Slot</h5>
          <div class="mb-3">
            <label class="form-label">Vehicle Number</label>
            <input 
              v-model="vehicle_number" 
              type="text" 
              class="form-control" 
              placeholder="e.g. MH12AB1234"
            />
          </div>
          <div class="pt-3">
            <button 
              class="btn btn-outline-success px-4"
              @click="confirmBooking"
              :disabled="!vehicle_number.trim()"
            >
              Confirm Booking
            </button>
            <button 
              class="btn btn-outline-secondary px-4"
              @click="showInput = false; vehicle_number='';"
            >
              Cancel
            </button>
          </div>
        </div>

        <div v-else class="pt-3">
          <button 
            class="btn btn-outline-primary px-4"
            @click="showInput = true"
            :disabled="lot.available_slot <= 0"
          >
            Book a Slot
          </button>
        </div>
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