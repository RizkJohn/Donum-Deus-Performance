"""Account contracts. Passwords never round-trip past the hashing boundary —
`UserOut` is the only shape returned to clients."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

SubscriptionTier = Literal["foundation", "practice", "stewardship"]


class SignupRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class UserOut(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str
    email: str
    subscription_tier: SubscriptionTier | None
    subscription_status: str | None


class AuthResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    token: str
    user: UserOut
