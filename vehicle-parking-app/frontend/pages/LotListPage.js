import LotCard from "../components/LotCard.js";
import SmallLotCard from "../components/SmallLotCard.js";

export default {
    template : `
        <div class="container mt-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="text-dark">List of Parking Lots</h1>
                    <div class="text-muted medium">
                        Logged in as: <span class="text-dark fw-semibold">{{ $store.state.role }}</span>
                        &nbsp;|&nbsp;
                        Name: <span class="text-dark fw-semibold">{{ $store.state.name }}</span>
                    </div>
                </div>
                <div v-if="$store.state.role === 'admin'">
                    <router-link to="/add-lot" class="btn btn-outline-secondary btn-sm mt-2" style="border-radius: 5px;">
                        ➕ Add Parking Lot
                    </router-link>
                </div>
            </div>
            <div class="row g-4 mt-3">
                <div class="col-md-6 col-lg-4" v-for="lot in lots" :key="lot.id">
                <SmallLotCard 
                    :lot_id="lot.id" 
                    :location_name="lot.location_name" 
                    :address="lot.address" 
                    :pincode="lot.pincode" 
                    :price="lot.price" 
                    :available_slot="lot.available_slot"
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
        SmallLotCard
    }
    
}