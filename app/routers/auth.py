import uuid
import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.services.dynamo import create_user, get_user_by_email
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = settings.api_secret_key
ALGORITHM  = "HS256"
TOKEN_EXPIRE_DAYS = 30


# ── Schemas ───────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user_id: str
    name: str
    email: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email":   email,
        "exp":     datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    # Check if email already exists
    existing = get_user_by_email(body.email.lower())
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user_id = str(uuid.uuid4())
    hashed  = hash_password(body.password)

    create_user(
        user_id=user_id,
        name=body.name,
        email=body.email.lower(),
        hashed_password=hashed,
    )

    token = create_token(user_id, body.email.lower())

    return AuthResponse(
        token=token,
        user_id=user_id,
        name=body.name,
        email=body.email.lower(),
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    user = get_user_by_email(body.email.lower())

    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_token(user["user_id"], user["email"])

    return AuthResponse(
        token=token,
        user_id=user["user_id"],
        name=user["name"],
        email=user["email"],
    )