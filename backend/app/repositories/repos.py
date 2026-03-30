"""
repos.py — Specific data repositories for each domain model.
"""
from datetime import datetime, timezone
from typing import Optional, List
from app.repositories.base import BaseRepository
from app.models.models import (
    User, AdminUser, Cart, Order, Restaurant, OTPStorage, UserWallet, Banner, Coupon, SiteSettings
)
from app.core.config import OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS

def now_utc() -> datetime:
    return datetime.now(tz=timezone.utc)

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__("users", User)

    async def get_by_email(self, email: str) -> Optional[User]:
        return await self.find_one({"email": email})

    async def get_by_phone(self, phone: str) -> Optional[User]:
        return await self.find_one({"phone": phone})

    async def get_paginated(self, page: int = 1, limit: int = 20):
        return await super().get_paginated({}, page=page, limit=limit, sort_by=[("createdAt", -1)])


class AdminRepository(BaseRepository[AdminUser]):
    def __init__(self):
        super().__init__("admin_users", AdminUser)

    async def get_by_phone(self, phone: str) -> Optional[AdminUser]:
        return await self.find_one({"phone": phone})


class CartRepository(BaseRepository[Cart]):
    def __init__(self):
        super().__init__("carts", Cart)

    async def get_by_user_id(self, user_id: str) -> Optional[Cart]:
        return await self.find_one({"userId": user_id})


class OrderRepository(BaseRepository[Order]):
    def __init__(self):
        super().__init__("orders", Order)

    async def get_user_orders(self, user_id: str, limit: int = 20, skip: int = 0) -> List[Order]:
        cursor = self.col.find({"userId": user_id}).sort("createdAt", -1).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [self.model_class(**d) for d in docs]

    async def get_paginated(self, page: int = 1, limit: int = 20, query: Optional[dict] = None):
        return await super().get_paginated(query or {}, page=page, limit=limit, sort_by=[("createdAt", -1)])


class RestaurantRepository(BaseRepository[Restaurant]):
    def __init__(self):
        super().__init__("restaurants", Restaurant)


class OTPRepository(BaseRepository[OTPStorage]):
    def __init__(self):
        super().__init__("otp_storage", OTPStorage)

    async def create_or_replace_otp(self, phone: str, otp: str, expires_in: int = OTP_EXPIRY_MINUTES) -> bool:
        """Atomically delete old and create new OTP."""
        from datetime import timedelta
        await self.col.delete_many({"phone": phone})
        
        doc = {
            "phone": phone,
            "otp": otp,
            "expires_at": now_utc() + timedelta(minutes=expires_in),
            "verified": False,
            "attempts": 0,
            "max_attempts": OTP_MAX_ATTEMPTS
        }
        res = await self.col.insert_one(doc)
        return bool(res.inserted_id)

    async def verify_otp(self, phone: str, entered_otp: str) -> dict:
        """Atomically test and increment validation attempts."""
        record = await self.col.find_one({
            "phone": phone,
            "verified": False,
            "expires_at": {"$gt": now_utc()}
        })
        
        if not record:
            return {"success": False, "error": "OTP expired or not found"}

        update_res = await self.col.find_one_and_update(
            {"_id": record["_id"]},
            {"$inc": {"attempts": 1}},
            return_document=True
        )
        new_attempts = update_res["attempts"]

        if new_attempts > record["max_attempts"]:
            return {"success": False, "error": "Too many attempts. Request a new OTP."}

        if record["otp"] == entered_otp:
            await self.col.update_one(
                {"_id": record["_id"]},
                {"$set": {"verified": True}}
            )
            return {"success": True, "message": "OTP verified successfully"}

        rem = record["max_attempts"] - new_attempts
        return {"success": False, "error": f"Invalid OTP. {rem} attempt(s) remaining."}


class WalletRepository(BaseRepository[UserWallet]):
    def __init__(self):
        super().__init__("wallets", UserWallet)

    async def get_by_user_id(self, user_id: str) -> Optional[UserWallet]:
        return await self.find_one({"userId": user_id})


class BannerRepository(BaseRepository[Banner]):
    def __init__(self):
        super().__init__("banners", Banner)


class CouponRepository(BaseRepository[Coupon]):
    def __init__(self):
        super().__init__("coupons", Coupon)


class SettingsRepository(BaseRepository[SiteSettings]):
    def __init__(self):
        super().__init__("settings", SiteSettings)


# Instantiated singletons for use throughout the app
user_repo = UserRepository()
admin_repo = AdminRepository()
cart_repo = CartRepository()
order_repo = OrderRepository()
restaurant_repo = RestaurantRepository()
otp_repo = OTPRepository()
wallet_repo = WalletRepository()
banner_repo = BannerRepository()
coupon_repo = CouponRepository()
settings_repo = SettingsRepository()
