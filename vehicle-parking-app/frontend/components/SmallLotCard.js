export default {
    name: "SmallLotCard",
    props: ['lot_id', 'location_name', 'address', 'pincode', 'price', 'available_slot'],
    template: `
        <div class="container">
            <div class="row py-2 border-bottom"
                style="cursor: pointer;"
                @click="$router.push('/lots/' + lot_id)" >
                <div class="col">
                    <strong>Lot Id: </strong> {{ lot_id }} &ensp;&ensp;
                    <strong>Location: </strong> {{ location_name}}
                </div>
                <div class="col-auto" v-if="$store.state.role === 'admin'">
                    <button
                    @click.stop="deleteLot()"
                    class="btn btn-sm btn-outline-danger"
                    title="Delete Parking Lot">
                    🗑️ Delete
                    </button>
                </div>
                <div class="col-auto" v-if="$store.state.role === 'admin'">
                    <router-link v-if="$store.state.role === 'admin'" :to="'/lots/' + lot_id + '/update-lot'" class="btn btn-sm btn-outline-success">
                    ✏️ Edit 
                    </router-link>
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