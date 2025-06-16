import LotCard from "../components/LotCard.js";
import SmallLotCard from "../components/SmallLotCard.js";

export default {
    template : `
    <div class="container py-4">
        <!-- Page Heading -->
        <div class="mb-4 text-center">
            <h1 class="fw-bold">List of Parking Lots</h1>
            <h5 class="text-muted">Logged in as: <span class="text-dark">{{ $store.state.role }}</span></h5>
            <h5 class="text-muted">Name: <span class="text-dark">{{ $store.state.name }}</span></h5>
        </div>

        <!-- Add Lot Button (Admin Only) -->
        <div class="text-center mb-4" v-if="$store.state.role === 'admin'">
            <router-link to="/add-lot" class="btn btn-sm btn-outline-primary">
                ➕ Add Parking Lot 
            </router-link>
        </div>

        <!-- Lot Cards -->
        <div class="row g-4">
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