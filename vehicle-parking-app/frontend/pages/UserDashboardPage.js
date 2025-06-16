import BookingCard from '../components/BookingCard.js';

export default {
  props: ['id'],
  components: {
    BookingCard
  },
  template: `
    <div class="container my-5">
    <div class="text-center mb-4">
    <h1 class="fw-bold">User Dashboard</h1>
    <hr class="w-25 mx-auto">
    <h3 class="text-secondary">Your Bookings</h3>
    </div>

    <div v-if="bookings.length">
    <div class="list-group">
        <BookingCard
        v-for="booking in bookings"
        :key="booking.id"
        :id="booking.id"
        :s_id="booking.s_id"
        :parking_timestamp="booking.parking_timestamp"
        :leaving_timestamp="booking.leaving_timestamp"
        :cost="booking.cost"
        :vehicle_no="booking.vehicle_no"
        />
    </div>
    </div>
  `,
  data() {
    return {
      bookings: []
    };
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
