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

        <div class="d-flex justify-content-end mb-4">
            <input 
                v-model="searchQuery"
                type="text"
                placeholder="🔍 Search Users..."
                class="form-control"
                style="
                    max-width: 300px;
                    border-radius: 2rem;
                    padding: 0.6rem 1.2rem;
                    font-size: 0.95rem;
                    border: 1px solid #ccc;
                    box-shadow: 0 1px 6px rgba(0,0,0,0.05);
                    transition: all 0.2s ease;
                "
                @focus="(e) => e.target.style.boxShadow = '0 0 0 3px rgba(0,123,255,0.2)'"
                @blur="(e) => e.target.style.boxShadow = '0 1px 6px rgba(0,0,0,0.05)'"
            />
        </div>

        <div class="row g-4 mt-3">
            <div class="col-md-6 col-lg-4" v-for="user in filteredUsers" :key="user.id">
            <UserCard 
                :user_id="user.id"
                :user_name="user.name"
                :email="user.email"
                :active="user.active"
            />
            </div>
            <div v-if="filteredUsers.length === 0" class="text-center text-muted mt-4 ">
                    No user found matching your search.
                </div>
        </div>
    </div>
    `,

    // this data will contain all the registered users
    // data is a function that return an object
    data(){            
        return {
            users : [],
            searchQuery: ""
        }
    },

    computed : {
        filteredUsers(){
            const query = this.searchQuery.trim().toLowerCase();
            if (!query) return this.users;
            return this.users.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)            );
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