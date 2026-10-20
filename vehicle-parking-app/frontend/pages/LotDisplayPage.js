import {api, money, number} from '../utils/api.js';
import {notify, confirmAction} from '../utils/feedback.js';

export default {
    props: ['id'],
    data() { return {lot: null, loading: true, error: '', vehicle: '', pending: false, deleting: false, bookingError: '', booked: null}; },
    computed: {
        admin() { return this.$store.state.role === 'admin'; },
        total() { return this.lot ? this.lot.available_slot + this.lot.occupied_slot : 0; },
        occupancy() { return this.total ? Math.round(this.lot.occupied_slot / this.total * 100) : 0; },
    },
    mounted() { this.load(); },
    methods: {
        money, number,
        async load() { this.loading = true; this.error = ''; try { this.lot = await api('/api/lots/' + this.id); } catch (error) { this.error = error.message; } finally { this.loading = false; } },
        async book() {
            if (this.pending) return;
            this.pending = true; this.bookingError = ''; this.booked = null;
            try {
                this.booked = await api('/api/lots/' + this.id + '/book', {method: 'POST', body: {vehicle_number: this.vehicle.trim()}});
                this.vehicle = '';
                this.lot = {...this.lot, available_slot: this.lot.available_slot - 1, occupied_slot: this.lot.occupied_slot + 1};
                notify('Your parking space is booked.');
            } catch (error) { this.bookingError = error.message; }
            finally { this.pending = false; }
        },
        async remove() {
            if (!await confirmAction({title: 'Delete this parking lot?', message: 'This removes the location and its unused spaces. Lots with active bookings or booking history cannot be deleted.', confirmLabel: 'Delete lot', danger: true})) return;
            this.deleting = true;
            try { await api('/api/lots/' + this.id, {method: 'DELETE'}); notify('Parking lot deleted.'); this.$router.push('/lots'); }
            catch (error) { notify(error.message, 'error'); } finally { this.deleting = false; }
        },
    },
    template: `<main class="workspace"><router-link to="/lots" class="breadcrumb-link"><AppIcon name="back" size="15" />Back to parking lots</router-link><AppState v-if="loading || error" :loading="loading" :error="error" @retry="load" /><template v-else><PageHeader :eyebrow="'Parking lot #' + lot.id" :title="lot.location_name" description="Location details, current availability, and booking."><template v-if="admin"><button class="btn btn-link-danger" :disabled="deleting" @click="remove">{{ deleting ? 'Deleting…' : 'Delete lot' }}</button><router-link class="btn btn-outline-secondary" :to="'/lots/' + id + '/update-lot'"><AppIcon name="edit" size="16" />Edit details</router-link></template></PageHeader><div class="detail-grid"><section class="surface"><div class="surface-heading"><h2>About this location</h2><span class="status-badge" :class="lot.available_slot ? '' : 'muted'">{{ lot.available_slot ? 'Spaces available' : 'Currently full' }}</span></div><div class="detail-body"><div class="detail-address"><AppIcon name="pin" size="19" /><div>{{ lot.address }}<span class="record-secondary">PIN {{ lot.pincode }}</span></div></div><dl class="detail-facts"><div><dt>Total capacity</dt><dd>{{ number(total) }} spaces</dd></div><div><dt>Available now</dt><dd class="text-success">{{ number(lot.available_slot) }} spaces</dd></div><div><dt>Currently occupied</dt><dd>{{ number(lot.occupied_slot) }} spaces</dd></div><div><dt>Occupancy</dt><dd>{{ occupancy }}%</dd></div></dl><div class="occupancy-track" role="img" :aria-label="occupancy + '% occupied'"><div class="occupancy-fill" :style="{width: occupancy + '%'}"></div></div><p class="record-secondary mt-3 mb-0">Availability can change as other drivers arrive and leave.</p></div></section><section class="surface form-panel booking-panel"><p class="eyebrow">Book your space</p><div class="price-display mb-1">{{ money(lot.price) }} <small>/ hour</small></div><p class="form-description">Billed in whole hours, rounded up when you leave.</p><div v-if="booked" class="inline-feedback" role="status"><AppIcon name="check" /><div>Slot #{{ booked.slot_id }} is booked.<br><router-link :to="'/user-dashboard/' + $store.state.user_id">View your bookings →</router-link></div></div><div v-if="bookingError" class="inline-feedback error" role="alert"><AppIcon name="info" /><span>{{ bookingError }}</span></div><form v-if="lot.available_slot > 0" @submit.prevent="book"><div class="field"><label for="vehicle-number">Vehicle number</label><input id="vehicle-number" class="form-control vehicle-input" v-model="vehicle" placeholder="e.g. DL01AB1234" maxlength="20" required :disabled="pending" autocomplete="off" aria-describedby="vehicle-help"><small id="vehicle-help">Enter the registration number of the vehicle you’re parking.</small></div><button type="submit" class="btn btn-primary" :disabled="pending || !vehicle.trim()"><span v-if="pending" class="app-spinner" aria-hidden="true"></span>{{ pending ? 'Booking your space…' : 'Confirm booking' }}<AppIcon v-if="!pending" name="arrow" size="16" /></button></form><div v-else class="inline-feedback mb-0" role="status"><AppIcon name="info" /><span>This lot is currently full. <router-link to="/lots">Explore other locations</router-link> for an available space.</span></div><p class="record-secondary mt-3 mb-0">Release your slot from Bookings when you leave.</p></section></div></template></main>`,
};
