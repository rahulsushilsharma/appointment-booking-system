from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

db_url = os.getenv("DATABASE_URL", "")
if not db_url:
    raise ValueError("DATABASE_URL environment variable is not set.")


engine = create_engine(
    db_url,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
