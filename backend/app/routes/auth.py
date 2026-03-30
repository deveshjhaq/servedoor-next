"""
auth.py — Authentication endpoints for Customers and Admins.
"""
from fastapi import APIRouter, Request, Response, Cookie
from pydantic import BaseModel
import logging

from app.core.responses import ok, error
from app.services.auth_service import auth_service
from app.core.exceptions import BadRequestError
from app.core.rate_limit import limiter
from app.core.security import decode_access_token, create_access_token, create_refresh_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# ── Schemas ──
class SendOTPRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str
    name: str = ""
    email: str = None

class VerifyAdminOTPRequest(BaseModel):
    phone: str
    otp: str
    password: str

# ── Customer Endpoints ──
@router.post("/send-otp")
@limiter.limit("5/minute")
async def send_user_otp(request: Request, req: SendOTPRequest):
    """Request an OTP for customer login/registration."""
    res = await auth_service.initiate_user_login(req.phone)
    if not res.get("success"):
        raise BadRequestError(res.get("error", "Failed to send OTP"))
    return ok(message="OTP sent successfully")

@router.post("/verify-otp")
@limiter.limit("5/minute")
async def verify_user_otp(request: Request, req: VerifyOTPRequest, response: Response):
    """Verify customer OTP and return access token."""
    res = await auth_service.verify_user_otp(req.phone, req.otp, req.name, req.email)
    if not res.get("success"):
        raise BadRequestError(res.get("error", "OTP verification failed"))
    refresh_token = res["data"].pop("refreshToken", None)
    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=7 * 24 * 60 * 60,
            path="/",
        )
    return ok(data=res["data"], message="Login successful")

# ── Admin Endpoints ──
@router.post("/admin/send-otp")
@limiter.limit("5/minute")
async def send_admin_otp(request: Request, req: SendOTPRequest):
    """Request an OTP for Admin login."""
    res = await auth_service.initiate_admin_login(req.phone)
    if not res.get("success"):
        raise BadRequestError(res.get("error", "Failed to send Admin OTP"))
    return ok(message="Admin OTP sent successfully")

@router.post("/admin/verify-otp")
@limiter.limit("5/minute")
async def verify_admin_otp(request: Request, req: VerifyAdminOTPRequest, response: Response):
    """Verify Admin OTP and password, return admin token."""
    res = await auth_service.verify_admin_login(req.phone, req.otp, req.password)
    if not res.get("success"):
        raise BadRequestError(res.get("error", "Admin verification failed"))
    refresh_token = res["data"].pop("refreshToken", None)
    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=7 * 24 * 60 * 60,
            path="/",
        )
    return ok(data=res["data"], message="Admin login successful")


@router.post("/refresh")
async def refresh_access_token(refresh_token: str | None = Cookie(default=None)):
    if not refresh_token:
        raise BadRequestError("Missing refresh token")

    payload = decode_access_token(refresh_token)
    if payload.get("type") != "refresh":
        raise BadRequestError("Invalid refresh token type")

    subject = payload.get("sub")
    role = payload.get("role")
    extra_claims = {"role": role} if role else None

    access_token = create_access_token(subject, extra_claims=extra_claims, expiry_minutes=15)
    next_refresh = create_refresh_token(subject, extra_claims=extra_claims)

    res = ok(data={"access_token": access_token}, message="Token refreshed")
    res.set_cookie(
        key="refresh_token",
        value=next_refresh,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=7 * 24 * 60 * 60,
        path="/",
    )
    return res
