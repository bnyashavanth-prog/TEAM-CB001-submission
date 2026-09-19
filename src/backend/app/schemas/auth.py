from pydantic import BaseModel, Field
from typing import Optional

class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str
    password: str = Field(min_length=8, max_length=128)
    role: str
    service_area: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    service_area: Optional[str] = None
    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    token: str
    user: UserResponse
