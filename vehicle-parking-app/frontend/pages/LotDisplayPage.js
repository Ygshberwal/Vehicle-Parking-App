export default {
    props :['id'],
    template :`
    <div class="jumbotron">
        <h2>Lot Name: {{lot.location_name}} </h2>
        <p>Lot Address: {{lot.address}} </p>
        <p>Pincode: {{lot.pincode}} </p>
        <hr>
        <p>Max Capacity: {{lot.max_slot}} </p>
        <p>Price per hour: Rs. {{lot.price}} </p>
    </div>
    `,
    data(){
        return{
            lot : {}
        }
    },
    async mounted(){
        const res = await fetch(`${location.origin}/api/lots/${this.id}`,{
            headers : {
                "Authentication-Token" : this.$store.state.auth_token
            }
        })
        if (res.ok){
            this.lot = await res.json()
        }

    }
}