from datetime import datetime, time, timedelta, timezone
from schema import AvailableSlot
from models import Appointment


def is_valid_slot(start: datetime, end: datetime) -> bool:
    # 30-minute increments
    if start.minute not in (0, 30) or end.minute not in (0, 30):
        return False

    # Business hours: 9 AM – 5 PM
    if not (9 <= start.hour < 17):
        return False
    if end.hour > 17 or (end.hour == 17 and end.minute > 0):
        return False

    return True


def get_aviailable_slots(booked: list[Appointment]) -> list[AvailableSlot]:
    booked_slots = {a.start_time for a in booked}
    now = datetime.now(timezone.utc)
    available_slots: list[AvailableSlot] = []
    for i in range(7):
        day = now.date() + timedelta(days=i)

        if day.weekday() >= 5:  # skip weekends
            continue

        slot_time = datetime.combine(day, time(9, 0), tzinfo=timezone.utc)
        end_of_day = datetime.combine(day, time(17, 0), tzinfo=timezone.utc)

        while slot_time < end_of_day:

            if slot_time >= now and slot_time not in booked_slots:
                available_slots.append(
                    AvailableSlot(
                        date=str(day),
                        time=slot_time.strftime("%H:%M"),
                        datetime_slot=slot_time,
                    )
                )

            slot_time += timedelta(minutes=30)

    return available_slots
