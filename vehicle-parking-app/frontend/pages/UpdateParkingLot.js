export default {
    name: "UpdateLot",
    data() {
        return {
            lot_id: this.$route.params.id,
            location_name: '',
            address: '',
            pincode: '',
            price: '',
            max_slot: '',
            isLoading: false
        };
    },
    mounted() {
        this.fetchLotData();
    },
    template: `
        <div class="container mt-4">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <h4>Parking Lot ID: {{ lot_id }}</h4>
                    <div class="card">
                        <div class="card-header">
                            <h4>Update Parking Lot</h4>
                        </div>
                        <div class="card-body">
                            <form @submit.prevent="updateLot">
                                <div class="mb-3">
                                    <label for="location_name" class="form-label">Location Name </label>
                                    <input type="text" class="form-control" id="location_name" v-model="location_name" required>
                                </div>

                                <div class="mb-3">
                                    <label for="address" class="form-label">Address</label>
                                    <textarea class="form-control" id="address" rows="3" v-model="address" required></textarea>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="pincode" class="form-label">Pincode</label>
                                            <input type="number" class="form-control" id="pincode" v-model="pincode" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="price" class="form-label">Price per Hour</label>
                                            <input type="number" class="form-control" id="price" v-model="price" required>
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label for="max_slot" class="form-label">Maximum Slots</label>
                                    <input type="number" class="form-control" id="max_slot" v-model="max_slot" required>
                                </div>

                                <div class="d-flex justify-content-between">
                                    <button type="button" class="btn btn-secondary" @click="$router.go(-1)">
                                        Cancel
                                    </button>
                                    <button type="submit" class="btn btn-primary" :disabled="isLoading">
                                        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                                        {{ isLoading ? 'Updating...' : 'Update Lot' }}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    methods: {
        async fetchLotData() {
            this.isLoading = true;
            try {
                const apiUrl = `${location.origin}/api/lots/${this.lot_id}`;
                const res = await fetch(apiUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    this.location_name = data.location_name;
                    this.address = data.address;
                    this.pincode = data.pincode;
                    this.price = data.price;
                    this.max_slot = data.max_slot;
                } else {
                    const errorData = await res.json();
                    console.error('Failed to fetch lot data:', errorData.message);
                    alert(`Error: ${errorData.message || 'Unable to fetch parking lot data'}`);
                }
            } catch (error) {
                console.error('Error fetching lot data:', error);
                alert('An error occurred while fetching the parking lot data.');
            } finally {
                this.isLoading = false;
            }
        },

        async updateLot() {
            this.isLoading = true;

            try {
                const lotData = {
                    location_name: this.location_name,
                    address: this.address,
                    pincode: parseInt(this.pincode),
                    price: parseInt(this.price),
                    max_slot: parseInt(this.max_slot)
                };

                const apiUrl = `${location.origin}/api/lots/${this.lot_id}`;
                const res = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token
                    },
                    body: JSON.stringify(lotData)
                });

                if (res.ok) {
                    const responseData = await res.json();
                    alert(`Parking lot "${this.location_name}" updated successfully!`);
                    this.$router.push(`/lots/${this.lot_id}`);
                } else {
                    const contentType = res.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await res.json();
                        alert(`Error: ${errorData.message || 'Failed to update parking lot'}`);
                    } else {
                        const errorText = await res.text();
                        console.error('Non-JSON error response:', errorText);
                        alert(`Error ${res.status}: ${res.statusText}`);
                    }
                }
            } catch (error) {
                console.error('Error updating lot:', error);
                alert(`An error occurred while updating the parking lot: ${error.message}`);
            } finally {
                this.isLoading = false;
            }
        }
    }
};
