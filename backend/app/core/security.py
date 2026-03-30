import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.core.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRY_DAYS
from app.core.exceptions import UnauthorizedError


# ── Password ──────────────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    """Bcrypt-hash a password."""
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ── JWT ───────────────────────────────────────────────────────────────────────

def create_access_token(
    subject: str,
    *,
    extra_claims: Optional[dict] = None,
    expiry_days: int = JWT_EXPIRY_DAYS,
    expiry_minutes: Optional[int] = None,
) -> str:
    """
    Create a signed JWT access token.

    Args:
        subject: The user_id (or admin_id) to embed.
        extra_claims: Optional dict of additional payload fields.
        expiry_days: Token lifetime in days (default from config).
    """
    now = datetime.now(tz=timezone.utc)
    payload: dict = {
        "sub": subject,                           # standard "subject" claim
        "iat": now,
        "exp": now + (timedelta(minutes=expiry_minutes) if expiry_minutes is not None else timedelta(days=expiry_days)),
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(subject: str, *, extra_claims: Optional[dict] = None) -> str:
    """Create a refresh token valid for 7 days with type=refresh claim."""
    claims = {"type": "refresh"}
    if extra_claims:
        claims.update(extra_claims)
    return create_access_token(subject, extra_claims=claims, expiry_days=7)


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT.

    Returns the full payload dict on success.
    Raises UnauthorizedError on expiry or invalidity.
    """
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise UnauthorizedError("Token has expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise UnauthorizedError("Invalid token. Please log in again.")


def get_subject(token: str) -> str:
    """Convenience: decode token and return the 'sub' claim."""
    return decode_access_token(token)["sub"]
