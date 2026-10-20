import LotCard from '../components/LotCard.js';
import {api, number} from '../utils/api.js';
import {downloadExport} from '../utils/exports.js';
import {notify} from '../utils/feedback.js';

export default {
    components: {LotCard},
    data() { return {lots: [], loading: true, error: '', exporting: false}; },
    computed: {
        total() { return this.lots.reduce((sum, lot) => sum + lot.available_slot + lot.occupied_slot, 0); },
        occupied() { return this.lots.reduce((sum, lot) => sum + lot.occupied_slot, 0); },
        occupancy() { return this.total ? Math.round(this.occupied / this.total * 100) : 0; },
        busiest() { return [...this.lots].sort((a, b) => b.occupied_slot - a.occupied_slot || a.location_name.localeCompare(b.location_name)).slice(0, 6); },
    },
    mounted() { this.load(); },
    methods: {
        number,
        async load() { this.loading = true; this.error = ''; try { this.lots = await api('/api/lots'); } catch (error) { this.error = error.message; } finally { this.loading = false; } },
        async exportLots() { this.exporting = true; try { await downloadExport('lot', this.$store.state.auth_token); notify('Your parking lot export is ready.'); } catch (error) { notify(error.message, 'error'); } finally { this.exporting = false; } },
    },
    template: `<main class="workspace"><PageHeader eyebrow="Admin workspace" title="Parking overview" description="A clear view of your locations and current parking activity."><button class="btn btn-outline-secondary" :disabled="exporting || loading" @click="exportLots"><AppIcon name="download" />{{ exporting ? 'Preparing export…' : 'Export lots' }}</button><router-link class="btn btn-primary" to="/add-lot"><AppIcon name="plus" />Add parking lot</router-link></PageHeader><AppState v-if="loading || error" :loading="loading" :error="error" @retry="load" /><template v-else><div class="stats-grid"><StatCard label="Parking lots" :value="number(lots.length)" detail="Across your network" icon="pin" /><StatCard label="Total capacity" :value="number(total)" detail="Parking spaces" icon="grid" /><StatCard label="Available now" :value="number(total - occupied)" detail="Ready for a new booking" icon="check" /><StatCard label="Occupancy" :value="occupancy + '%'" :detail="number(occupied) + ' spaces currently in use'" icon="chart" /></div><div class="section-heading"><div><h2>Locations at a glance</h2><p>Ordered by current occupancy.</p></div><router-link class="btn btn-quiet btn-sm" to="/lots">View all lots <AppIcon name="arrow" size="15" /></router-link></div><div v-if="busiest.length" class="cards-grid"><LotCard v-for="lot in busiest" :key="lot.id" :lot_id="lot.id" :location_name="lot.location_name" :address="lot.address" :pincode="lot.pincode" :price="lot.price" :available_slot="lot.available_slot" :occupied_slot="lot.occupied_slot" management /></div><AppState v-else title="Your parking network starts here" description="Add a parking lot to start managing spaces and bookings." icon="pin"><router-link class="btn btn-primary" to="/add-lot">Add parking lot</router-link></AppState></template></main>`,
};
