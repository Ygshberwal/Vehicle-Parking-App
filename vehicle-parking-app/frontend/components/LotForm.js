import {api} from '../utils/api.js';
import {notify} from '../utils/feedback.js';

export default {
    props: {id: [String, Number], edit: Boolean},
    data() { return {form: {location_name: '', address: '', pincode: '', price: '', max_slot: ''}, occupied: 0, loading: false, pending: false, error: '', loadError: ''}; },
    mounted() { if (this.edit) this.load(); },
    methods: {
        async load() {
            this.loading = true; this.loadError = '';
            try { const lot = await api('/api/lots/' + this.id); this.form = {location_name: lot.location_name, address: lot.address, pincode: lot.pincode, price: lot.price, max_slot: lot.available_slot + lot.occupied_slot}; this.occupied = lot.occupied_slot; }
            catch (error) { this.loadError = error.message; } finally { this.loading = false; }
        },
        async save() {
            if (this.pending) return;
            this.pending = true; this.error = '';
            try {
                await api('/api/lots' + (this.edit ? '/' + this.id : ''), {method: this.edit ? 'PUT' : 'POST', body: this.form});
                notify(this.edit ? 'Parking lot updated successfully.' : 'Your new parking lot is ready.');
                this.$router.push(this.edit ? '/lots/' + this.id : '/lots');
            } catch (error) { this.error = error.message; this.$nextTick(() => this.$refs.error.focus()); }
            finally { this.pending = false; }
        },
    },
    template: `<main class="workspace"><router-link class="breadcrumb-link" :to="edit ? '/lots/' + id : '/lots'"><AppIcon name="back" size="15" />{{ edit ? 'Back to lot details' : 'Back to parking lots' }}</router-link><PageHeader eyebrow="Parking management" :title="edit ? 'Edit parking lot' : 'Add a parking lot'" :description="edit ? 'Update the location, hourly rate, or parking capacity.' : 'Set up a location so drivers can find and book available spaces.'" /><AppState v-if="loading || loadError" :loading="loading" :error="loadError" @retry="load" /><div v-else class="form-grid"><section class="surface form-panel"><h2 class="form-section-title">Location details</h2><p class="form-description">All fields are required. You can update these details later.</p><div v-if="error" class="inline-feedback error" role="alert" ref="error" tabindex="-1"><AppIcon name="info" /><span>{{ error }}</span></div><form @submit.prevent="save"><fieldset :disabled="pending"><div class="field"><label for="lot-name">Location name</label><input id="lot-name" class="form-control" v-model.trim="form.location_name" maxlength="100" placeholder="e.g. Central Market Parking" required></div><div class="field"><label for="lot-address">Street address</label><textarea id="lot-address" class="form-control" v-model.trim="form.address" maxlength="250" placeholder="Building, street, area and city" rows="3" required></textarea></div><div class="field-row"><div class="field"><label for="lot-pin">PIN code</label><input id="lot-pin" class="form-control" v-model="form.pincode" inputmode="numeric" pattern="[1-9][0-9]{5}" maxlength="6" placeholder="110001" required></div><div class="field"><label for="lot-price">Hourly price (₹)</label><input id="lot-price" class="form-control" v-model.number="form.price" type="number" min="1" max="10000" step="1" placeholder="60" required></div></div><div class="field"><label for="lot-capacity">Total parking spaces</label><input id="lot-capacity" class="form-control" v-model.number="form.max_slot" type="number" :min="Math.max(1, occupied)" max="200" step="1" placeholder="20" aria-describedby="capacity-help" required><small id="capacity-help">Between 1 and 200 spaces.{{ edit ? ' Currently occupied: ' + occupied + '. Spaces referenced by booking history cannot be removed.' : '' }}</small></div></fieldset><div class="form-actions"><router-link class="btn btn-outline-secondary" :to="edit ? '/lots/' + id : '/lots'">Cancel</router-link><button class="btn btn-primary" type="submit" :disabled="pending"><span v-if="pending" class="app-spinner" aria-hidden="true"></span>{{ pending ? 'Saving changes…' : edit ? 'Save changes' : 'Create parking lot' }}</button></div></form></section><aside class="surface context-panel"><span class="lot-marker mb-3"><AppIcon name="info" /></span><h2>A few things to keep in mind</h2><ul><li>Use a recognizable name and a complete address to help drivers find this location.</li><li>The hourly price is used to calculate charges when a driver releases their slot.</li><li>Capacity includes both available and occupied spaces.</li><li>Existing bookings and their history are preserved when you update a lot.</li></ul></aside></div></main>`,
};
