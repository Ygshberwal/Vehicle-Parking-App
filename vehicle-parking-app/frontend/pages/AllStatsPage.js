import ChartCard from '../components/ChartCard.js';
import {api, money, number} from '../utils/api.js';
import {monthlyEntries, topEntries} from '../utils/charts.js';

export default {
    components: {ChartCard},
    data() { return {stats: {}, loading: true, error: ''}; },
    computed: {
        revenue() { return Object.values(this.stats.revenue_by_month || {}).reduce((a, b) => a + b, 0); },
        bookings() { return Object.values(this.stats.booking_count_by_month || {}).reduce((a, b) => a + b, 0); },
        capacity() { return Object.values(this.stats.lot_occupancy || {}).reduce((sum, lot) => sum + lot.available + lot.occupied, 0); },
        occupied() { return Object.values(this.stats.lot_occupancy || {}).reduce((sum, lot) => sum + lot.occupied, 0); },
        occupancy() { return this.capacity ? Math.round(this.occupied / this.capacity * 100) : 0; },
        occupancyEntries() { return Object.entries(this.stats.lot_occupancy || {}).sort((a, b) => b[1].occupied - a[1].occupied || a[0].localeCompare(b[0])).slice(0, 8).map(([name, lot]) => [name, lot.occupied, lot.available]); },
    },
    mounted() { this.load(); },
    methods: {
        money, number, monthlyEntries, topEntries,
        async load() { this.loading = true; this.error = ''; try { this.stats = await api('/api/all-stats'); } catch (error) { this.error = error.message; } finally { this.loading = false; } },
    },
    template: `<main class="workspace"><PageHeader eyebrow="Admin workspace" title="Parking analytics" description="Understand booking activity, completed-session charges, and location performance."><button class="btn btn-outline-secondary" @click="load" :disabled="loading">Refresh data</button></PageHeader><AppState v-if="loading || error" :loading="loading" :error="error" @retry="load" /><template v-else><div class="stats-grid"><StatCard label="Total charges" :value="money(revenue)" detail="Completed sessions only" icon="chart" /><StatCard label="Total bookings" :value="number(bookings)" detail="All recorded sessions" icon="calendar" /><StatCard label="Current occupancy" :value="occupancy + '%'" :detail="number(occupied) + ' of ' + number(capacity) + ' spaces'" icon="grid" /><StatCard label="Parking locations" :value="number(Object.keys(stats.lot_occupancy || {}).length)" detail="Across the network" icon="pin" /></div><div class="chart-grid"><ChartCard title="Monthly charges" description="Charges recorded against each session’s arrival month." :entries="monthlyEntries(stats.revenue_by_month)" type="line" currency /><ChartCard title="Booking activity" description="The number of parking sessions started each month." :entries="monthlyEntries(stats.booking_count_by_month)" /><ChartCard title="Highest-earning locations" description="Top 8 locations by completed-session charges." :entries="topEntries(stats.revenue_per_lot)" type="horizontalBar" currency /><ChartCard title="Most-used locations" description="Top 8 locations by total number of bookings." :entries="topEntries(stats.lot_usage)" type="horizontalBar" /><ChartCard title="Most active drivers" description="Top 8 names by total parking sessions. Identical names are grouped." :entries="topEntries(stats.user_usage)" type="horizontalBar" /><ChartCard title="Current occupancy by location" description="Top 8 locations by occupied spaces, alongside remaining capacity." :entries="occupancyEntries" type="horizontalBar" stacked /></div></template></main>`,
};
