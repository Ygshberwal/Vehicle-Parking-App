export default {
    name: "LotCard",
    props: {
        lot_id: Number,
        location_name: String,
        address: String,
        pincode: Number,
        price: Number,
        available_slot: { type: Number, default: 0 },
        occupied_slot: { type: Number, default: 0 },
    },
    computed: {
        totalSlots() {
            return this.available_slot + this.occupied_slot;
        },
        usagePercent() {
            if (this.totalSlots === 0) return 0;
            return Math.round((this.occupied_slot / this.totalSlots) * 100);
        }
    },
    template: `
        <div class="card border-0 shadow-sm hover-shadow p-4" 
        style="border-radius: 6px; background-color: #f9fafb; transition: 0.3s ease; min-height: 300px;">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <h4 
                    class="text-primary fw-semibold mb-0"
                    @click="$router.push('/lots/' + lot_id)"
                    style="cursor: pointer;"
                >
                    <i class="bi bi-geo-alt-fill me-2"></i>{{ location_name }}
                </h4>
                <span class="badge bg-light text-dark px-3 py-2 border rounded-pill fs-6">
                    ₹{{ price }}/hr
                </span>
            </div>

            <p class="text-muted mb-2"><i class="bi bi-pin-map-fill me-2"></i>{{ address }}</p>
            <p class="text-muted mb-4 small">Pincode: {{ pincode }}</p>

            <div class="mb-3">
                <div class="small text-muted mb-1">Slot Status</div>
                <div class="progress" style="height: 10px; border-radius: 6px;">
                    <div 
                        class="progress-bar bg-success" 
                        :style="{ width: (100 - usagePercent) + '%' }"
                        role="progressbar"
                        :aria-valuenow="100 - usagePercent"
                        aria-valuemin="0" 
                        aria-valuemax="100"
                    ></div>
                    <div 
                        class="progress-bar bg-danger" 
                        :style="{ width: usagePercent + '%' }" 
                        role="progressbar"
                        :aria-valuenow="usagePercent"
                        aria-valuemin="0" 
                        aria-valuemax="100"
                    ></div>
                </div>
                <div class="mt-2 small">
                    <span class="text-success">{{ available_slot }} Available</span> -
                    <span class="text-danger">{{ occupied_slot }} Occupied</span>
                </div>
            </div>

            <div class="d-grid">
                <button 
                    class="btn btn-outline-primary btn-sm mt-2"
                    style="border-radius: 5px;"
                    @click="$router.push('/lots/' + lot_id)"
                >
                    View Details
                </button>
            </div>
        </div>
    `
}
