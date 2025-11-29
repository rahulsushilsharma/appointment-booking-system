from fastapi import FastAPI, Depends, HTTPException
from dotenv import load_dotenv
from database import engine, get_db
from models import Base, Appointment
from schema import AppointmentCreate, AppointmentRead, AvailableSlot
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, time, timezone
from utils import is_valid_slot, get_aviailable_slots

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


@app.get("/api/appointments", response_model=list[AppointmentRead])
async def get_appointments(db: Session = Depends(get_db)):
    try:
        appointments = db.query(Appointment).all()
        return appointments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/appointments/available", response_model=list[AvailableSlot])
async def get_available_slots(db: Session = Depends(get_db)):
    try:
        now = datetime.now(timezone.utc)

        booked = (
            db.query(Appointment)
            .filter(Appointment.start_time >= now, Appointment.cancelled == False)
            .all()
        )

        available_slots = get_aviailable_slots(booked)

        return available_slots

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/appointments", response_model=AppointmentRead)
async def create_appointment(appt: AppointmentCreate, db: Session = Depends(get_db)):
    try:
        start = appt.start_time
        end = appt.end_time
        now = datetime.now(timezone.utc)

        if start < now:
            raise HTTPException(400, "Cannot book past time")

        if not is_valid_slot(start, end):
            raise HTTPException(400, "Outside business hours or invalid slot")

        exists = (
            db.query(Appointment)
            .filter(Appointment.start_time == start, Appointment.cancelled == False)
            .first()
        )

        if exists:
            raise HTTPException(409, "This slot is already booked")

        new_appointment = Appointment(
            timestamp=datetime.now(timezone.utc),
            name=appt.name,
            email=appt.email,
            phone=appt.phone,
            reason=appt.reason,
            start_time=start,
            end_time=end,
            cancelled=False,
        )

        db.add(new_appointment)
        db.commit()
        db.refresh(new_appointment)

        return new_appointment

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.delete("/api/appointments/{id}")
async def cancel_appointment(id: int, db: Session = Depends(get_db)):
    try:
        appt = db.query(Appointment).filter(Appointment.id == id).first()
        if not appt:
            raise HTTPException(404, "Appointment not found")

        pydandic_appt = AppointmentRead.model_validate(appt)
        if pydandic_appt.cancelled:
            raise HTTPException(400, "Appointment already cancelled")

        db.query(Appointment).filter(Appointment.id == id).update({"cancelled": 1})
        db.commit()

        return {"message": f"Appointment {id} cancelled"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))
