export default {
    template : `
        <div>
            <input placeholder='email' v-model="email" />
            <input placeholder='name' v-model="name" />
            <input placeholder='password' v-model="password" />
            <input placeholder='pincode' v-model="pincode" />
            <input placeholder='dp' v-model="dp" />

            <!-- <input placeholder='role' v-model="role" /> -->
            <button class="btn btn-primary" @click="submitRegister"> Register </button>

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
                
            }
        }
    }
}