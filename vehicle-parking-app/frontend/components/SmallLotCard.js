export default {
    name: "SmallLotCard",
    props: ['lot_id', 'location_name', 'address', 'pincode', 'price', 'available_slot'],
    template: `
        <div class="card border-0 shadow-sm p-4 mb-4 hover-shadow"
            style="border-radius: 10px; background-color: #f9fafb; transition: box-shadow 0.3s ease; min-height: 100px; cursor: pointer;"
            @click="$router.push('/lots/' + lot_id)">
            <div class="d-flex flex-column h-100">
                <div class="mb-4">
                    <h5 class="text-primary fw-semibold mb-2"> Lot ID: {{ lot_id }} </h5>
                    <p class="text-muted mb-0"> 📍 <strong>Location:</strong> {{ location_name }} </p>
                </div>
                <div class=" d-flex justify-content-end" v-if="$store.state.role === 'admin'" @click.stop>
                    <div class="d-flex">
                        <button class="btn btn-sm btn-outline-danger mr-3" @click="deleteLot()" title="Delete Parking Lot">
                            🗑️ Delete
                        </button>
                        <router-link  :to="'/lots/' + lot_id + '/update-lot'"  class="btn btn-sm btn-outline-success">
                            ✏️ Edit
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    `,
    methods: {
        async deleteLot() {
            if (!confirm(`Are you sure, you want to delete parking lot "${this.location_name}"`)) return;
            try {
                const res = await fetch(`${location.origin}/api/lots/${this.lot_id}`, {
                    method: 'DELETE',
                    headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.$store.state.auth_token
                    }
                });
                if (res.ok) {
                    this.$emit('lot-deleted', this.lot_id);
                    alert(`Lot '${this.location_name}' deleted successfully`);
                    window.location.reload();
                } else {
                    const errorData = await res.json();
                    alert(`Error: ${errorData.message || 'Failed to delete parking lot'}`);
                }
            } catch (error) {
                console.error('Error deleting lot:', error);
                alert('An error occurred while deleting the parking lot');
            }
        }
    }
}