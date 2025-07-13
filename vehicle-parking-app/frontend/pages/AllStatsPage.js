export default {
    name: "AdminStatsPage",
    template: `
    <div class="container my-5">
    <div class="text-center mb-4">
        <hr class="w-25 mx-auto">
        <h1 class="fw-bold">Parking Overview Dashboard</h1>
        <hr class="w-25 mx-auto">
    </div><br>

    <div v-if="Object.keys(stats.revenue_by_month || {}).length" class="mb-5">
        <canvas id="revenueChart" height="120"></canvas>
        <h4 class="text-center">Monthly Revenue</h4>
    </div><br>

    <div v-if="Object.keys(stats.booking_count_by_month || {}).length" class="mb-5">
        <canvas id="bookingChart" height="120"></canvas>
        <h4 class="text-center">Bookings Per Month</h4>
    </div><br>

    <div v-if="Object.keys(stats.revenue_per_lot || {}).length" class="mb-5">
        <canvas id="lotRevenueChart" height="120"></canvas>
        <h4 class="text-center">Revenue Per Parking Lot</h4>
    </div><br>

    <div v-if="Object.keys(stats.lot_usage || {}).length" class="mb-5">
        <canvas id="lotUsageChart" height="120"></canvas>
        <h4 class="text-center">Most Used Parking Lots</h4>
    </div><br>

    <div v-if="Object.keys(stats.user_usage || {}).length" class="mb-5">
        <canvas id="userChart" height="120"></canvas>
        <h4 class="text-center">Most Active Users</h4>
    </div><br>

    <div v-if="Object.keys(stats.lot_occupancy || {}).length" class="mb-5">
        <canvas id="occupancyChart" height="120"></canvas>
        <h4 class="text-center">Current Lot Occupancy</h4>
    </div>

    <div v-if="noData" class="text-center mt-5">
        <p class="text-muted fs-5">No statistics available yet.</p>
    </div>
</div>

    `,
    data() {
        return {
            noData: false,
            stats: {}
        };
    },
    mounted() {
        fetch('/api/all-stats', {
            headers: {
                'Authentication-Token': this.$store.state.auth_token
            }
        })
        .then(res => res.json())
        .then(data => {
            if (!data || Object.keys(data).length === 0) {
                this.noData = true;
                return;
            }
            this.stats = data;

            this.$nextTick(() => {
            if (document.getElementById('revenueChart')) {
                this.drawBarChart('revenueChart', data.revenue_by_month, 'Revenue (₹)', '#4CAF50');
            }
            if (document.getElementById('bookingChart')) {
                this.drawLineChart('bookingChart', data.booking_count_by_month, 'Bookings');
            }
            if (document.getElementById('lotUsageChart')) {
                this.drawPieChart('lotUsageChart', data.lot_usage, 'Usage by Lot');
            }
            if (document.getElementById('lotRevenueChart')) {
                this.drawBarChart('lotRevenueChart', data.revenue_per_lot, 'Revenue (₹)', '#2196F3');
            }
            if (document.getElementById('userChart')) {
                this.drawHorizontalBarChart('userChart', data.user_usage, 'Bookings');
            }
            if (document.getElementById('occupancyChart')) {
                this.drawStackedBarChart('occupancyChart', data.lot_occupancy);
            }
        });

        })
        .catch(err => {
            console.error("Failed to fetch admin stats:", err);
            this.noData = true;
        });
    },
    methods: {
        drawBarChart(id, data, label, color) {
            new Chart(document.getElementById(id).getContext('2d'), {
                type: 'bar',
                data: {
                    labels: Object.keys(data),
                    datasets: [{
                        label,
                        data: Object.values(data),
                        backgroundColor: color,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
                }
            });
        },
        drawLineChart(id, data, label) {
            new Chart(document.getElementById(id).getContext('2d'), {
                type: 'line',
                data: {
                    labels: Object.keys(data),
                    datasets: [{
                        label,
                        data: Object.values(data),
                        borderColor: '#9C27B0',
                        fill: false,
                        tension: 0.3
                    }]
                },
                options: { responsive: true }
            });
        },
        drawPieChart(id, data, label) {
            new Chart(document.getElementById(id).getContext('2d'), {
                type: 'pie',
                data: {
                    labels: Object.keys(data),
                    datasets: [{
                        label,
                        data: Object.values(data),
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9C27B0']
                    }]
                },
                options: { responsive: true }
            });
        },
        drawHorizontalBarChart(id, data, label) {
            new Chart(document.getElementById(id).getContext('2d'), {
                type: 'horizontalBar',
                data: {
                    labels: Object.keys(data),
                    datasets: [{
                        label,
                        data: Object.values(data),
                        backgroundColor: '#FF9800'
                    }]
                },
                options: { responsive: true }
            });
        },
        drawStackedBarChart(id, data) {
            const labels = Object.keys(data);
            const occupied = labels.map(lot => data[lot].occupied);
            const available = labels.map(lot => data[lot].available);

            new Chart(document.getElementById(id).getContext('2d'), {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        { label: 'Occupied', data: occupied, backgroundColor: '#f44336' },
                        { label: 'Available', data: available, backgroundColor: '#4CAF50' }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        xAxes: [{ stacked: true }],
                        yAxes: [{ stacked: true }]
                    }
                }
            });
        }
    }
}
