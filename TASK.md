# 🚗 Vehicle Parking App - V2: Task Tracker

A roadmap to build the MAD II project in 4 weeks. Check off tasks as you complete them ✅

---

## 📅 Week 1: Project Setup & Backend Foundation

- [x] Setup Flask project structure with virtualenv
- [x] Initialize Git and create `.gitignore`
- [x] Install backend dependencies (`Flask`, `SQLAlchemy`, `Flask-JWT`, etc.)
- [x] Create database models:
  - [x] User (admin & regular user)
  - [x] ParkingLot
  - [x] ParkingSpot
  - [x] Reservation
- [x] Auto-create Admin when DB is initialized
- [ ] Implement JWT or Flask-Login for auth
- [ ] Create basic REST APIs:
  - [ ] Register/Login (user)
  - [ ] Login (admin)
  - [ ] Create/View/Edit/Delete Parking Lot (admin)
  - [ ] View Parking Spot Status
  - [ ] Reserve Spot (user)
  - [ ] Release Spot (user)

---

## 📅 Week 2: Frontend Development with VueJS

- [ ] Initialize Vue project with Bootstrap
- [ ] Set up Vue Router
- [ ] Create login/register components
- [ ] Create Admin dashboard components:
  - [ ] Create/Edit/Delete Parking Lots
  - [ ] View Parking Spots
  - [ ] View Users
- [ ] Create User dashboard components:
  - [ ] Book Spot (auto-assigned)
  - [ ] Release Spot
  - [ ] View Booking History
- [ ] Connect frontend with backend APIs via Axios

---

## 📅 Week 3: Async Jobs, Caching, Charts

- [ ] Set up Redis and Celery
- [ ] Implement Celery scheduled tasks:
  - [ ] Daily user reminder (email/chat webhook)
  - [ ] Monthly activity report (HTML or PDF + email)
- [ ] Create user-triggered CSV export
  - [ ] Async job + download link/email alert
- [ ] Add caching for performance
  - [ ] Parking lot listing
  - [ ] Parking spot status
  - [ ] Cache expiry setup
- [ ] Integrate ChartJS for analytics:
  - [ ] Admin: spot usage, lot popularity
  - [ ] User: history summary

---

## 📅 Week 4: Final Polish, Testing, and Submission

- [ ] Add frontend validation
- [ ] Add backend validation & error handling
- [ ] Make UI responsive for mobile and desktop
- [ ] Manual testing (user/admin flow)
- [ ] Finalize all APIs
- [ ] Create project report (5 pages)
- [ ] Record and upload presentation video
- [ ] Zip codebase and submit final version

---

## ✅ Optional Features

- [ ] Dummy payment view
- [ ] "Add to Desktop" PWA feature
- [ ] PDF reports for monthly summary

---

### 📝 Notes

- Use `SQLite` programmatically (no manual DB creation)
- Use only Bootstrap for styling (no Tailwind/Bulma/etc.)
- Submit everything in a single zip
