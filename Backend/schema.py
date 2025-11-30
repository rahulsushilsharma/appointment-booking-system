from pydantic import BaseModel, EmailStr, field_validator
from datetime import timezone
from datetime import datetime


class AppointmentBase(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    reason: str | None = None
    start_time: datetime
    end_time: datetime

    @field_validator("start_time", "end_time")
    def to_utc(cls, v: datetime):
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)


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
    booked: bool = False


class AvailableSlotsResponse(BaseModel):
    available_slots: list[AvailableSlot]
    booked_slots: list[AppointmentRead]
