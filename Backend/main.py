from fastapi import FastAPI

app = FastAPI()

# GET /api/appointments - Get all appointments
# GET /api/appointments/available - Get available time slots
# POST /api/appointments - Create appointment
# DELETE /api/appointments/:id - Cancel appointment


@app.get("/")
async def read_root():
    return {"Hello": "World"}
