import {money, number} from '../utils/api.js';

export default {
    props: {title: String, description: String, entries: Array, type: {default: 'bar'}, currency: Boolean, stacked: Boolean, wide: Boolean},
    data() { return {chartUnavailable: false}; },
    mounted() { this.draw(); },
    watch: {entries: {handler() { this.draw(); }, deep: true}},
    beforeDestroy() { if (this.chart) this.chart.destroy(); },
    methods: {
        money, number,
        draw() {
            if (this.chart) { this.chart.destroy(); this.chart = null; }
            if (!this.entries.length) return;
            if (typeof Chart === 'undefined') { this.chartUnavailable = true; return; }
            this.chartUnavailable = false;
            this.$nextTick(() => {
                if (!this.$refs.canvas || this._isDestroyed) return;
                const labels = this.entries.map(entry => entry[0]);
                const horizontal = this.type === 'horizontalBar';
                const datasets = this.stacked ? [
                    {label: 'Occupied', data: this.entries.map(entry => entry[1]), backgroundColor: '#2563eb'},
                    {label: 'Available', data: this.entries.map(entry => entry[2]), backgroundColor: '#dce7fb'},
                ] : [{
                    label: this.title, data: this.entries.map(entry => entry[1]),
                    backgroundColor: this.type === 'line' ? 'rgba(37,99,235,.06)' : '#7298ec',
                    borderColor: '#2563eb', borderWidth: this.type === 'line' ? 2 : 0,
                    pointBackgroundColor: '#fff', pointBorderWidth: 2, pointRadius: 3,
                    lineTension: .25, fill: this.type === 'line', maxBarThickness: 30,
                }];
                const valueAxis = {stacked: this.stacked, gridLines: {color: '#eef0f5', drawBorder: false}, ticks: {
                    beginAtZero: true, precision: 0, fontSize: 10, fontColor: '#858e9d', maxTicksLimit: 5,
                    callback: value => this.currency ? '₹' + (value >= 1000 ? Math.round(value / 1000) + 'k' : value) : value,
                }};
                const labelAxis = {stacked: this.stacked, gridLines: {display: false, drawBorder: false}, ticks: {
                    fontSize: 10, fontColor: '#667085', maxRotation: 0, autoSkip: true,
                    callback: value => String(value).length > 23 ? String(value).slice(0, 21) + '…' : value,
                }};
                this.chart = new Chart(this.$refs.canvas.getContext('2d'), {
                    type: this.type, data: {labels, datasets},
                    options: {
                        responsive: true, maintainAspectRatio: false, animation: {duration: 0},
                        legend: {display: this.stacked, position: 'bottom', labels: {fontColor: '#667085', fontSize: 10, boxWidth: 10, padding: 18}},
                        tooltips: {backgroundColor: '#182230', titleFontSize: 11, bodyFontSize: 11, cornerRadius: 6,
                            callbacks: {label: item => this.stacked ? datasets[item.datasetIndex].label + ': ' + number(horizontal ? item.xLabel : item.yLabel) : this.currency ? money(horizontal ? item.xLabel : item.yLabel) : number(horizontal ? item.xLabel : item.yLabel)}},
                        scales: {xAxes: [horizontal ? valueAxis : labelAxis], yAxes: [horizontal ? labelAxis : valueAxis]},
                    },
                });
            });
        },
    },
    template: `<section class="surface chart-card" :class="{wide}"><h2>{{ title }}</h2><p class="chart-description">{{ description }}</p><template v-if="entries.length"><div v-if="chartUnavailable" class="chart-empty" role="status">Chart unavailable. The data table below is still available.</div><div v-else class="chart-frame"><canvas ref="canvas" role="img" :aria-label="title + '. Exact values are available in the data table below.'"></canvas></div><details class="chart-data" :open="chartUnavailable"><summary>View data table</summary><table class="data-table"><caption class="sr-only">{{ title }}</caption><thead><tr><th scope="col">{{ type === 'horizontalBar' ? 'Location or user' : 'Period' }}</th><th scope="col">{{ stacked ? 'Occupied' : currency ? 'Amount' : 'Count' }}</th><th v-if="stacked" scope="col">Available</th></tr></thead><tbody><tr v-for="entry in entries" :key="entry[0]"><th scope="row">{{ entry[0] }}</th><td>{{ currency ? money(entry[1]) : number(entry[1]) }}</td><td v-if="stacked">{{ number(entry[2]) }}</td></tr></tbody></table></details></template><div v-else class="chart-empty">No activity recorded yet.</div></section>`,
};
