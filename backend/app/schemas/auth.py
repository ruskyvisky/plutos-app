from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


# ─── Request Şemaları ─────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class OnboardingRequest(BaseModel):
    answers: list[int]   # [q1_choice, q2_choice, q3_choice, q4_choice] — 0=A, 1=B, 2=C


# ─── Response Şemaları ────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    investor_profile: Optional[str] = None
    onboarding_done: bool = False

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None
