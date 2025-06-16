export default {
    name: "BookingCard",
    props: {
    id: Number,
    s_id: Number,
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
        <div class="col-md-2"><strong>Booking ID:</strong> {{ id }}</div>
        <div class="col-md-2"><strong>Slot ID:</strong> {{ s_id }}</div>
        <div class="col-md-3"><strong>Parked at:</strong> {{ new Date(parking_timestamp).toLocaleString() }}</div>
        <div class="col-md-2"><strong>Status:</strong> {{ status }}</div>
        <div class="col-md-2"><strong>Vehicle No:</strong> {{ vehicle_no || 'N/A' }}</div>
        <div class="col-md-1"><strong>₹{{ cost }}</strong></div>
    </div>
    `
};
