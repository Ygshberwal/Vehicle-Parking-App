export default {
    template : `
    <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div class="card p-4 shadow-sm" style="width: 100%; max-width: 420px; border: 1px solid #dee2e6;">
            <div class="text-center mb-4">
                <h2 class="fw-bold mb-1 text-primary">Welcome Back 👋</h2>
                <p class="text-muted small">Login to manage your parking seamlessly</p>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label ">Email ID</label>
                <input
                  type="email"
                  id="email"
                  class="form-control rounded-3 shadow-sm"
                  placeholder="Enter your email"
                  v-model="email"
                >
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  class="form-control rounded-3 shadow-sm"
                  placeholder="Enter your password"
                  v-model="password"
                >
            </div>
            <button class="btn btn-primary w-100 rounded-3 py-2 fw-semibold" @click="submitLogin" style="transition: all 0.3s;">Login</button>

            <div class="text-center mt-3">
                <router-link to="/register" class="text-decoration-nonesmall text-muted">
        Don't have an account? <span class="text-primary">Register</span>
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

                if (data.role === 'admin') {
                    this.$router.push('/admin-dashboard')
                } else {
                    this.$router.push('/lots')
                }

            }
        }
    }
}