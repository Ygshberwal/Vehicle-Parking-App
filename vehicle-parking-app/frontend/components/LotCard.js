export default {
    name : "LotCard",
    props : ['location_name', 'address', 'pincode', 'price', 'max_slot'],
    template : `
    <div class = "jumbotron">
        <h2> {{ location_name}} </h2>
        <p> {{ address }} </p>
        <p> Pincode : {{pincode}} </p>
        <hr>
        <p> Slots : {{max_slot}} </p>
        <p> Price per hour : {{price}} </p>
    `,

}