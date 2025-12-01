from fastapi import Body, FastAPI, Depends, HTTPException, Query
from dotenv import load_dotenv
from database import engine, get_db
from models import Base, Appointment
from schema import AppointmentCreate, AppointmentRead, AvailableSlotsResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, time, timezone
from utils import is_valid_slot, get_aviailable_slots
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router, get_current_user


# loading the environment variables from .env file
load_dotenv()

allowed_origins = [
    "http://localhost:5173",
    "https://appointment-booking-system-nu.vercel.app",
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)


# GET /api/appointments - Get all appointments
# GET /api/appointments/available - Get available time slots
# POST /api/appointments - Create appointment
# DELETE /api/appointments/:id - Cancel appointment

# Prevent double-booking, validate business hours
# only, no past bookings, proper HTTP status codes.

app.include_router(auth_router)


@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.get("/api/appointments", response_model=list[AppointmentRead])
async def get_appointments(
    db: Session = Depends(get_db), user=Depends(get_current_user)
):
    try:
        appointments = db.query(Appointment).all()
        return appointments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/appointments/available", response_model=AvailableSlotsResponse)
async def get_available_slots(
    start_date: str | None = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        if start_date:
            # Parse with UTC midnight
            week_start = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
        else:
            week_start = datetime.now(timezone.utc)

        booked = (
            db.query(Appointment)
            .filter(
                Appointment.start_time >= week_start, Appointment.cancelled == False
            )
            .all()
        )

        available_slots = get_aviailable_slots(booked, week_start)
        pydandic_booked = [AppointmentRead.model_validate(a) for a in booked]

        return AvailableSlotsResponse(
            available_slots=available_slots, booked_slots=pydandic_booked
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/appointments", response_model=list[AppointmentRead])
async def create_appointment(
    appt: AppointmentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        start = appt.start_time
        end = appt.end_time
        now = datetime.now(timezone.utc)

        if start < now:
            raise HTTPException(400, "Cannot book past time")

        if not is_valid_slot(start, end):
            raise HTTPException(400, "Outside business hours or invalid slot")

        repeat = appt.repeat or 0

        created_appointments = []

        for i in range(repeat + 1):
            occ_start = start + timedelta(weeks=i)
            occ_end = end + timedelta(weeks=i)

            if occ_start.weekday() >= 5:
                raise HTTPException(400, f"Occurrence {i} falls on weekend")

            conflict = (
                db.query(Appointment)
                .filter(
                    Appointment.start_time == occ_start,
                    Appointment.cancelled == False,
                )
                .first()
            )

            if conflict:
                raise HTTPException(
                    409,
                    f"Slot already booked for occurrence #{i + 1} at {occ_start.isoformat()}",
                )

            new_appointment = Appointment(
                timestamp=datetime.now(timezone.utc),
                name=appt.name,
                email=appt.email,
                phone=appt.phone,
                reason=appt.reason,
                start_time=occ_start,
                end_time=occ_end,
                cancelled=False,
            )

            db.add(new_appointment)
            created_appointments.append(new_appointment)

        db.commit()
        for ap in created_appointments:
            db.refresh(ap)

        return [AppointmentRead.model_validate(a) for a in created_appointments]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.delete("/api/appointments/{id}")
async def cancel_appointment(
    id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
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


@app.get("/api/appointments/search", response_model=list[AppointmentRead])
async def search_appointments(
    q: str = Query(None),
    date: str | None = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        query = db.query(Appointment)

        # Filter by search text
        if q:
            like = f"%{q}%"
            query = query.filter(
                Appointment.name.ilike(like)
                | Appointment.email.ilike(like)
                | Appointment.reason.ilike(like)
                | Appointment.phone.ilike(like)
            )

        # Filter by date
        if date:
            date_start = datetime.fromisoformat(date).replace(
                hour=0, minute=0, second=0, tzinfo=timezone.utc
            )
            date_end = date_start + timedelta(days=1)
            query = query.filter(
                Appointment.start_time >= date_start,
                Appointment.start_time < date_end,
            )

        query = query.order_by(Appointment.start_time.asc())
        results = query.all()

        return [AppointmentRead.model_validate(r) for r in results]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/appointments/{id}", response_model=AppointmentRead)
async def update_appointment(
    id: int,
    appt: AppointmentCreate = Body(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:

        existing = db.query(Appointment).filter(Appointment.id == id).first()

        if not existing:
            raise HTTPException(404, "Appointment not found")

        if existing.cancelled:
            raise HTTPException(400, "Cannot edit a cancelled appointment")

        start = appt.start_time
        end = appt.end_time
        now = datetime.now(timezone.utc)
        duration = (end - start).total_seconds() / 60
        if duration != 30:
            raise HTTPException(400, "Appointment duration must be exactly 30 minutes")

        if start.weekday() >= 5:
            raise HTTPException(400, "Appointments cannot be on weekends")

        if start.minute not in [0, 30]:
            raise HTTPException(400, "Start time must be in 30-minute increments")

        if start < now:
            raise HTTPException(400, "Cannot edit appointment to a past time")

        if not is_valid_slot(start, end):
            raise HTTPException(400, "Outside business hours or invalid slot")

        conflict = (
            db.query(Appointment)
            .filter(
                Appointment.start_time == start,
                Appointment.id != id,
                Appointment.cancelled == False,
            )
            .first()
        )

        if conflict:
            raise HTTPException(409, "Another appointment already booked at that time")

        existing.name = appt.name
        existing.email = appt.email
        existing.phone = appt.phone
        existing.reason = appt.reason
        existing.start_time = start
        existing.end_time = end

        db.commit()
        db.refresh(existing)

        return AppointmentRead.model_validate(existing)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))
