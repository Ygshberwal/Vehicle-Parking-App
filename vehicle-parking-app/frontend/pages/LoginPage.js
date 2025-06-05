export default {
    template : `
  <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="card p-4 shadow-sm" style="width: 100%; max-width: 400px;">
      <h4 class="text-center mb-4">Login</h4>
      <div class="mb-3">
        <label for="email" class="form-label">Email ID</label>
        <input
          type="email"
          id="email"
          class="form-control"
          placeholder="Enter your email"
          v-model="email"
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
      <button class="btn btn-primary w-100" @click="submitLogin">Login</button><br>
      <div class="text-center">
        <router-link to="/register" class="text-decoration-none">
          Create Account?
        </router-link>
      </div>
    </div>
  </div>


    `,
    data(){
        return {
            email : null,
            password : null,
        }
    },
    methods : {
        async submitLogin(){
            const res = await fetch(location.origin+'/login', 
                {
                    method : 'POST', 
                    headers: {'Content-Type' : 'application/json'}, 
                    body : JSON.stringify({'email': this.email,'password': this.password})
                })
            if (res.ok){
                console.log("we are logged in")
                const data = await res.json()
                console.log(data)

                localStorage.setItem('user',  JSON.stringify(data))         //adding data to local strorage
                
                this.$store.commit('setUser')
                this.$router.push('/lots')          //rerouting it to a new page

            }
        }
    }
}