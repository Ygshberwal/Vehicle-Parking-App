export default {
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid d-flex justify-content-between align-items-center">

        <!-- Logo on Left -->
        <router-link class="navbar-brand" to="/">ParkingApp</router-link>

        <!-- Centered Links -->
        <ul class="navbar-nav mx-auto mb-2 mb-lg-0 d-flex flex-row gap-3">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>

          <template v-if="!$store.state.loggedIn">
            <li class="nav-item">
              <router-link class="nav-link" to="/login">Login</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/register">Register</router-link>
            </li>
          </template>

          <template v-if="$store.state.loggedIn">
            <li class="nav-item" v-if="$store.state.role === 'admin'">
              <router-link class="nav-link" to="/admin-dashboard">Admin Dashboard</router-link>
            </li>

            <li class="nav-item" v-if="$store.state.role === 'user'">
              <router-link class="nav-link" to="/user-dashboard">User Dashboard</router-link>
            </li>

            <li class="nav-item">
              <router-link class="nav-link" to="/lots">Lots</router-link>
            </li>

            <li class="nav-item" v-if="$store.state.role === 'user'">
              <router-link class="nav-link" to="/explore">Explore</router-link>
            </li>
          </template>
        </ul>

        <!-- Logout button on Right -->
        <div v-if="$store.state.loggedIn">
            <span class="text-white">
              <strong>{{ $store.state.name.toUpperCase() }}</strong>
            </span>
          <button class="btn btn-outline-light" @click="$store.commit('logout')">Logout</button>
        </div>

      </div>
    </nav>
  `
}
