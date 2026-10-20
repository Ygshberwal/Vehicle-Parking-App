import BookingCard from '../components/BookingCard.js';
import {api, money, number} from '../utils/api.js';
import {notify, confirmAction} from '../utils/feedback.js';
import {downloadExport} from '../utils/exports.js';

export default {
    props: ['id'], components: {BookingCard},
    data() { return {bookings: [], users: {}, loading: true, error: '', search: '', filter: 'all', sort: 'recent', page: 1, pageSize: window.innerWidth < 768 ? 10 : 25, exporting: false, releasing: null}; },
    computed: {
        admin() { return this.$store.state.role === 'admin'; },
        active() { return this.bookings.filter(booking => !booking.leaving_timestamp).length; },
        charges() { return this.bookings.reduce((sum, booking) => sum + (booking.cost || 0), 0); },
        filtered() {
            const query = this.search.trim().toLowerCase();
            return this.bookings.filter(booking =>
                (this.filter === 'all' || (this.filter === 'active' ? !booking.leaving_timestamp : booking.leaving_timestamp)) &&
                `${booking.id} ${booking.vehicle_no || ''} ${booking.lot_name} ${this.admin ? this.users[booking.u_id] || booking.u_id : ''}`.toLowerCase().includes(query))
                .sort((a, b) => this.sort === 'cost' ? (b.cost || 0) - (a.cost || 0) : this.sort === 'oldest' ? a.parking_timestamp.localeCompare(b.parking_timestamp) : b.parking_timestamp.localeCompare(a.parking_timestamp));
        },
        visible() { return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); },
    },
    watch: {search() { this.page = 1; }, filter() { this.page = 1; }, sort() { this.page = 1; }},
    mounted() { this.load(); window.addEventListener('resize', this.resize); },
    beforeDestroy() { window.removeEventListener('resize', this.resize); },
    methods: {
        money, number,
        resize() { const size = window.innerWidth < 768 ? 10 : 25; if (this.pageSize !== size) { this.pageSize = size; this.page = 1; } },
        async load() {
            this.loading = true; this.error = '';
            try {
                const [bookings, users] = await Promise.all([api('/api/user-dashboard/' + this.id), this.admin ? api('/api/users') : Promise.resolve([])]);
                this.bookings = bookings; this.users = Object.fromEntries(users.map(user => [user.id, user.name]));
            } catch (error) { this.error = error.message; } finally { this.loading = false; }
        },
        async release(booking) {
            if (this.releasing !== null) return;
            if (!await confirmAction({title: 'Ready to leave?', message: 'This ends the parking session for ' + booking.vehicle_no + ' at ' + booking.lot_name + '. Your final charge will be calculated and the space becomes available again.', confirmLabel: 'Release parking slot'})) return;
            this.releasing = booking.id;
            try {
                const data = await api('/api/release-slot/' + booking.id, {method: 'PUT'});
                Object.assign(booking, {leaving_timestamp: data.leaving_timestamp, cost: data.cost});
                notify('Slot released. Final charge: ' + money(data.cost) + '.');
            } catch (error) { notify(error.message, 'error'); } finally { this.releasing = null; }
        },
        async exportBookings() { this.exporting = true; try { await downloadExport('bookings', this.$store.state.auth_token); notify('Your booking export is ready.'); } catch (error) { notify(error.message, 'error'); } finally { this.exporting = false; } },
    },
    template: `
        <main class="workspace">
            <PageHeader :eyebrow="admin ? 'Admin workspace' : 'Your parking activity'"
                :title="admin ? 'Bookings' : 'My bookings'"
                :description="admin ? 'Review parking sessions across every location and driver.' : 'Manage your active parking and keep track of past visits.'">
                <button v-if="admin" class="btn btn-outline-secondary" :disabled="loading || exporting" @click="exportBookings">
                    <AppIcon name="download" />{{ exporting ? 'Preparing export…' : 'Export bookings' }}
                </button>
                <router-link v-else to="/lots" class="btn btn-primary"><AppIcon name="plus" />Find parking</router-link>
            </PageHeader>
            <AppState v-if="loading || error" :loading="loading" :error="error" @retry="load" />
            <template v-else>
                <div class="stats-grid three">
                    <StatCard label="Total bookings" :value="number(bookings.length)" detail="All parking sessions" />
                    <StatCard label="Active sessions" :value="number(active)" detail="Spaces currently occupied" />
                    <StatCard label="Total charges" :value="money(charges)" detail="Completed sessions only" />
                </div>
                <div class="toolbar">
                    <div class="filter-tabs" aria-label="Filter booking status">
                        <button @click="filter = 'all'" :aria-pressed="filter === 'all'">All bookings</button>
                        <button @click="filter = 'active'" :aria-pressed="filter === 'active'">Active <span>{{ number(active) }}</span></button>
                        <button @click="filter = 'completed'" :aria-pressed="filter === 'completed'">Completed</button>
                    </div>
                    <div class="toolbar-inline">
                        <label class="search-field mb-0"><AppIcon name="search" /><input v-model="search" type="search" aria-label="Search bookings" :placeholder="admin ? 'Search vehicle, location or driver' : 'Search vehicle or location'"></label>
                        <select class="sort-select" v-model="sort" aria-label="Sort bookings">
                            <option value="recent">Newest first</option><option value="oldest">Oldest first</option><option value="cost">Highest charge</option>
                        </select>
                    </div>
                </div>
                <div class="surface">
                    <div v-if="visible.length" class="table-wrap">
                        <table class="data-table responsive-table">
                            <caption class="sr-only">{{ admin ? 'All parking bookings' : 'Your parking bookings' }}</caption>
                            <thead><tr><th scope="col">Vehicle</th><th v-if="admin" scope="col">Driver</th><th scope="col">Location</th><th scope="col">Session time</th><th scope="col">Status</th><th scope="col">Charge</th><th scope="col">Action</th></tr></thead>
                            <tbody><BookingCard v-for="booking in visible" :key="booking.id" :booking="booking" :admin="admin" :username="users[booking.u_id]" :busy="releasing === booking.id" :disabled="releasing !== null" @release="release" /></tbody>
                        </table>
                    </div>
                    <AppState v-else icon="calendar" :title="bookings.length ? 'No matching bookings' : 'Your first stop starts here'"
                        :description="bookings.length ? 'Try another search or adjust the status filter.' : 'Book a parking space and your active session and history will appear here.'">
                        <button v-if="bookings.length" class="btn btn-outline-secondary" @click="search = ''; filter = 'all'">Clear filters</button>
                        <router-link v-else class="btn btn-primary" to="/lots">Browse parking lots <AppIcon name="arrow" size="15" /></router-link>
                    </AppState>
                    <AppPagination :page="page" :total="filtered.length" :size="pageSize" @change="page = $event" />
                </div>
            </template>
        </main>
    `,
};
