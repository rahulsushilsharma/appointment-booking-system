from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, Integer, String, DateTime


class Base(DeclarativeBase):
    pass


class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    reason = Column(String, nullable=True, length=200)
