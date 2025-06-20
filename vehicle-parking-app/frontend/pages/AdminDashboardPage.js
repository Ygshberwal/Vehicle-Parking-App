import LotCard from "../components/LotCard.js";

export default {
    template : `
    <div>
        <h1>This is admin dashboard </h1> 
        <hr>
        <h2> Parking Lots &ensp;&ensp; <button @click="create_csv" class="btn btn-sm btn-outline-primary"> Get Lot data </button> </h2>
        <hr>
        <LotCard 
            v-for="lot in lots" 
            :lot_id="lot.id" 
            :location_name="lot.location_name" 
            :address="lot.address" 
            :pincode="lot.pincode" 
            :price="lot.price" 
            :available_slot="lot.available_slot"
            :occupied_slot="lot.occupied_slot"
        />
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
        async create_csv(){
            const res = await fetch(location.origin + '/create-csv', {
                headers : {
                    'Authentication-Token' : this.$store.state.auth_token
                }
            })
            const task_id = (await res.json()).task_id

            const interval = setInterval(async() => {
                const res = await fetch(`${location.origin}/get-csv/${task_id}` )
                if (res.ok){
                    console.log('data is ready')
                    window.open(`${location.origin}/get-csv/${task_id}`)
                    clearInterval(interval)
                }

            }, 100)
        },
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
    },
    
    components : {
        LotCard,
    }
    
}