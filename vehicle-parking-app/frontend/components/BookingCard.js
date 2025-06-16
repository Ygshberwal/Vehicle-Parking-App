
export default {
    name: "BookingCard",
    props: {
    id: Number,
    s_id: Number,
    lot_name: String,
    parking_timestamp: String,
    leaving_timestamp: String,
    cost: Number,
    vehicle_no: String
    },
    computed: {
    status() {
        return this.leaving_timestamp ? 'Completed' : 'Active';
    }
    },
    template: `
    <div class="row py-3 border-bottom align-items-center">
        <!-- <div class="col-md-2"><strong>Booking ID:</strong> {{ id }}</div> -->
        <div class="col-md-2"><strong>Slot ID:</strong> {{ s_id }}</div>
        <div class="col-2 text-truncate"><strong>Lot:</strong> {{ lot_name }} </div>
        <div class="col-md-3"><strong>Parked at:</strong> {{ new Date(parking_timestamp).toLocaleString() }}</div>
        <div class="col-lg-2 col-md-4 col-sm-6 mb-2">
            <strong>Status:</strong><span :class="status === 'Active' ? 'text-success' : 'text-muted'"> {{ status }} </span>
        </div>
        <!-- <div class="col-md-2"><strong>Vehicle No:</strong> {{ vehicle_no || 'N/A' }}</div> -->
        <div class="col-md-1"><strong>₹{{ cost || 0}}</strong></div>
        <button class="btn btn-sm btn-outline-success">Release</button>
    </div>

    `
};
