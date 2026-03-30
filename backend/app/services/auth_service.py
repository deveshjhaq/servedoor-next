"""
auth_service.py — Business logic for Authentication & OTP workflows.
"""
import logging
from typing import Optional
from app.repositories.repos import user_repo, admin_repo, otp_repo
from app.services.sms_service import sms_service
from app.models.models import User
from app.core.security import create_access_token, create_refresh_token, verify_password, hash_password
from app.core.exceptions import UnauthorizedError, BadRequestError

logger = logging.getLogger(__name__)

ADMIN_PHONE_NUMBERS = [
    "9876543210", "9876543211", "+919876543210", "+919876543211"
]

class AuthService:
    
    # ── User (Customer) OTP Flow ──
    async def initiate_user_login(self, phone: str) -> dict:
        """Send OTP to user."""
        res = await sms_service.send_otp(phone)
        if res.get("success"):
            saved = await otp_repo.create_or_replace_otp(phone, res["otp"])
            if not saved:
                return {"success": False, "error": "Failed to store OTP"}
        return res

    async def verify_user_otp(self, phone: str, otp: str, name: str = "", email: str = None) -> dict:
        """Verify OTP. If user is new, create them. Return token and user info."""
        # 1. Verify OTP using the atomic repository method
        verification = await otp_repo.verify_otp(phone, otp)
        if not verification.get("success"):
            return verification

        # 2. Fetch or create user
        user = await user_repo.get_by_phone(phone)
        if not user:
            # Create new
            user_data = User(
                name=name or f"User {phone[-4:]}",
                phone=phone,
                email=email,
                isPhoneVerified=True
            )
            user = await user_repo.create(user_data)
        else:
            # Update verification status just in case
            if not user.isPhoneVerified:
                await user_repo.update(str(user.id), {"isPhoneVerified": True})

        if not user.isActive:
            raise UnauthorizedError("Your account has been deactivated.")

        # 3. Generate token
        token = create_access_token(str(user.id), expiry_minutes=15)
        refresh_token = create_refresh_token(str(user.id))
        
        return {
            "success": True,
            "message": "Login successful",
            "data": {
                "token": token,
                "refreshToken": refresh_token,
                "user": {
                    "id": str(user.id),
                    "name": user.name,
                    "phone": user.phone,
                    "email": user.email
                }
            }
        }

    # ── Admin Flow ──
    async def is_admin_phone(self, phone: str) -> bool:
        normalized = phone.replace("+91", "").replace("-", "").replace(" ", "")
        for p in ADMIN_PHONE_NUMBERS:
            if normalized == p.replace("+91", "").replace("-", "").replace(" ", ""):
                return True
        admin = await admin_repo.get_by_phone(phone)
        return admin is not None

    async def initiate_admin_login(self, phone: str) -> dict:
        is_admin = await self.is_admin_phone(phone)
        if not is_admin:
            return {"success": False, "error": "Unauthorized access. Not an admin."}
        
        res = await sms_service.send_otp(phone)
        if res.get("success"):
            saved = await otp_repo.create_or_replace_otp(phone, res["otp"])
            if not saved:
                return {"success": False, "error": "Failed to store OTP."}
        return res

    async def verify_admin_login(self, phone: str, otp: str, password: str) -> dict:
        verification = await otp_repo.verify_otp(phone, otp)
        if not verification.get("success"):
            return verification

        admin = await admin_repo.get_by_phone(phone)
        if not admin:
            return {"success": False, "error": "Admin account not found."}
        
        if not verify_password(password, admin.password):
            return {"success": False, "error": "Invalid password."}

        if not admin.isActive:
            raise UnauthorizedError("Admin account deactivated.")

        # Update last login
        from datetime import datetime
        await admin_repo.update(str(admin.id), {"lastLogin": datetime.utcnow()})

        # Token with role
        token = create_access_token(
            str(admin.id), 
            extra_claims={"phone": admin.phone, "role": admin.role},
            expiry_minutes=15,
        )
        refresh_token = create_refresh_token(
            str(admin.id),
            extra_claims={"phone": admin.phone, "role": admin.role},
        )

        return {
            "success": True,
            "message": "Admin login successful",
            "data": {
                "token": token,
                "refreshToken": refresh_token,
                "admin": {
                    "id": str(admin.id),
                    "name": admin.name,
                    "phone": admin.phone,
                    "role": admin.role
                }
            }
        }


auth_service = AuthService()
