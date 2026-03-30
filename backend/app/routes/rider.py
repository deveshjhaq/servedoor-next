"""
rider.py — Rider authentication and delivery order operations.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.responses import ok
from app.core.exceptions import BadRequestError, NotFoundError, UnauthorizedError
from app.core.security import create_access_token, verify_password, hash_password
from app.repositories.repos import rider_repo, order_repo, user_repo, restaurant_repo
from app.routes.dependencies import get_current_rider
from app.models.models import RiderUser

router = APIRouter(prefix="/rider", tags=["rider"])


class RiderLoginRequest(BaseModel):
    mobile: str
    password: str


class RiderChangePasswordRequest(BaseModel):
    password: str


class RiderOrderActionRequest(BaseModel):
    order_id: str


class RiderUpdateStatusRequest(BaseModel):
    order_id: str
    status: str


class RiderLocationUpdateRequest(BaseModel):
    location: list[float]


@router.post("/login")
async def rider_login(req: RiderLoginRequest):
    rider = await rider_repo.get_by_phone(req.mobile)

    # Bootstrap rider account on first login attempt for easier local onboarding.
    if not rider:
        rider = await rider_repo.create(
            RiderUser(phone=req.mobile, password=hash_password(req.password), name=f"Rider {req.mobile[-4:]}")
        )

    if not verify_password(req.password, rider.password):
        raise UnauthorizedError("Invalid mobile or password")

    token = create_access_token(str(rider.id), extra_claims={"role": "rider"})
    return ok(
        data={
            "token": token,
            "mobile": rider.phone,
            "isNewUser": rider.isNewUser,
            "rider": rider.model_dump(by_alias=True),
        },
        message="Login successful",
    )


@router.post("/change-password")
async def rider_change_password(req: RiderChangePasswordRequest, rider: RiderUser = Depends(get_current_rider)):
    if len(req.password.strip()) < 6:
        raise BadRequestError("Password must be at least 6 characters")

    await rider_repo.update(
        str(rider.id),
        {
            "password": hash_password(req.password),
            "isNewUser": False,
        },
    )
    return ok(message="Password changed successfully")


@router.get("/new-orders")
async def rider_orders(rider: RiderUser = Depends(get_current_rider)):
    orders = await order_repo.find_many(
        {
            "status": {"$in": ["placed", "confirmed", "preparing", "on_way"]},
            "$or": [
                {"riderId": None},
                {"riderId": str(rider.id)},
            ],
        },
        limit=50,
        sort_by=[("createdAt", -1)],
    )

    payload = []
    for order in orders:
        user = await user_repo.get_by_id(order.userId)
        restaurant = await restaurant_repo.get_by_id(order.restaurantId)

        address = order.deliveryAddress or {}
        coords = address.get("coordinates", {}) if isinstance(address, dict) else {}
        lat = coords.get("lat", 0)
        lng = coords.get("lng", 0)
        full_address = address.get("address", "") if isinstance(address, dict) else ""

        food_items = []
        for item in order.items:
            food_items.append(
                {
                    "food_name": item.menuItemName,
                    "quantity": item.quantity,
                    "price": str(item.price),
                    "cost": str(item.totalPrice),
                    "restaurant_name": order.restaurantName,
                }
            )

        restaurant_location = []
        if restaurant:
            restaurant_location.append(
                {
                    "name": restaurant.name,
                    "location": [
                        restaurant.location.coordinates.lat,
                        restaurant.location.coordinates.lng,
                    ],
                    "distance": 0,
                }
            )

        payload.append(
            {
                "order_id": str(order.id),
                "status": order.status,
                "delivery_charge": str(order.deliveryFee),
                "total_amount": str(order.total),
                "payment_method": order.paymentMethod,
                "delivery_location": [lat, lng, full_address],
                "items": food_items,
                "restaurant_location": restaurant_location,
                "customer": {
                    "full_name": user.name if user else "Customer",
                    "mobile": user.phone if user else "",
                    "distance": 0,
                },
            }
        )

    return ok(data={"orders": payload})


@router.post("/accept-order")
async def rider_accept_order(req: RiderOrderActionRequest, rider: RiderUser = Depends(get_current_rider)):
    order = await order_repo.get_by_id(req.order_id)
    if not order:
        raise NotFoundError("Order not found")

    if order.riderId and order.riderId != str(rider.id):
        raise BadRequestError("Order is already assigned to another rider")

    await order_repo.update(
        req.order_id,
        {
            "riderId": str(rider.id),
            "riderName": rider.name,
            "status": "confirmed" if order.status == "placed" else order.status,
        },
    )
    return ok(message="Order accepted")


@router.post("/update-status")
async def rider_update_status(req: RiderUpdateStatusRequest, rider: RiderUser = Depends(get_current_rider)):
    order = await order_repo.get_by_id(req.order_id)
    if not order:
        raise NotFoundError("Order not found")

    if order.riderId and order.riderId != str(rider.id):
        raise UnauthorizedError("Order is assigned to another rider")

    status_map = {
        "Verified": "on_way",
        "Cancelled": "cancelled",
        "Delivered": "delivered",
    }
    next_status = status_map.get(req.status, req.status.lower())

    await order_repo.update(req.order_id, {"status": next_status, "riderId": str(rider.id), "riderName": rider.name})
    return ok(message="Order status updated")


@router.patch("/profile")
async def update_rider_profile_location(req: RiderLocationUpdateRequest, rider: RiderUser = Depends(get_current_rider)):
    if len(req.location) != 2:
        raise BadRequestError("Location must contain [latitude, longitude]")

    lat, lng = req.location
    await rider_repo.update(str(rider.id), {"currentLocation": {"lat": lat, "lng": lng}})
    return ok(message="Rider location updated")
