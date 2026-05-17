import os
import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext

from .database import get_user_by_email, get_user_by_id, create_user

load_dotenv()

# --- Config --------------------------------------------------------------
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY or SECRET_KEY in ("default_secret", "changeme", ""):
    # Fail loud — never start with a weak/missing secret in any environment.
    raise RuntimeError(
        "JWT_SECRET_KEY is not set or is using an insecure default. "
        "Generate one with:  python -c \"import secrets; print(secrets.token_urlsafe(48))\""
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_TTL_MINUTES = int(os.getenv("ACCESS_TOKEN_TTL_MINUTES", "60"))   # 1h
REFRESH_TOKEN_TTL_DAYS = int(os.getenv("REFRESH_TOKEN_TTL_DAYS", "7"))         # 7d
ISSUER = os.getenv("JWT_ISSUER", "complico")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=True)


# --- Password helpers ----------------------------------------------------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        return False


def validate_password_strength(password: str) -> Optional[str]:
    """Return None if OK, else a human-readable reason string."""
    if len(password) < 10:
        return "Password must be at least 10 characters."
    if not re.search(r"[A-Z]", password):
        return "Password must contain an uppercase letter."
    if not re.search(r"[a-z]", password):
        return "Password must contain a lowercase letter."
    if not re.search(r"\d", password):
        return "Password must contain a digit."
    return None


def validate_email(email: str) -> bool:
    return bool(EMAIL_RE.match(email or ""))


# --- Token helpers -------------------------------------------------------
def _build_token(sub: str, ttl: timedelta, token_type: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": sub,
        "iss": ISSUER,
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "exp": int((now + ttl).timestamp()),
        "type": token_type,
        "jti": secrets.token_urlsafe(16),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_access_token(user_id: int) -> str:
    return _build_token(str(user_id), timedelta(minutes=ACCESS_TOKEN_TTL_MINUTES), "access")


def create_refresh_token(user_id: int) -> str:
    return _build_token(str(user_id), timedelta(days=REFRESH_TOKEN_TTL_DAYS), "refresh")


def _decode(token: str, expected_type: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            issuer=ISSUER,
            options={"require": ["exp", "iat", "sub", "type"]},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token expired")
    except jwt.InvalidIssuerError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token issuer")
    except jwt.InvalidTokenError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")

    if payload.get("type") != expected_type:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Wrong token type")
    return payload


# --- User flows ----------------------------------------------------------
def register_user(email: str, password: str, full_name: str = "", company: str = "") -> dict:
    if not validate_email(email):
        raise HTTPException(400, "Invalid email address.")
    reason = validate_password_strength(password)
    if reason:
        raise HTTPException(400, reason)
    if get_user_by_email(email):
        raise HTTPException(409, "An account with that email already exists.")

    user_id = create_user(
        email=email,
        password_hash=hash_password(password),
        full_name=full_name.strip(),
        company=company.strip(),
    )
    return {"id": user_id, "email": email.lower().strip(), "full_name": full_name, "company": company}


def authenticate_user(email: str, password: str) -> Optional[dict]:
    user = get_user_by_email(email)
    if not user:
        # Run a dummy verify to keep response time uniform (mitigates user enumeration).
        pwd_context.dummy_verify()
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    return user


# --- FastAPI dependency --------------------------------------------------
async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    payload = _decode(creds.credentials, expected_type="access")
    try:
        user_id = int(payload["sub"])
    except (TypeError, ValueError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Malformed token subject")

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User no longer exists")
    return user


async def refresh_access(refresh_token: str) -> dict:
    payload = _decode(refresh_token, expected_type="refresh")
    user_id = int(payload["sub"])
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User no longer exists")
    return {
        "access_token": create_access_token(user_id),
        "refresh_token": create_refresh_token(user_id),
        "token_type": "bearer",
    }
