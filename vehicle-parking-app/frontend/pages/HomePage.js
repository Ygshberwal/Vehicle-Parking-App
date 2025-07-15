export default {
  template: `
    <div class="bg-white text-dark">

      <!-- Hero Section -->
      <section class="bg-gradient text-white text-center py-5" style="background: linear-gradient(135deg, #0d6efd, #6610f2);">
        <div class="container">
          <h1 class="display-3 fw-bold mb-3">Welcome to ParkingMaster</h1>
          <p class="lead mb-4">Seamlessly find, book, and manage your parking—faster than ever before.</p>
          <div>
            <router-link class="btn btn-light btn-lg rounded-pill me-3 px-4" to="/login" active-class="active">Login</router-link>
            <router-link class="btn btn-outline-light btn-lg rounded-pill px-4" to="/register" active-class="active">Register</router-link>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="py-5">
        <div class="container text-center">
          <h2 class="fw-semibold mb-4">How It Works</h2>
          <div class="row g-4">
            <div class="col-md-4">
              <div class="p-4 shadow-sm rounded bg-white h-100 border">
                <div class="mb-3 fs-1 text-primary">🔍</div>
                <h5 class="fw-bold">Search Lots</h5>
                <p class="text-muted">Find available parking spaces near your destination with ease.</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="p-4 shadow-sm rounded bg-white h-100 border">
                <div class="mb-3 fs-1 text-primary">🅿️</div>
                <h5 class="fw-bold">Reserve Your Spot</h5>
                <p class="text-muted">Book a slot instantly and skip the hassle of finding parking manually.</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="p-4 shadow-sm rounded bg-white h-100 border">
                <div class="mb-3 fs-1 text-primary">📊</div>
                <h5 class="fw-bold">Track Your Parking</h5>
                <p class="text-muted">Monitor past bookings and monthly expenses through smart stats.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-5 bg-light border-top">
        <div class="container">
          <h2 class="text-center fw-semibold mb-5">Features That Make Us Stand Out</h2>
          <div class="row text-center g-4">
            <div class="col-md-3">
              <div class="p-3 bg-white shadow-sm rounded h-100 border">
                <div class="fs-1 text-success">📍</div>
                <h6 class="fw-semibold mt-3">Geo-Based Lot Discovery</h6>
              </div>
            </div>
            <div class="col-md-3">
              <div class="p-3 bg-white shadow-sm rounded h-100 border">
                <div class="fs-1 text-success">⏰</div>
                <h6 class="fw-semibold mt-3">Live Slot Tracking</h6>
              </div>
            </div>
            <div class="col-md-3">
              <div class="p-3 bg-white shadow-sm rounded h-100 border">
                <div class="fs-1 text-success">📈</div>
                <h6 class="fw-semibold mt-3">Usage Analytics</h6>
              </div>
            </div>
            <div class="col-md-3">
              <div class="p-3 bg-white shadow-sm rounded h-100 border">
                <div class="fs-1 text-success">🧠</div>
                <h6 class="fw-semibold mt-3">Admin Insights</h6>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Admin CTA -->
      <section class="py-5 text-center">
        <div class="container">
          <h2 class="fw-bold mb-2">Own a Parking Lot?</h2>
          <p class="mb-4 text-muted">Use our tools to manage, analyze, and grow your parking business effortlessly.</p>
          <router-link class="btn btn-primary btn-lg rounded-pill px-4" to="/admin-dashboard" active-class="active">Access Admin Panel</router-link>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="py-5 bg-light">
        <div class="container text-center">
          <h2 class="fw-semibold mb-4">What Our Users Say</h2>
          <div class="row g-4">
            <div class="col-md-4">
              <div class="bg-white p-4 rounded shadow-sm h-100">
                <p class="mb-2 fst-italic">“Smooth experience, especially during busy hours!”</p>
                <footer class="blockquote-footer">Yogesh Berwal ⭐⭐⭐⭐⭐</footer>
              </div>
            </div>
            <div class="col-md-4">
              <div class="bg-white p-4 rounded shadow-sm h-100">
                <p class="mb-2 fst-italic">“My go-to app for daily parking near the office.”</p>
                <footer class="blockquote-footer">Rajat Rabiya ⭐⭐⭐⭐⭐</footer>
              </div>
            </div>
            <div class="col-md-4">
              <div class="bg-white p-4 rounded shadow-sm h-100">
                <p class="mb-2 fst-italic">“Love the monthly reports. Very useful insights!”</p>
                <footer class="blockquote-footer">Himani Punia ⭐⭐⭐⭐⭐</footer>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-dark text-white text-center py-4">
        <div class="container">
          <p class="mb-2">© 2025 <strong>Vehicle-Parking-App</strong>. All rights reserved.</p>
          <p class="mb-0 small">
            <a href="#" class="text-white text-decoration-none me-3">Privacy Policy</a>
            <a href="#" class="text-white text-decoration-none">Terms of Use</a>
          </p>
        </div>
      </footer>

    </div>
  `
}
