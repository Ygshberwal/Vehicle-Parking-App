export default {
  template: `
    <main class="parking-home">
      <section class="parking-home-hero" aria-labelledby="home-heading">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-6 mb-5 mb-lg-0">
              <p class="parking-home-eyebrow">Vehicle parking management</p>
              <h1 id="home-heading">Less searching.<br><span>More parking.</span></h1>
              <p class="parking-home-intro">
                Find a parking lot, check available spaces, and book your spot.
                Keep your bookings and parking expenses together in one place.
              </p>
              <div class="parking-home-actions">
                <template v-if="!$store.state.loggedIn">
                  <router-link class="btn btn-primary" to="/login">Sign in to find parking <span aria-hidden="true">&rarr;</span></router-link>
                  <router-link class="btn btn-outline-secondary" to="/register">Create an account</router-link>
                </template>
                <template v-else>
                  <router-link class="btn btn-primary" to="/lots">Browse parking lots <span aria-hidden="true">&rarr;</span></router-link>
                  <router-link class="btn btn-outline-secondary" :to="dashboardPath">Open my dashboard</router-link>
                </template>
              </div>
              <p class="parking-home-supporting">Hourly pricing. Clear availability. A simpler parking routine.</p>
            </div>

            <div class="col-lg-5 offset-lg-1">
              <div class="parking-home-preview" aria-labelledby="preview-heading">
                <div class="d-flex align-items-center justify-content-between mb-4">
                  <div class="d-flex align-items-center">
                    <span class="parking-home-sign mr-3" aria-hidden="true">P</span>
                    <div>
                      <h2 id="preview-heading">A space for every stop</h2>
                      <span class="parking-home-preview-label">Illustration &middot; not live availability</span>
                    </div>
                  </div>
                </div>
                <div class="parking-home-spaces" aria-label="Illustration showing available and occupied parking spaces">
                  <div v-for="space in previewSpaces" :key="space.label"
                    class="parking-home-space" :class="{'parking-home-space-occupied': space.occupied}">
                    <span class="parking-home-space-number">{{ space.label }}</span>
                    <svg v-if="space.occupied" viewBox="0 0 40 72" width="30" height="57" class="parking-home-car" aria-hidden="true" focusable="false">
                      <rect x="5" y="2" width="30" height="68" rx="10" fill="currentColor" />
                      <path d="M10 18h20l-2 12H12zM12 48h16l2 9H10z" fill="#e9ecef" />
                      <path d="M6 30H3v17h3m28-17h3v17h-3" fill="none" stroke="currentColor" stroke-width="3" />
                    </svg>
                    <span v-else class="parking-home-space-open">Available</span>
                  </div>
                </div>
                <div class="parking-home-lane" aria-hidden="true"><span>&larr;</span> Easy in. Easy out. <span>&rarr;</span></div>
                <div class="parking-home-legend">
                  <span><i class="parking-home-dot parking-home-dot-open" aria-hidden="true"></i>Available</span>
                  <span><i class="parking-home-dot parking-home-dot-occupied" aria-hidden="true"></i>Occupied</span>
                  <span class="ml-auto">Your next stop, sorted.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="parking-home-steps" aria-labelledby="steps-heading">
        <div class="container">
          <div class="parking-home-section-heading">
            <p class="parking-home-eyebrow">From arrival to departure</p>
            <h2 id="steps-heading">Parking in three simple steps</h2>
            <p class="text-muted mb-0">Everything you need, without the extra hassle.</p>
          </div>
          <div class="row">
            <div v-for="step in steps" :key="step.number" class="col-md-4 mb-3">
              <article class="parking-home-step h-100">
                <span class="parking-home-step-number">{{ step.number }}</span>
                <h3>{{ step.title }}</h3>
                <p class="text-muted mb-0">{{ step.description }}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="parking-home-management" aria-labelledby="management-heading">
        <div class="container">
          <div class="parking-home-management-card">
            <div class="row align-items-center">
              <div class="col-lg-5 mb-4 mb-lg-0">
                <p class="parking-home-eyebrow">One app. Two perspectives.</p>
                <h2 id="management-heading">Simple for drivers.<br>Organized for admins.</h2>
                <p class="text-muted mb-0">From a single booking to an overview of every lot, ParkingApp keeps the details easy to follow.</p>
              </div>
              <div class="col-md-6 col-lg-3 offset-lg-1 mb-4 mb-md-0">
                <h3>For drivers</h3>
                <ul class="parking-home-feature-list">
                  <li>Search lots by name, address or PIN</li>
                  <li>Book and release a parking slot</li>
                  <li>Review booking history and costs</li>
                </ul>
              </div>
              <div class="col-md-6 col-lg-3">
                <h3>For administrators</h3>
                <ul class="parking-home-feature-list">
                  <li>Manage parking lots and capacity</li>
                  <li>Review occupancy and usage</li>
                  <li>Export data and explore statistics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer class="parking-home-footer">
        <div class="container d-flex flex-column flex-sm-row align-items-sm-center justify-content-between">
          <span class="parking-home-wordmark">ParkingApp</span>
          <span class="text-muted small mt-2 mt-sm-0">Find a space. Make your next stop easier.</span>
        </div>
      </footer>
    </main>
  `,
  data() {
    return {
      previewSpaces: [
        {label: 'A01', occupied: true},
        {label: 'A02', occupied: false},
        {label: 'A03', occupied: true},
        {label: 'A04', occupied: false},
        {label: 'B01', occupied: false},
        {label: 'B02', occupied: true},
        {label: 'B03', occupied: false},
        {label: 'B04', occupied: true},
      ],
      steps: [
        {number: '01', title: 'Find your lot', description: 'Browse parking locations, compare hourly rates, and check how many spaces are available.'},
        {number: '02', title: 'Book a space', description: 'Choose an available lot and enter your vehicle number to start your parking session.'},
        {number: '03', title: 'Head out, hassle-free', description: 'Release your slot when you leave. Review the parking duration and cost in your booking history.'},
      ],
    };
  },
  computed: {
    dashboardPath() {
      return this.$store.state.role === 'admin'
        ? '/admin-dashboard'
        : '/user-dashboard/' + this.$store.state.user_id;
    },
  },
};
