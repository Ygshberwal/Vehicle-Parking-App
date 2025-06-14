export default {
    name: "UserCard",
    props: ['user_id', 'user_name', 'email', 'active'],
    template: `
    <div class="card mb-3" style="width: 18rem;">
        <div class="card-body">
        <h5 class="card-title">{{ user_name }}</h5>
        <h6 class="card-subtitle mb-2 text-muted">User ID: {{ user_id }}</h6>
        <p class="card-text">Email: {{ email }}</p>
        <p class="card-text">
            Status: 
            <span :class="isActive ? 'text-success font-weight-bold' : 'text-danger font-weight-bold'">
            {{ isActive ? 'Active' : 'Blocked' }}
            </span>
        </p>
        <button 
            @click="toggleUserStatus" 
            :class="isActive ? 'btn btn-sm btn-outline-danger' : 'btn btn-sm btn-outline-success'"
        >
            {{ isActive ? 'Block' : 'Unblock' }}
        </button>
        </div>
    </div>
    `,
    data() {
    return {
        isActive: this.active == 1,
        user: {}
    };
    },
    methods: {
    async toggleUserStatus() {
        const res = await fetch(`${location.origin}/api/users/${this.user_id}`, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.$store.state.auth_token
        },
        body: JSON.stringify({})
        });

        if (res.ok) {
        const data = await res.json();
        this.user = data;
        this.isActive = data.active === 1;
        alert(`User is now ${this.isActive ? 'active' : 'blocked'}`);
        } else {
        alert("Failed to change user status.");
        }
    }
    }
};
