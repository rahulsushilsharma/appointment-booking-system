from fastapi import FastAPI
from dotenv import load_dotenv
from database import engine
from models import Base
from schema import AppointmentCreate


# loading the environment variables from .env file
load_dotenv()

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)


# GET /api/appointments - Get all appointments
# GET /api/appointments/available - Get available time slots
# POST /api/appointments - Create appointment
# DELETE /api/appointments/:id - Cancel appointment

# Prevent double-booking, validate business hours
# only, no past bookings, proper HTTP status codes.


@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.get("/api/appointments")
async def get_appointments():

    return {"message": "Get all appointments"}


@app.get("/api/appointments/available")
async def get_available_slots():
    return {"message": "Get available time slots"}


@app.post("/api/appointments")
async def create_appointment(appointment: AppointmentCreate):
    return {"message": "Create appointment"}


@app.delete("/api/appointments/{id}")
async def cancel_appointment(id: int):
    return {"message": f"Cancel appointment with id {id}"}
