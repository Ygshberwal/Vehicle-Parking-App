export default {
    name : "LotCard",
    props : ['lot_id', 'location_name', 'address', 'pincode', 'price', 'available_slot'],
    template : `
    <div class = "jumbotron" style = "width: 300">
        <h2 @click="$router.push('/lots/' + lot_id)"" > {{ location_name}} </h2>
        <p> {{ address }} </p>
        <p> ID: {{ lot_id }} </p>
        <p> Pincode : {{pincode}} </p>
        <hr>
        <p> Slots Available: {{available_slot}} </p>
        <p> Price per hour : {{price}} </p>
    </div>
    `,

}