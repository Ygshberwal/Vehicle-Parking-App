import UserCard from "../components/UserCard.js";

export default {
    template : `
    <div class="container py-4">
        <!-- Page Heading -->
        <div class="mb-4 text-center">
            <h1 class="fw-bold">List of all Users</h1>
            <h5 class="text-muted">Logged in as: <span class="text-dark">{{ $store.state.role }}</span></h5>
            <h5 class="text-muted">Name: <span class="text-dark">{{ $store.state.name }}</span></h5>
        </div>

        

        <!-- user Cards -->
        <div class="row g-4">
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