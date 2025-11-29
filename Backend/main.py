from fastapi import FastAPI
from dotenv import load_dotenv
from Backend import database, models, schema


# loading the environment variables from .env file
load_dotenv()

app = FastAPI()

# Create tables
models.Base.metadata.create_all(bind=database.engine)


# GET /api/appointments - Get all appointments
# GET /api/appointments/available - Get available time slots
# POST /api/appointments - Create appointment
# DELETE /api/appointments/:id - Cancel appointment


@app.get("/")
async def read_root():
    return {"Hello": "World"}
