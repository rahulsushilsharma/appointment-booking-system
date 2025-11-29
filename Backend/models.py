from pydantic import BaseModel


class AppointmentBase(BaseModel):
    timestamp: str
    name: str
    email: str
    phone: str | None = None
    reason: str | None = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentRead(AppointmentBase):
    id: int

    class Config:
        orm_mode = True
