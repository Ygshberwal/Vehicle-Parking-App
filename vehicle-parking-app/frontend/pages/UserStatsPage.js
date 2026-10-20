import ChartCard from '../components/ChartCard.js';
import {api, money, number} from '../utils/api.js';
import {monthlyEntries, topEntries} from '../utils/charts.js';

export default {
    props: ['id'], components: {ChartCard},
    data() { return {stats: {}, loading: true, error: ''}; },
    computed: {
        bookings() { return this.stats.raw_bookings || []; },
        completed() { return this.bookings.filter(booking => booking.leaving_timestamp); },
        charges() { return this.completed.reduce((sum, booking) => sum + (booking.cost || 0), 0); },
        monthlyVisits() { const data = {}; this.bookings.forEach(booking => { const month = booking.parking_timestamp.slice(0, 7); data[month] = (data[month] || 0) + 1; }); return data; },
        admin() { return this.$store.state.role === 'admin'; },
    },
    mounted() { this.load(); },
    methods: {
        money, number, monthlyEntries, topEntries,
        async load() { this.loading = true; this.error = ''; try { this.stats = await api('/api/user-stats/' + this.id); } catch (error) { this.error = error.message; } finally { this.loading = false; } },
    },
    template: `<main class="workspace"><router-link v-if="admin" :to="'/users/' + id" class="breadcrumb-link"><AppIcon name="back" size="15" />Back to user details</router-link><PageHeader :eyebrow="admin ? 'Activity for user #' + id : 'Your parking activity'" :title="admin ? 'Driver insights' : 'My parking insights'" description="A simple breakdown of parking visits, locations, and expenses."><router-link v-if="!admin" class="btn btn-outline-secondary" :to="'/user-dashboard/' + $store.state.user_id">View bookings <AppIcon name="arrow" size="15" /></router-link></PageHeader><AppState v-if="loading || error" :loading="loading" :error="error" @retry="load" /><template v-else><div class="stats-grid"><StatCard label="Total visits" :value="number(bookings.length)" detail="All parking sessions" icon="calendar" /><StatCard label="Total charges" :value="money(charges)" detail="Completed sessions only" icon="chart" /><StatCard label="Average charge" :value="money(completed.length ? charges / completed.length : 0)" detail="Per completed session" icon="clock" /><StatCard label="Locations visited" :value="number(Object.keys(stats.lot_usage || {}).length)" detail="Distinct parking lots" icon="pin" /></div><div v-if="bookings.length" class="chart-grid"><ChartCard title="Monthly parking expenses" description="Completed-session charges, grouped by arrival month." :entries="monthlyEntries(stats.monthly_cost)" currency /><ChartCard title="Visits over time" description="The number of sessions started each month." :entries="monthlyEntries(monthlyVisits)" type="line" /><ChartCard title="Favorite parking locations" description="Up to 8 most-visited locations, ordered by number of visits." :entries="topEntries(stats.lot_usage)" type="horizontalBar" wide /></div><div v-else class="surface"><AppState icon="chart" title="Insights start with your first visit" description="Once a parking session is recorded, visit patterns and expenses will appear here."><router-link v-if="!admin" class="btn btn-primary" to="/lots">Find a parking space</router-link></AppState></div></template></main>`,
};
