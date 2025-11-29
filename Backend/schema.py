from pydantic import BaseModel


class AppointmentBase(BaseModel):
    timestamp: str
    name: str
    email: str
    phone: str | None = None
    reason: str | None = None
    cancled: int | None = 0  # 0 for active, 1 for canceled


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentRead(AppointmentBase):
    id: int

    class Config:
        from_attributes = True
