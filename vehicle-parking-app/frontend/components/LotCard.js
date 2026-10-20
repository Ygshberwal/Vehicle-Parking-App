import {money} from '../utils/api.js';
export default {
    props: {lot_id: Number, location_name: String, address: String, pincode: Number, price: Number,
        available_slot: {type: Number, default: 0}, occupied_slot: {type: Number, default: 0}, management: Boolean},
    computed: {
        total() { return this.available_slot + this.occupied_slot; },
        occupiedPercent() { return this.total ? Math.round(this.occupied_slot / this.total * 100) : 0; },
    },
    methods: {money},
    template: `<article class="lot-card"><div class="lot-card-body"><div class="lot-card-top"><span class="lot-marker"><AppIcon name="pin" size="21" /></span><span class="status-badge" :class="!available_slot ? 'muted' : available_slot <= 3 ? 'warning' : ''">{{ !available_slot ? 'Currently full' : available_slot <= 3 ? 'Limited spaces' : 'Spaces available' }}</span></div><h2><router-link :to="'/lots/' + lot_id">{{ location_name }}</router-link></h2><p class="lot-address">{{ address }}</p><p class="lot-pin">PIN {{ pincode }} <span aria-hidden="true">·</span> Lot #{{ lot_id }}</p><div class="occupancy-meta"><span>{{ available_slot }} available</span><span>{{ total }} total spaces</span></div><div class="occupancy-track" role="img" :aria-label="occupied_slot + ' of ' + total + ' spaces occupied'"><div class="occupancy-fill" :style="{width: occupiedPercent + '%'}"></div></div><div class="lot-rate">{{ money(price) }}<span>/ hour</span></div></div><div class="lot-card-footer"><router-link class="view-link" :to="'/lots/' + lot_id">View lot <AppIcon name="arrow" size="15" /></router-link><router-link v-if="management" class="btn btn-quiet btn-sm" :to="'/lots/' + lot_id + '/update-lot'"><AppIcon name="edit" size="15" />Edit</router-link></div></article>`,
};
