# Local Appointment Booking System

A simple full-stack appointment booking system with:

- Weekly calendar view
- 30-minute appointment slots
- Authentication
- Booking, editing, searching, and cancelling
- Deployment for both frontend and backend

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

# Features

## Frontend Features

- **Weekly Calendar View**

  - Displays current week (Mon–Fri)
  - Shows slots from **9:00 AM – 5:00 PM**
  - Slots are highlighted as _available_ or _booked_
  - 30-minute increments

- **Booking Form**

  - Select time slot
  - Enter: Name, Email, Phone (optional), Reason (optional)
  - Email validation handled on frontend + backend
  - Shows success and error alerts

- **Appointments List**

  - Displays all appointments
  - Chronological order
  - Cancel button for each appointment
  - Automatic refresh after changes

- **Searching**

  - Search by name, email, phone, or reason
  - Filter by date

- **Edit Appointment**

  - Update booked appointment details
  - Only if not cancelled
  - Full form UI with validations

- **Authentication**

  - Register & Login
  - Access token stored in memory & refreshed on page reload
  - Private routes protected

---

## Backend Features

- **JWT Authentication**
- **Create, Read, Search, Edit, Cancel appointments**
- **Recurring weekly appointments**
- **Business hour validation**
- **No double-booking**
- **No weekend bookings**
- **No past bookings**
- **Search API with text + date filters**
- **30-minute appointment rule**
- **CORS configured for production frontend**

# Tech Stack

## Backend Stack

- FastAPI + Python
- SQLite database with SQLAlchemy ORM
- Pydantic models for validation
- Uvicorn server
- Render.com hosting

## Frontend Stack

- React + TypeScript
- TailwindCSS for styling
- Vercel for deployment

# Tests

**No automated tests are included in this version**
(Manual testing performed using UI and Swagger.)

## deployment

- Frontend deployed on Vercel automatically from main branch.
- Backend deployed on Render.com automatically from main branch.
