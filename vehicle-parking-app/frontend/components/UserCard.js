export default {
    name: "UserCard",
    props: ['user_id', 'user_name', 'email', 'active'],
    template: `
        <div class="card border-0 shadow-sm p-4 mb-4 hover-shadow"
            style="border-radius: 10px; background-color: #f9fafb; transition: box-shadow 0.3s ease;">
            <div class="d-flex flex-column h-100">
                <div class="mb-3">
                    <h5 class="text-primary fw-semibold mb-1">{{ user_name }}</h5>
                    <h6 class="text-muted small mb-0">User ID: {{ user_id }}</h6>
                </div>
                <div class="mb-3">
                    <p class="mb-0"><strong>Email:</strong> {{ email }} </p>
                </div>
                <div class="mb-4"> <p class="mb-0"> <strong>Status:</strong>
                    <span :class="isActive ? 'text-success fw-bold' : 'text-danger fw-bold'">
                        {{ isActive ? 'Active' : 'Blocked' }}
                    </span> </p>
                </div>
                <div class="mt-auto">
                    <button @click="toggleUserStatus" :class="isActive ? 'btn btn-sm btn-outline-danger' : 'btn btn-sm btn-outline-success'">
                        {{ isActive ? 'Block' : 'Unblock' }}
                    </button>
                </div>
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
