export default {
    // validation contraints are yet to be added
    template : `
    <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="card p-4 shadow-sm" style="width: 100%; max-width: 400px;">
    <h4 class="text-center mb-4">Create Parking Lot</h4>
    
    <div class="mb-3">
      <label for="location_name" class="form-label">Name</label>
      <input
      type="text"
      id="location_name"
      class="form-control"
      placeholder="Name/Location of the lot"
      v-model="location_name"
      >
    </div>

    <div class="mb-3">
      <label for="address" class="form-label">Address</label>
      <input
      type="text"
      id="address"
      class="form-control"
      placeholder="Enter lot's address"
      v-model="address"
      >
    </div>

    <div class="mb-3">
      <label for="pincode" class="form-label">Pincode</label>
      <input
      type="number"
      id="pincode"
      class="form-control"
      placeholder="Enter the pincode"
      v-model.number="pincode"
      >
    </div>

    <div class="mb-3">
      <label for="price" class="form-label">Price</label>
      <input
      type="number"
      id="price"
      class="form-control"
      placeholder="Enter the hourly rate"
      v-model.number="price"
      >
    </div>

    <div class="mb-3">
      <label for="max_slot" class="form-label">Slot Capacity</label>
      <input
      type="number"
      id="max_slot"
      class="form-control"
      placeholder="Enter maximum no. of slots"
      v-model.number="max_slot"
      >
    </div>

    <button class="btn btn-success w-100 mb-3" @click="addLot">Submit</button>
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