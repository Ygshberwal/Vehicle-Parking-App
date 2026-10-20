import {money, dateTime} from '../utils/api.js';
export default {
    props: {booking: Object, admin: Boolean, username: String, busy: Boolean, disabled: Boolean},
    computed: {
        active() { return !this.booking.leaving_timestamp; },
        duration() { return this.active ? 'In progress' : Math.max(1, Math.ceil((new Date(this.booking.leaving_timestamp) - new Date(this.booking.parking_timestamp)) / 3600000)) + ' hr billed'; },
    },
    methods: {money, dateTime},
    template: `<tr><td class="identity-cell" data-label="Vehicle"><div><span class="vehicle-plate">{{ booking.vehicle_no || 'Not provided' }}</span><span class="record-secondary">Booking #{{ booking.id }}</span></div></td><td v-if="admin" data-label="Driver"><div><span class="record-primary">{{ username || 'User #' + booking.u_id }}</span><span class="record-secondary">User #{{ booking.u_id }}</span></div></td><td data-label="Parking lot"><div><span class="record-primary">{{ booking.lot_name }}</span><span class="record-secondary">Slot #{{ booking.s_id }}</span></div></td><td data-label="Arrival"><div><span class="numeric">{{ dateTime(booking.parking_timestamp) }}</span><span v-if="!active" class="record-secondary">Left {{ dateTime(booking.leaving_timestamp) }}</span></div></td><td data-label="Status"><span class="status-badge" :class="active ? '' : 'muted'">{{ active ? 'Active' : 'Completed' }}</span></td><td data-label="Charge"><div><span v-if="active" class="text-muted">On departure</span><strong v-else class="numeric">{{ money(booking.cost) }}</strong><span class="record-secondary">{{ duration }}</span></div></td><td data-label="Action"><button v-if="active" class="btn btn-outline-secondary btn-sm" :disabled="disabled" @click="$emit('release', booking)" :aria-label="'Release booking ' + booking.id">{{ busy ? 'Releasing…' : 'Release slot' }}</button><span v-else class="record-secondary">Session closed</span></td></tr>`,
};
