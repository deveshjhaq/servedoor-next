"""
dependencies.py — FastAPI dependency injection functions for routes.
"""
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedError
from app.repositories.repos import user_repo, admin_repo, rider_repo
from app.models.models import User, AdminUser, RiderUser

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Extract and validate regular customer from JWT."""
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except Exception as e:
        raise UnauthorizedError("Invalid or expired token.")

    user = await user_repo.get_by_id(payload.get("sub"))
    if not user:
        raise UnauthorizedError("User not found.")
        
    if not user.isActive:
        raise UnauthorizedError("Account has been deactivated.")
        
    return user


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> AdminUser:
    """Extract and validate admin user from JWT."""
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except Exception:
        raise UnauthorizedError("Invalid or expired admin token.")

    if payload.get("role") != "admin":
        raise UnauthorizedError("Not authorized. Admin privileges required.")

    admin = await admin_repo.get_by_id(payload.get("sub"))
    if not admin:
        raise UnauthorizedError("Admin account not found.")

    if not admin.isActive:
        raise UnauthorizedError("Admin account is deactivated.")

    return admin


async def get_current_rider(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> RiderUser:
    """Extract and validate rider user from JWT."""
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except Exception:
        raise UnauthorizedError("Invalid or expired rider token.")

    if payload.get("role") != "rider":
        raise UnauthorizedError("Not authorized. Rider privileges required.")

    rider = await rider_repo.get_by_id(payload.get("sub"))
    if not rider:
        raise UnauthorizedError("Rider account not found.")

    if not rider.isActive:
        raise UnauthorizedError("Rider account is deactivated.")

    return rider
