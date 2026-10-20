import BookingCard from '../components/BookingCard.js';
import {downloadExport} from '../utils/exports.js';

export default {
    props: ['id'],
    components: {
      BookingCard
    },
    template: `
        <div class="container my-5">
            <div class="text-center mb-4">
                <h1 class="fw-bold" v-if="$store.state.role === 'user'">User Dashboard</h1>
                <hr class="w-25 mx-auto">
                <h3 class="text-secondary">Your Bookings </h3>  
                <button v-if="$store.state.role === 'admin'" @click="bookings_create" :disabled="exporting" class="btn btn-sm btn-outline-primary"> Export Bookings </button>
                <hr class="w-25 mx-auto">
            </div>

        <div v-if="bookings.length">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <span>{{ bookings.length }} bookings · Page {{ currentPage }} of {{ totalPages }}</span>
                <div>
                    <button class="btn btn-sm btn-outline-secondary" :disabled="currentPage <= 1" @click="currentPage--">Previous</button>
                    <button class="btn btn-sm btn-outline-secondary" :disabled="currentPage >= totalPages" @click="currentPage++">Next</button>
                </div>
            </div>
            <div class="row py-3 fw-bold text-center border-bottom bg-white" style="position: sticky; top: 0; z-index: 1000;">
                <div class="col-md-2" v-if="$store.state.role === 'admin'" @click="sortBy('u_id')">User
                    <span v-if="sortKey === 'u_id'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
                <div class="col-md-2" v-if="$store.state.role === 'user'" @click="sortBy('vehicle_no')">Vehicle No.
                    <span v-if="sortKey === 'vehicle_no'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
                <div class="col-2 text-truncate" @click="sortBy('lot_name')">Lot
                    <span v-if="sortKey === 'lot_name'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
                <div class="col-md-3" @click="sortBy('parking_timestamp')">Parked at
                    <span v-if="sortKey === 'parking_timestamp'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
                <div class="col-lg-2 col-md-4 col-sm-6 mb-2" @click="sortBy('leaving_timestamp')">Status
                    <span v-if="sortKey === 'leaving_timestamp'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
                <div class="col-md-1" @click="sortBy('cost')">Cost
                    <span v-if="sortKey === 'cost'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
                <div class="col-md-2" @click="sortBy('duration')"> Duration
                    <span v-if="sortKey === 'duration'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
            </div>
            <div class="list-group">
                <BookingCard
                v-for="booking in paginatedBookings"
                :key="booking.id"
                :id="booking.id"
                :s_id="booking.s_id"
                :u_id="booking.u_id"
                :lot_name="booking.lot_name"
                :parking_timestamp="booking.parking_timestamp"
                :leaving_timestamp="booking.leaving_timestamp"
                :cost="booking.cost"
                :vehicle_no="booking.vehicle_no"
                />
            </div>
        </div>

        <div v-else class="text-center mt-5">
            <p class="text-muted fs-5">No bookings found.</p>
        </div>
    </div>

    `,
    data() {
        return {
            bookings: [],
            exporting: false,
            currentPage: 1,
            pageSize: 100,
            sortKey : 'parking_timestamp',
            sortOrder : 'desc'
        };
    },
    computed:{
        totalPages() {
            return Math.max(1, Math.ceil(this.bookings.length / this.pageSize));
        },
        paginatedBookings() {
            const start = (this.currentPage - 1) * this.pageSize;
            return this.sortedBookings.slice(start, start + this.pageSize);
        },
        sortedBookings(){
            return this.bookings.slice().sort((a,b) =>{
                let valA = a[this.sortKey];
                let valB = b[this.sortKey];

                if (this.sortKey.includes('timestamp')){
                    valA = new Date(valA).getTime();
                    valB = new Date(valB).getTime();
                }
                if (valA==null) return 1;
                if (valB==null) return -1;

                if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
                return 0;

            });
        }
    },
    methods : {
        async bookings_create(){
            this.exporting = true;
            try {
                await downloadExport('bookings', this.$store.state.auth_token);
            } catch (error) {
                alert(error.message);
            } finally {
                this.exporting = false;
            }
        },

        sortBy(key) {
            this.currentPage = 1;
            if (this.sortKey === key) {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortKey = key;
                this.sortOrder = 'asc';
            }
        },
    },

    async mounted() {
        try {
            const res = await fetch(`/api/user-dashboard/${this.id}`, {
                headers : {
                    'Authentication-Token' : this.$store.state.auth_token
                    }
            });
            const data = await res.json();

            this.bookings = data.map(booking => {
                const parkingTime = new Date(booking.parking_timestamp);
                const leavingTime = booking.leaving_timestamp ? new Date(booking.leaving_timestamp) : null;
                return {
                    ...booking,
                    duration: leavingTime
                        ? Math.ceil((leavingTime - parkingTime) / (1000 * 60 * 60))
                        : null
                };
            });
            console.log("Fetched bookings:", data);
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
        }
    }
};
