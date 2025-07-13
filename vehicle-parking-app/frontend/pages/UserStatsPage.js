
export default {
    props: ['id'],
    template: `
    <div class="container my-5">
        <div class="text-center mb-4">
            <hr class="w-25 mx-auto">
            <h1 class="fw-bold">Your Parking Statistics</h1>
            <hr class="w-25 mx-auto">
        </div><br>

        <div v-if="Object.keys(monthlyCost).length" class="mb-5">
            <canvas id="monthlyCostChart" height="120" v-if="Object.keys(monthlyCost).length"></canvas>
            <h4 class="text-center">Monthly Spending</h4>
        </div><br>
        
        <div v-if="Object.keys(lotUsage).length" class="mb-5">
            <canvas id="lotUsageChart" height="120" v-if="Object.keys(lotUsage).length"></canvas>
            <h4 class="text-center">Most Used Parking Lots</h4>
        </div><br>

        <div v-if="Object.keys(monthlyVisitCount).length" class="mb-5">
            <canvas id="visitChart" height="120" v-if="Object.keys(monthlyVisitCount).length"></canvas>
            <h4 class="text-center">Visits Per Month</h4>
        </div>

        <div v-if="noData" class="text-center mt-5">
            <p class="text-muted fs-5">No statistics available yet.</p>
        </div>
    </div>
    `,
    data() {
        return {
            monthlyCost: {},
            lotUsage: {},
            monthlyVisitCount: {},
            noData: false
        };
    },
    mounted() {
        fetch(`/api/user-stats/${this.$route.params.id}`, {
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

            this.monthlyCost = data.monthly_cost || {};
            this.lotUsage = data.lot_usage || {};
            this.monthlyVisitCount = this.calculateMonthlyVisits(data.raw_bookings || []);

            this.$nextTick(() => {
                if (Object.keys(this.monthlyCost).length) {
                    this.renderMonthlyCostChart(this.monthlyCost);
                }
                if (Object.keys(this.lotUsage).length) {
                    this.renderLotUsageChart(this.lotUsage);
                }
                if (Object.keys(this.monthlyVisitCount).length) {
                    this.renderVisitChart(this.monthlyVisitCount);
                }
            });
        })
        .catch(err => {
            console.error("Failed to fetch stats:", err);
            this.noData = true;
        });
    },

    methods: {
        calculateMonthlyVisits(bookings) {
            const visits = {};
            for (const b of bookings) {
                if (b.parking_timestamp) {
                    const month = b.parking_timestamp.slice(0, 7); // 'YYYY-MM'
                    visits[month] = (visits[month] || 0) + 1;
                }
            }
            return visits;
        },
        renderMonthlyCostChart(data) {
            const ctx = document.getElementById('monthlyCostChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(data),
                    datasets: [{
                        label: '₹ Spent',
                        data: Object.values(data),
                        backgroundColor: '#42A5F5',
                        borderRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Monthly Spending (₹)' }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 50 }
                        }
                    }
                }
            });
        },
        renderLotUsageChart(data) {
            const ctx = document.getElementById('lotUsageChart').getContext('2d');
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(data),
                    datasets: [{
                        label: 'Visits',
                        data: Object.values(data),
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56',
                            '#4CAF50', '#9C27B0', '#FF9800'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: { display: true, text: 'Most Used Lots' }
                    }
                }
            });
        },
        renderVisitChart(data) {
            const ctx = document.getElementById('visitChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Object.keys(data),
                    datasets: [{
                        label: 'Visits',
                        data: Object.values(data),
                        fill: false,
                        borderColor: '#7E57C2',
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: { display: true, text: 'Visits Per Month' }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    }
                }
            });
        }
    }
};
