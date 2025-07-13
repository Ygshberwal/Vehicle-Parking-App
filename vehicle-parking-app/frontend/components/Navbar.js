export default {
  template: `
    <div>
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid d-flex justify-content-between align-items-center">
          <!-- Logo on Left -->
          <router-link class="navbar-brand" to="/">ParkingApp</router-link>

          <!-- Centered Links -->
          <ul class="navbar-nav mx-auto mb-2 mb-lg-0 d-flex flex-row gap-3">
            <template v-if="!$store.state.loggedIn">
              <li class="nav-item">
                <router-link class="nav-link" to="/" active-class="active">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/login" active-class="active">Login</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/register" active-class="active">Register</router-link>
              </li>
            </template>

            <template v-if="$store.state.loggedIn">
              <li class="nav-item" v-if="$store.state.role === 'admin'">
                <router-link class="nav-link" to="/admin-dashboard" active-class="active">Admin Dashboard</router-link>
              </li>
              <li class="nav-item" v-if="$store.state.role === 'admin'">
                <router-link class="nav-link" to="/users" active-class="active">Users</router-link>
              </li>
              <li class="nav-item" v-if="$store.state.role === 'user'">
                <router-link class="nav-link" :to="'/user-dashboard/' + $store.state.user_id" active-class="active">User Dashboard</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/lots" active-class="active">Lots</router-link>
              </li>
              <li class="nav-item" v-if="$store.state.role === 'admin'">
                <router-link class="nav-link" :to="'/user-dashboard/' + $store.state.user_id" active-class="active">Bookings</router-link>
              </li>
              <li class="nav-item" v-if="$store.state.role === 'admin'">
                <router-link class="nav-link" to="/all-stats" active-class="active">Summary</router-link>
              </li>
              <li class="nav-item" v-if="$store.state.role === 'user'">
                <router-link class="nav-link" :to="'/user-stats/' + $store.state.user_id" active-class="active">Summary</router-link>
              </li>
            </template>
          </ul>

          <!-- Logout button on Right -->
          <div v-if="$store.state.loggedIn">
            <span class="text-white">
              <strong>{{ $store.state.name.toUpperCase() }}</strong>
            </span>
            <button class="btn btn-outline-light ms-3" @click="$store.commit('logout')">Logout</button>
          </div>
        </div>
      </nav>
    </div>
  `
}
