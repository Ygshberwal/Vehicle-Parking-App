export default {
    // validation contraints are yet to be added
    template : `
        <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="card p-4 shadow-sm" style="width: 100%; max-width: 400px;">
      <h4 class="text-center mb-4">Create Account</h4>

      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
          type="email"
          id="email"
          class="form-control"
          placeholder="Enter your email"
          v-model="email"
        >
      </div>

      <div class="mb-3">
        <label for="name" class="form-label">Name</label>
        <input
          type="text"
          id="name"
          class="form-control"
          placeholder="Enter your name"
          v-model="name"
        >
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input
          type="password"
          id="password"
          class="form-control"
          placeholder="Enter your password"
          v-model="password"
        >
      </div>

      <div class="mb-3">
        <label for="pincode" class="form-label">Pincode (optional)</label>
        <input
          type="text"
          id="pincode"
          class="form-control"
          placeholder="Enter your pincode"
          v-model="pincode"
        >
      </div>

      <!-- <div class="mb-3">
        <label for="dp" class="form-label">Profile Picture (optional)</label>
        <input
          type="file"
          id="dp"
          class="form-control"
          placeholder="Enter image URL"
          v-model="dp"
        >
        </div>
        -->

      <button class="btn btn-success w-100 mb-3" @click="submitRegister">Register</button>

      <div class="text-center">
        <router-link to="/login" class="text-decoration-none">
          Already have an account? <strong>Login</strong>
        </router-link>
      </div>
    </div>
  </div>
    `,
    data(){
        return {
            email : null,
            password : null,
            role : "user",
            name : null,
            pincode : null,
            dp : null,
        }
    },
    methods : {
        async submitRegister(){
            const res = await fetch(location.origin+'/register', 
                {
                    method : 'POST', 
                    headers: {'Content-Type' : 'application/json'}, 
                    body : JSON.stringify({'email': this.email, 'name': this.name, 'password': this.password, 'role': this.role, "dp" : this.dp, "pincode" : this.pincode})
                })
            if (res.ok){
                console.log("we are registered")
                this.$router.push('/login')
            }
        }
    }
}