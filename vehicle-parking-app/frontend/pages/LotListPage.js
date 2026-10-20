import LotCard from '../components/LotCard.js';
import {api, number} from '../utils/api.js';

export default {
    components: {LotCard},
    data() { return {lots: [], search: '', status: 'all', sort: 'name', page: 1, loading: true, error: ''}; },
    computed: {
        admin() { return this.$store.state.role === 'admin'; },
        available() { return this.lots.filter(lot => lot.available_slot > 0).length; },
        filtered() {
            const query = this.search.trim().toLowerCase();
            const records = this.lots.filter(lot =>
                (this.status === 'all' || (this.status === 'available' ? lot.available_slot > 0 : lot.available_slot === 0)) &&
                `${lot.location_name} ${lot.address} ${lot.pincode}`.toLowerCase().includes(query));
            return records.sort((a, b) => this.sort === 'price' ? a.price - b.price : this.sort === 'availability' ? b.available_slot - a.available_slot : a.location_name.localeCompare(b.location_name));
        },
        visible() { return this.filtered.slice((this.page - 1) * 12, this.page * 12); },
    },
    watch: {search() { this.page = 1; }, status() { this.page = 1; }, sort() { this.page = 1; }},
    mounted() { this.load(); },
    methods: {
        number,
        async load() { this.loading = true; this.error = ''; try { this.lots = await api('/api/lots'); } catch (error) { this.error = error.message; } finally { this.loading = false; } },
        clear() { this.search = ''; this.status = 'all'; },
    },
    template: `<main class="workspace"><PageHeader :eyebrow="admin ? 'Parking management' : 'Find your next space'" title="Parking lots" :description="admin ? 'Manage locations, rates, and availability across your parking network.' : 'Explore locations, compare rates, and find a space that works for you.'"><router-link v-if="admin" to="/add-lot" class="btn btn-primary"><AppIcon name="plus" />Add parking lot</router-link></PageHeader><AppState v-if="loading || error" :loading="loading" :error="error" @retry="load" /><template v-else><div class="toolbar"><div class="filter-tabs" aria-label="Filter parking availability"><button @click="status = 'all'" :aria-pressed="status === 'all'">All lots <span>{{ number(lots.length) }}</span></button><button @click="status = 'available'" :aria-pressed="status === 'available'">Available <span>{{ number(available) }}</span></button><button @click="status = 'full'" :aria-pressed="status === 'full'">Full <span>{{ number(lots.length - available) }}</span></button></div><div class="toolbar-inline"><label class="search-field mb-0"><AppIcon name="search" /><input v-model="search" aria-label="Search parking lots" placeholder="Search by location, address or PIN" type="search"></label><select v-model="sort" class="sort-select" aria-label="Sort parking lots"><option value="name">Name: A–Z</option><option value="price">Price: low to high</option><option value="availability">Most spaces available</option></select></div></div><div v-if="visible.length" class="cards-grid"><LotCard v-for="lot in visible" :key="lot.id" :lot_id="lot.id" :location_name="lot.location_name" :address="lot.address" :pincode="lot.pincode" :price="lot.price" :available_slot="lot.available_slot" :occupied_slot="lot.occupied_slot" :management="admin" /></div><AppState v-else icon="pin" :title="lots.length ? 'No matching parking lots' : 'No parking lots yet'" :description="lots.length ? 'Try a different location or adjust the availability filter.' : 'Parking locations will appear here once they’ve been added.'"><button v-if="lots.length" class="btn btn-outline-secondary" @click="clear">Clear filters</button><router-link v-else-if="admin" class="btn btn-primary" to="/add-lot">Add your first lot</router-link></AppState><AppPagination :page="page" :total="filtered.length" :size="12" @change="page = $event" /></template></main>`,
};
