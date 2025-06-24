import BookingCard from '../components/BookingCard.js';

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
    <button v-if="$store.state.role === 'admin'" @click="bookings_create" class="btn btn-sm btn-outline-primary"> Get All Bookings </button> 
    <hr class="w-25 mx-auto">
    </div>

    <div v-if="bookings.length">
    <div class="row py-3 border-bottom align-items-center">
        <div class="col-md-2"><strong>Vehicle No.</strong></div>
        <div class="col-2 text-truncate"><strong>Lot</strong> </div>
        <div class="col-md-3"><strong>Parked at</strong> </div>
        <div class="col-lg-2 col-md-4 col-sm-6 mb-2">
            <strong>Status:</strong>
        </div>
        <div class="col-md-1"><strong>Cost</strong></div>
        <div ><strong>Duration</strong> </div>
        <div >
        
        </div>
    </div>
    <div class="list-group">
        <BookingCard
        v-for="booking in bookings"
        :key="booking.id"
        :id="booking.id"
        :s_id="booking.s_id"
        :lot_name="booking.lot_name"
        :parking_timestamp="booking.parking_timestamp"
        :leaving_timestamp="booking.leaving_timestamp"
        :cost="booking.cost"
        :vehicle_no="booking.vehicle_no"
        :duration="booking.duration"
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
      bookings: []
    };
  },
  methods : {
        async bookings_create(){
            const res = await fetch(location.origin + '/bookings-create', {
                headers : {
                    'Authentication-Token' : this.$store.state.auth_token
                }
            })
            const task_id = (await res.json()).task_id

            const interval = setInterval(async() => {
                const res = await fetch(`${location.origin}/bookings-download/${task_id}` )
                if (res.ok){
                    console.log('data is ready')
                    window.open(`${location.origin}/bookings-download/${task_id}`)
                    clearInterval(interval)
                }

            }, 100)
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
      console.log("Fetched bookings:", data);
      this.bookings = data;
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  }
};
