from pydantic import BaseModel, EmailStr
from datetime import datetime


class AppointmentBase(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    reason: str | None = None
    start_time: datetime
    end_time: datetime


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentRead(AppointmentBase):
    id: int
    timestamp: datetime
    cancelled: bool

    class Config:
        from_attributes = True


class AvailableSlot(BaseModel):
    date: str
    time: str
    datetime_slot: datetime
