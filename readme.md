# Access the app online

You can access the deployed version of the Local Appointment Booking System at the following URL:

- [https://appointment-booking-system-nu.vercel.app/](https://appointment-booking-system-nu.vercel.app/)

# Backend API

you can access the backend API documentation and test the endpoints using the following URL:

- [https://appointment-booking-system-kjuw.onrender.com/docs](https://appointment-booking-system-kjuw.onrender.com/docs)

# Local Appointment Booking System setup Guide

## Backend API Documentation

setup and run the FastAPI backend server locally.

### Prerequisites

- Python 3.8 or later
- pip
- virtualenv (optional but recommended)

### Installation

```bash
pip install -r requirements.txt
```

### Usage

```bash
uvicorn main:app --reload --port 8000 --env-file .env
```

### API Endpoints

- `POST /appointments/`: Create a new appointment.
- `GET /appointments/`: Get all appointments.
- `GET /appointments/available`: Get available time slots.
- `DELETE /appointments/{id}`: Cancel an appointment by ID.

### Environment Variables

- `DATABASE_URL`: The database connection string for SQLite. Defaults to an in-memory database.

The backend server will be accessible at `http://localhost:8000` by default.

## Frontend Application Documentation

This section provides instructions to set up and run the React frontend application for the appointment booking system.

### Prerequisites

- Node.js (version 20 or later)
- npm (version 9 or later) or yarn (version 1 or later) or pnpm

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Usage

```bash
npm run dev
# or
yarn dev
# or
pnpm run dev
```

The application will be accessible at `http://localhost:5173` by default.
