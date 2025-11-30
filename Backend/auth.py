from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from database import get_db
from models import User
from schema import RegisterBody

router = APIRouter(prefix="/api/auth")

SECRET_KEY = "CHANGEME_SECRET"
ALGO = "HS256"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(hours=3)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGO)


def verify_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGO])
    except JWTError:
        return None


@router.post("/register")
def register(body: RegisterBody, db: Session = Depends(get_db)):

    name = body.name
    email = body.email
    password = body.password
    if not password:
        raise HTTPException(400, "Password is required")
    if len(password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters long")
    if not name:
        raise HTTPException(400, "Name is required")
    if not email:
        raise HTTPException(400, "Email is required")

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(400, "Email already registered")

    hashed = pwd.hash(password)

    user = User(full_name=name, email=email, password_hash=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"id": user.id, "email": user.email}


@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()

    if not user or not pwd.verify(password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")

    token = create_token({"user_id": user.id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.full_name, "email": user.email},
    }


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(401, "Missing Authorization header")

    token = authorization.split(" ")[1]
    decoded = verify_token(token)

    if not decoded:
        raise HTTPException(401, "Invalid token")

    user = db.query(User).filter(User.id == decoded["user_id"]).first()

    if not user:
        raise HTTPException(401, "User not found")

    return user
