"""Email/password auth: register, login, whoami.

Tokens are JWTs (Bearer). Anonymous funnel endpoints (/v1/assess) keep
working; authenticated endpoints attach programs to the user.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import User
from ..db.session import get_db
from ..deps import get_current_user
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/v1/auth", tags=["auth"])


class Credentials(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)


class TokenResponse(BaseModel):
    token: str
    user: "UserOut"


class UserOut(BaseModel):
    id: str
    email: str


TokenResponse.model_rebuild()


@router.post("/register", response_model=TokenResponse)
async def register(body: Credentials, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    existing = (
        await db.execute(select(User).where(User.email == str(body.email)))
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=409, detail="email already registered")
    user = User(email=str(body.email), password_hash=hash_password(body.password))
    db.add(user)
    await db.commit()
    return TokenResponse(
        token=create_access_token(user.id), user=UserOut(id=user.id, email=user.email)
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: Credentials, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    user = (
        await db.execute(select(User).where(User.email == str(body.email)))
    ).scalar_one_or_none()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="invalid email or password")
    return TokenResponse(
        token=create_access_token(user.id), user=UserOut(id=user.id, email=user.email)
    )


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut(id=user.id, email=user.email)
