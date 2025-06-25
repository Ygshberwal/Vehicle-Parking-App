export default {
    name: "BookingCard",
    props: {
        id: Number,
        s_id: Number,
        u_id: Number,
        lot_name: String,
        parking_timestamp: String,
        leaving_timestamp: String,
        cost: Number,
        vehicle_no: String,
    },
    data() {
        return {
            localLeavingTimestamp: this.leaving_timestamp,
            localCost: this.cost,
        };
    },
    computed: {
        status() {
            return this.localLeavingTimestamp ? 'Completed' : 'Active';
        },
        computedDuration(){
            if(!this.localLeavingTimestamp) return null;
            const start = new Date(this.parking_timestamp)
            const end = new Date(this.localLeavingTimestamp)
            return Math.ceil((end-start)/(1000 * 60 * 60))
        }
    },
    watch: {
        leaving_timestamp(newVal) {
            this.localLeavingTimestamp = newVal;
        },
        cost(newVal) {
            this.localCost = newVal;
        }
    },
    methods: {
        async releaseSlot() {
            if (this.status === 'Completed') return;

            try {
            const response = await fetch(`/api/release-slot/${this.id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": this.$store.state.auth_token
                },
            });

            const data = await response.json();

            if (response.ok) {
                this.localLeavingTimestamp = data.leaving_timestamp;
                this.duration = data.parking_timestamp - data.leaving_timestamp
                this.localCost = data.cost;
                alert("Slot released successfully!");
            } else {
                alert(data.message || "Error releasing slot.");
            }
            } catch (err) {
            alert("Failed to release slot: " + err.message);
            }
        }
    },
    template: `
    
    <div class="row py-3 border-bottom text-center align-items-center">
        <div class="col-md-2" v-if="$store.state.role === 'user'">{{ vehicle_no }}</div>
        <div class="col-md-2" v-if="$store.state.role === 'admin'">{{ u_id }}</div>
        <div class="col-2 text-truncate">{{ lot_name }} </div>
        <div class="col-md-3"> {{ new Date(parking_timestamp).toLocaleString() }} </div>
        <div class="col-lg-2 col-md-4 col-sm-6 mb-2">
            <span :class="status === 'Active' ? 'text-success' : 'text-muted'"> {{ status }} </span>
        </div>
        <div class="col-md-1"><strong>₹{{ localCost || 0 }}</strong></div>
        <div class="col-md-2" v-if="status != 'Active'"  >{{ computedDuration}} hours </div>
        <div class="col-md-2" v-if="status === 'Active'">
        <button @click="releaseSlot" class="btn btn-sm btn-outline-success">
            Release
        </button>
        </div>
    </div>
    `
};
