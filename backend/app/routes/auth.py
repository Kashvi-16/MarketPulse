from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.services.auth import create_user, get_user, verify_password, create_access_token

router = APIRouter()

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing = get_user(db, request.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    user = create_user(db, request.username, request.email, request.password)
    return {"message": "User created successfully", "username": user.username}

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = get_user(db, request.username)
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}