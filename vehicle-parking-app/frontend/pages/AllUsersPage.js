import UserCard from "../components/UserCard.js";

export default {
    template : `
    <div class="container mt-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="text-dark">User Management</h1>
        <button @click="users_create" class="btn btn-outline-secondary btn-sm mt-2" style="border-radius: 5px;">
          Export Users Data
        </button>
      </div>

      <!-- User Cards Grid -->
      <div class="row g-4 mt-3">
        <div class="col-md-6 col-lg-4" v-for="user in users" :key="user.id">
          <UserCard 
            :user_id="user.id"
            :user_name="user.name"
            :email="user.email"
            :active="user.active"
          />
        </div>
      </div>
    </div>
    `,

    // this data will contain all the registered users
    // data is a function that return an object
    data(){            
        return {
            users : []
        }
    },

    methods : {
        async users_create(){
            const res = await fetch(location.origin + '/users-create', {
                headers : {
                    'Authentication-Token' : this.$store.state.auth_token
                }
            })
            const task_id = (await res.json()).task_id

            const interval = setInterval(async() => {
                const res = await fetch(`${location.origin}/users-download/${task_id}` )
                if (res.ok){
                    console.log('data is ready')
                    window.open(`${location.origin}/users-download/${task_id}`)
                    clearInterval(interval)
                }

            }, 100)
        },
    },

    // fetch data from /api/users
    async mounted(){        // run automatically when page is imported
        const res = await fetch(location.origin + '/api/users', {
            headers : {
                'Authentication-Token' : this.$store.state.auth_token
            }
        })                                // res is containg the user_fields that we created in resources.py

        const data = await res.json();        // getting response and populate users
        console.log("Fetched registered users:", data);
        this.users = data;
    },
    
    components : {
        UserCard,
    }
    
}