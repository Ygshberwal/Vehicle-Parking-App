export default {
    // validation contraints are yet to be added
    template: `
        <div class="container mt-4">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h4>Create Parking Lot</h4>
                        </div>
                        <div class="card-body">
                            <form @submit.prevent="addLot">
                                <div class="mb-3">
                                    <label for="location_name" class="form-label">Location Name</label>
                                    <input
                                        type="text"
                                        id="location_name"
                                        class="form-control"
                                        v-model="location_name"
                                        required
                                    >
                                </div>

                                <div class="mb-3">
                                    <label for="address" class="form-label">Address</label>
                                    <textarea
                                        id="address"
                                        class="form-control"
                                        rows="3"
                                        v-model="address"
                                        required
                                    ></textarea>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="pincode" class="form-label">Pincode</label>
                                            <input
                                                type="number"
                                                id="pincode"
                                                class="form-control"
                                                v-model.number="pincode"
                                                required
                                            >
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="price" class="form-label">Price per Hour</label>
                                            <input
                                                type="number"
                                                id="price"
                                                class="form-control"
                                                v-model.number="price"
                                                required
                                            >
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label for="max_slot" class="form-label">Maximum Slots</label>
                                    <input
                                        type="number"
                                        id="max_slot"
                                        class="form-control"
                                        v-model.number="max_slot"
                                        required
                                    >
                                </div>

                                <div class="d-flex justify-content-between">
                                    <button type="button" class="btn btn-secondary" @click="$router.go(-1)">
                                        Cancel
                                    </button>
                                    <button type="submit" class="btn btn-success" :disabled="isLoading">
                                        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                                        {{ isLoading ? 'Submitting...' : 'Submit' }}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data(){
        return {
            "location_name" : null,
            "price" : null,
            "address" : null,
            "pincode" : null,
            "max_slot" : null
        }
    },
    methods : {
        async addLot(){
            console.log("Inside addLot function")
            try{
            const res = await fetch(location.origin+'/api/lots', 
                {
                    method : 'POST', 
                    headers: {
                        'Content-Type' : 'application/json',
                        'Authentication-Token' : this.$store.state.auth_token
                    }, 
                    body : JSON.stringify({
                            "location_name" : this.location_name,
                            "price" : this.price,
                            "address" : this.address,
                            "pincode" : this.pincode,
                            "max_slot" : this.max_slot 
                        
                        })
                })
            if (res.ok){
                console.log("Lot added successfully")
                alert("Lot added successfully")
                this.$router.push('/lots')
            }
            else  {
                const err = await res.json();
                console.error("Error from server:", err);
                alert("Error: " + (err.error || res.status));
            }
            } catch (error){
                console.error("Network error: ", error);
                alert("Network error: "+ error.message);
            }
        }
    }
}