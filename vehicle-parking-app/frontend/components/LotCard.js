export default {
    name: "LotCard",
    props: { lot_id: Number, location_name: String, address: String, pincode: Number, price: Number, available_slot: {type: Number, default: 0}, occupied_slot: {type: Number,default: 0}},
    template: `
    <div class="jumbotron" style="width: 300px">
        <h2 @click="$router.push('/lots/' + lot_id)" style="cursor: pointer;">
            {{ location_name }}
        </h2>
        <p>{{ address }}</p>
        <p>ID: {{ lot_id }}</p>
        <p>Pincode: {{ pincode }}</p>
        <hr>
        <p>
            Slots available:
            <span style="color: green">{{ available_slot }}</span> /
            <span>{{ available_slot + occupied_slot }}</span>
        </p>
        <p>Price per hour: ₹{{ price }}</p>
    </div>
    `
}
