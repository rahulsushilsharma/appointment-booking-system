Here is the **updated README**, rewritten in the **same simple style**, and now includes **all new endpoint documentations**, including search and update.

---

# Access the App Online

You can access the deployed version of the Local Appointment Booking System here:

**Frontend:** [https://appointment-booking-system-nu.vercel.app/](https://appointment-booking-system-nu.vercel.app/)

# Backend API

You can view the backend API docs and test endpoints here:

**Backend Docs:** [https://appointment-booking-system-kjuw.onrender.com/docs](https://appointment-booking-system-kjuw.onrender.com/docs)

---

# Local Appointment Booking System — Setup Guide

## Backend API Documentation

This section explains how to set up and run the FastAPI backend server locally.

---

## Prerequisites

- Python 3.8+
- pip
- virtualenv (recommended)

---

## Installation

```bash
pip install -r requirements.txt
```

---

## Running the Server

```bash
uvicorn main:app --reload --port 8000 --env-file .env
```

The backend will run at:

**[http://localhost:8000](http://localhost:8000)**

---

## API Endpoints

### **Authentication**

- `POST /auth/register` — Register a new user
- `POST /auth/login` — Login and receive access token
- All appointment endpoints require a valid bearer token

---

### **Appointments**

#### **Create Appointment**

- `POST /api/appointments`
- Creates an appointment (supports weekly recurring appointments)

#### **Get All Appointments**

- `GET /api/appointments`
- Returns all appointments (requires auth)

#### **Get Available Time Slots**

- `GET /api/appointments/available?start_date=YYYY-MM-DD`
- Returns available and booked slots starting from a given week

#### **Cancel Appointment**

- `DELETE /api/appointments/{id}`
- Marks an appointment as cancelled

#### **Search Appointments**

- `GET /api/appointments/search?q=...&date=YYYY-MM-DD`
- Search by name, email, phone, reason, or by date

#### **Update Appointment**

- `PATCH /api/appointments/{id}`
- Update an existing appointment (30-minute slot, weekday, must not conflict)

---

## Environment Variables

The backend uses a `.env` file.

Common variables:

```
DATABASE_URL=sqlite:///./appointments.db
SECRET_KEY=your_jwt_secret
ALGORITHM=HS256
```

---

# Frontend Application Documentation

Instructions to run the React frontend.

---

## Prerequisites

- Node.js 20+
- npm / yarn / pnpm

---

## Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

---

## Running the App

```bash
npm run dev
# or
yarn dev
# or
pnpm run dev
```

The frontend will run at:

**[http://localhost:5173](http://localhost:5173)**

---
