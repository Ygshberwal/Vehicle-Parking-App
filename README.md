# 🚗 Vehicle Parking App - V2

A multi-user web application built for managing 4-wheeler parking lots, spots, and reservations. Built as part of the **Modern Application Development II** course.

---

## 📌 Project Overview

This application allows:

- 🛠️ **Admins** to manage parking lots and view parking statistics.
- 👤 **Users** to book, release, and manage their parking spots.

Includes features like role-based access control, background job scheduling, caching, and a responsive front-end.

---

## 🧰 Tech Stack

### Frontend:
- ✅ Vue.js
- ✅ Bootstrap
- ✅ Axios
- ✅ Chart.js (for reports)

### Backend:
- ✅ Flask
- ✅ SQLite (ORM via SQLAlchemy)
- ✅ JWT Authentication / Flask-Login

### Background Jobs & Caching:
- ✅ Redis
- ✅ Celery

---

## 🔑 Roles & Permissions

| Role  | Capabilities |
|-------|--------------|
| Admin | Create/edit/delete parking lots, manage users, view all stats |
| User  | Register/login, reserve/release parking spots, view history |

---

## 🔄 Key Features

### Admin
- Create/edit/delete parking lots
- Auto-generate parking spots
- View status of all spots and reservations
- View charts of parking usage
- View all registered users

### User
- Register/login
- Book first available parking spot
- Release parking spot
- View personal booking history and reports
- Export booking data as CSV

---

## 🕒 Scheduled & Async Jobs

- 📩 **Daily Reminders** via email/chat webhook
- 📊 **Monthly Activity Reports** (HTML/PDF)
- 🧾 **CSV Export** triggered by user

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js & npm
- Redis

### Backend Setup
```bash
cd backend/
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask db init  # Or your db setup script
flask run
