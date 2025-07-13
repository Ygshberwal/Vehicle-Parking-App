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

            <div class="d-flex justify-content-end mb-4">
                <input 
                    v-model="searchQuery"
                    type="text"
                    placeholder="🔍 Search lots..."
                    class="form-control"
                    style="
                        max-width: 300px;
                        border-radius: 2rem;
                        padding: 0 1.2rem;
                        font-size: 0.95rem;
                        border: 1px solid #ccc;
                        box-shadow: 0 1px 6px rgba(0,0,0,0.05);
                        transition: all 0.2s ease;
                    "
                    @focus="(e) => e.target.style.boxShadow = '0 0 0 3px rgba(0,123,255,0.2)'"
                    @blur="(e) => e.target.style.boxShadow = '0 1px 6px rgba(0,0,0,0.05)'"
                />
            </div>

            <div class="row g-4 mt-3">
                <div class="col-md-6 col-lg-4" v-for="lot in filteredLots" :key="lot.id">
                <SmallLotCard 
                    :lot_id="lot.id" 
                    :location_name="lot.location_name" 
                    :address="lot.address" 
                    :pincode="lot.pincode" 
                    :price="lot.price" 
                    :available_slot="lot.available_slot"
                />
                </div>
                <div v-if="filteredLots.length === 0" class="text-center text-muted mt-4">
                    No parking lots found matching your search.
                </div>
            </div>
        </div>
    `,

    // this data will contain all the parking lots
    // data is a function that return an object
    data(){            
        return {
            lots : [],
            searchQuery : ""
        }
    },

    computed : {
        filteredLots(){
            const query = this.searchQuery.trim().toLowerCase();
            if (!query) return this.lots;
            return this.lots.filter(lot =>
                lot.location_name.toLowerCase().includes(query) ||
                lot.address.toLowerCase().includes(query) ||
                lot.pincode.toString().includes(query)
            );
        }
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