import LotCard from "../components/LotCard.js";

export default {
    template : `
    <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="text-dark">Admin Dashboard</h1>
    </div>
    
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h2 class="text-secondary">Parking Lots</h2>
      <button @click="lot_create" class="btn btn-outline-secondary btn-sm mt-2"
          style="border-radius: 5px;">
        Fetch Lot Data
      </button>
    </div>
    
    <div class="row g-4 mt-3">
      <div class="col-md-6 col-lg-4" v-for="lot in lots" :key="lot.id">
      
        <LotCard 
          :lot_id="lot.id"
          :location_name="lot.location_name"
          :address="lot.address"
          :pincode="lot.pincode"
          :price="lot.price"
          :available_slot="lot.available_slot"
          :occupied_slot="lot.occupied_slot"
        />
      </div>
    </div>
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
        async lot_create(){
            const res = await fetch(location.origin + '/lot-create', {
                headers : {
                    'Authentication-Token' : this.$store.state.auth_token
                }
            })
            const task_id = (await res.json()).task_id

            const interval = setInterval(async() => {
                const res = await fetch(`${location.origin}/lot-download/${task_id}` )
                if (res.ok){
                    console.log('data is ready')
                    window.open(`${location.origin}/lot-download/${task_id}`)
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