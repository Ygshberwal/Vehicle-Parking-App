export default {
  // validation constraints are added using HTML5 attributes
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div class="card p-4 shadow-sm" style="width: 100%; max-width: 400px;">
        <h4 class="text-center mb-4">Create Account</h4>

        <form @submit.prevent="submitRegister">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              id="email"
              class="form-control"
              placeholder="Enter your email"
              v-model="email"
              required
            >
          </div>

          <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input
              type="text"
              id="name"
              class="form-control"
              placeholder="Enter your name"
              v-model="name"
              required
              minlength="2"
              maxlength="50"
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
              required
              minlength="6"
            >
          </div>

          <div class="mb-3">
            <label for="pincode" class="form-label">Pincode (optional)</label>
            <input
              type="text"
              id="pincode"
              class="form-control"
              placeholder="Enter your pincode"
              v-model="pincode"
              pattern="\\d{6}"
              title="Pincode must be exactly 6 digits"
            >
          </div>

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

          <button type="submit" class="btn btn-success w-100 mb-3">Register</button>
        </form>

        <div class="text-center">
          <router-link to="/login" class="text-decoration-none">
            Already have an account? <strong>Login</strong>
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
      const res = await fetch(location.origin + '/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            'email': this.email,
            'name': this.name,
            'password': this.password,
            'role': this.role,
            "dp": this.dp,
            "pincode": this.pincode
          })
        });
      if (res.ok) {
        console.log("we are registered");
        this.$router.push('/login');
      }
    }
  }
}
