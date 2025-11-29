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
