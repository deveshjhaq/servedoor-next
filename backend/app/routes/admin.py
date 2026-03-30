"""
admin.py — Routes for Admin Dashboard and Entities.
"""
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
import logging
from typing import Optional

from app.core.responses import ok, paginated
from app.routes.dependencies import get_current_admin
from app.models.models import AdminUser, Banner, Coupon, SiteSettings
from app.repositories.repos import (
    user_repo, order_repo, restaurant_repo, banner_repo, coupon_repo, settings_repo
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Profile & Auth (Verified via Dependency) ──

@router.get("/profile")
async def get_admin_profile(admin: AdminUser = Depends(get_current_admin)):
    return ok(data={"admin": admin.model_dump(by_alias=True)})


# ── Dashboard Stats ──

@router.get("/dashboard/stats")
async def get_dashboard_stats(admin: AdminUser = Depends(get_current_admin)):
    users_count = await user_repo.count()
    orders_count = await order_repo.count()
    restaurants_count = await restaurant_repo.count()
    
    return ok(data={
        "totalUsers": users_count,
        "totalOrders": orders_count,
        "totalRestaurants": restaurants_count,
        "revenue": 0 # Placeholder for financial aggregation
    })


# ── Users Management ──

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    admin: AdminUser = Depends(get_current_admin)
):
    users, total = await user_repo.get_paginated(page=page, limit=limit)
    return paginated([u.model_dump(by_alias=True) for u in users], total, page, limit)

@router.post("/users/{user_id}/toggle-status")
async def toggle_user_status(user_id: str, is_active: bool, admin: AdminUser = Depends(get_current_admin)):
    await user_repo.update(user_id, {"isActive": is_active})
    return ok(message=f"User status updated to {is_active}")


# ── Banners Management ──

@router.get("/banners")
async def list_banners(admin: AdminUser = Depends(get_current_admin)):
    banners = await banner_repo.find({})
    return ok(data=[b.model_dump(by_alias=True) for b in banners])

@router.post("/banners")
async def create_banner(banner: Banner, admin: AdminUser = Depends(get_current_admin)):
    new_banner = await banner_repo.create(banner)
    return ok(data=new_banner.model_dump(by_alias=True), message="Banner created")


# ── Coupons Management ──

@router.get("/coupons")
async def list_coupons(admin: AdminUser = Depends(get_current_admin)):
    coupons = await coupon_repo.find({})
    return ok(data=[c.model_dump(by_alias=True) for c in coupons])

@router.post("/coupons")
async def create_coupon(coupon: Coupon, admin: AdminUser = Depends(get_current_admin)):
    new_coupon = await coupon_repo.create(coupon)
    return ok(data=new_coupon.model_dump(by_alias=True), message="Coupon created")

@router.post("/coupons/{coupon_id}/toggle")
async def toggle_coupon(coupon_id: str, admin: AdminUser = Depends(get_current_admin)):
    c = await coupon_repo.get_by_id(coupon_id)
    if c:
        await coupon_repo.update(coupon_id, {"isActive": not c.isActive})
    return ok(message="Coupon toggled")

@router.delete("/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str, admin: AdminUser = Depends(get_current_admin)):
    await coupon_repo.delete(coupon_id)
    return ok(message="Coupon deleted")


# ── Settings ──

@router.get("/settings")
async def get_settings(admin: AdminUser = Depends(get_current_admin)):
    settings_docs = await settings_repo.find({})
    if not settings_docs:
        s = SiteSettings()
        new_s = await settings_repo.create(s)
        return ok(data=new_s.model_dump(by_alias=True))
    return ok(data=settings_docs[0].model_dump(by_alias=True))

@router.post("/settings")
async def update_settings(settings: SiteSettings, admin: AdminUser = Depends(get_current_admin)):
    settings_docs = await settings_repo.find({})
    if not settings_docs:
        new_s = await settings_repo.create(settings)
        return ok(data=new_s.model_dump(by_alias=True))
        
    await settings_repo.update(str(settings_docs[0].id), settings.model_dump(exclude={"id"}, by_alias=True))
    return ok(message="Settings updated")


# ── Orders Management ──

@router.get("/orders")
async def get_all_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    admin: AdminUser = Depends(get_current_admin)
):
    orders, total = await order_repo.get_paginated(page=page, limit=limit)
    return paginated([o.model_dump(by_alias=True) for o in orders], total, page, limit)

class UpdateOrderStatusRequest(BaseModel):
    status: str

@router.post("/orders/{order_id}/update-status")
async def update_order_status(order_id: str, req: UpdateOrderStatusRequest, admin: AdminUser = Depends(get_current_admin)):
    from app.services.order_service import order_service
    # order_service handles timings, refunds, and saving.
    res = await order_service.update_order_status(order_id, req.status)
    return ok(data=res)

# ── Financials ──
@router.get("/financial/stats")
async def get_financial_stats(period: str = 'month', admin: AdminUser = Depends(get_current_admin)):
    # Placeholder for financial aggregation backend logic
    return ok(data={"revenue": 0, "platformFees": 0, "netProfit": 0})
