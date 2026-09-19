from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import create_token, current_user, hash_password, verify_password
from app.db.database import get_db
from app.db.models.models import User
from app.schemas.auth import AuthResponse, LoginRequest, SignupRequest, UserResponse

router = APIRouter(tags=["Authentication"])

class WorkerCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str
    password: str = Field(min_length=8, max_length=128)

@router.post("/signup", response_model=AuthResponse)
async def signup(payload: SignupRequest, db: AsyncSession = Depends(get_db)):
    role = payload.role.upper()
    if role != "PUBLIC":
        raise HTTPException(403, "Worker accounts are created by MCC only")
    area = None
    existing = await db.execute(select(User).where(User.email == payload.email.lower()))
    if existing.scalars().first():
        raise HTTPException(409, "An account already exists for this email")
    user = User(name=payload.name, email=payload.email.lower(), role=role, password_hash=hash_password(payload.password), service_area=area)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return AuthResponse(token=create_token(user), user=user)

@router.post("/workers", response_model=UserResponse)
async def create_worker(payload: WorkerCreateRequest, db: AsyncSession = Depends(get_db), admin: User = Depends(current_user)):
    if admin.role != "ADMIN":
        raise HTTPException(403, "MCC administrator access is required")
    email = payload.email.lower()
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalars().first():
        raise HTTPException(409, "An account already exists for this email")
    worker = User(name=payload.name, email=email, role="WORKER", password_hash=hash_password(payload.password))
    db.add(worker)
    await db.commit()
    await db.refresh(worker)
    return worker

@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalars().first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    return AuthResponse(token=create_token(user), user=user)

@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(current_user)):
    return user
