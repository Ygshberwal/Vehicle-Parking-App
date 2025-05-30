export default {
    template : `
        <div>
            <input placeholder='email' v-model="email" />
            <input placeholder='password' v-model="password" />
            <input placeholder='role' v-model="role" />
            <button class="btn btn-primary" @click="submitRegister"> Register </button>

        </div>
    `,
    data(){
        return {
            email : null,
            password : null,
            role : null,
        }
    },
    methods : {
        async submitRegister(){
            const res = await fetch(location.origin+'/register', 
                {
                    method : 'POST', 
                    headers: {'Content-Type' : 'application/json'}, 
                    body : JSON.stringify({'email': this.email,'password': this.password, 'role': this.role})
                })
            if (res.ok){
                console.log("we are registered")
                
            }
        }
    }
}