export default {
    template : `
    <div>
        <h1> List of Parking Lots </h1>
        <h2> {{ $store.state.auth_token}} </h2>
        <h2> {{ $store.state.role}} </h2>
        <h3 v-for = "lot in lots"> {{lot.location_name, lot.address}} </h3>
    </div>
    `,

    // this data will contain all the parking lots
    // data is a function that return an object
    data(){            
        return {
            lots : []
        }
    },

    methods : {

    },
    // fetch data from /api/lots
    async mounted(){        // run automatically when page is imported
        const res = await fetch(location.origin + '/api/lots', {
            headers : {
                'Authentication-Token' : this.$store.state.auth_token
            }
        })                                // res is containg the lot_fields that we created in resources.py

        const data = await res.json();        // getting response and populate parking lots
        console.log("Fetched parking lots:", data);
        this.lots = data;
    }
}