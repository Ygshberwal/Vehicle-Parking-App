export default {
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div class="card shadow rounded-4 p-4" style="width: 100%; max-width: 420px; border: 1px solid #dee2e6;">
        
        <!-- Welcome Header -->
        <div class="text-center mb-4">
          <h2 class="fw-bold mb-1 text-success">Create an Account</h2>
          <p class="text-muted small">Register to start booking parking slots</p>
        </div>

        <form @submit.prevent="submitRegister">

          <div class="mb-3">
            <label for="email" class="form-label fw-semibold">Email</label>
            <input
              type="email"
              id="email"
              class="form-control rounded-3 shadow-sm"
              placeholder="Enter your email"
              v-model="email"
              required
            >
          </div>

          <div class="mb-3">
            <label for="name" class="form-label fw-semibold">Name</label>
            <input
              type="text"
              id="name"
              class="form-control rounded-3 shadow-sm"
              placeholder="Enter your name"
              v-model="name"
              required
              minlength="2"
              maxlength="50"
            >
          </div>

          <div class="mb-3">
            <label for="password" class="form-label fw-semibold">Password</label>
            <input
              type="password"
              id="password"
              class="form-control rounded-3 shadow-sm"
              placeholder="Create a password"
              v-model="password"
              required
              minlength="6"
            >
          </div>

          <div class="mb-3">
            <label for="pincode" class="form-label fw-semibold">Pincode (optional)</label>
            <input
              type="text"
              id="pincode"
              class="form-control rounded-3 shadow-sm"
              placeholder="6-digit area pincode"
              v-model="pincode"
              pattern="\\d{6}"
              title="Pincode must be exactly 6 digits"
            >
          </div>

          <!-- Optional Profile Picture (commented) -->
          <!--
          <div class="mb-3">
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

          <button type="submit" class="btn btn-success w-100 py-2 fw-semibold rounded-3" style="transition: all 0.3s;">
            Register
          </button>
        </form>

        <div class="text-center mt-3">
          <router-link to="/login" class="text-decoration-none small text-muted">
            Already have an account? <span class="text-success">Login</span>
          </router-link>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      email: null,
      password: null,
      role: "user",
      name: null,
      pincode: null,
      dp: null,
    };
  },
  methods: {
    async submitRegister() {
      const res = await fetch(location.origin + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          name: this.name,
          password: this.password,
          role: this.role,
          dp: this.dp,
          pincode: this.pincode
        })
      });
      if (res.ok) {
        console.log("we are registered");
        this.$router.push('/login');
      }
    }
  }
}
