"""
orders.py — Routes for creating, fetching, and rating user orders.
"""
from fastapi import APIRouter, Depends, Query, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import logging

from app.core.responses import ok, paginated
from app.core.exceptions import BadRequestError, NotFoundError
from app.services.order_service import order_service
from app.repositories.repos import order_repo
from app.routes.dependencies import get_current_user
from app.models.models import User, CreateOrderRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["orders"])


class OrderRatingRequest(BaseModel):
    rating: int
    review: Optional[str] = None


@router.post("/")
async def place_order(
    req: CreateOrderRequest, 
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user)
):
    """Checkout cart and initiate a new order instance."""
    res = await order_service.create_order_from_cart(str(user.id), req, background_tasks)
    if not res.get("success"):
        raise BadRequestError("Failed to create order.")
    return ok(data=res["order"], message="Order placed successfully")


@router.get("/")
async def list_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    user: User = Depends(get_current_user)
):
    """Retrieve history of user orders."""
    orders, total = await order_repo.get_paginated(page=page, limit=limit, query={"userId": str(user.id)})

    return paginated(
        items=[o.model_dump(by_alias=True) for o in orders],
        total=total,
        page=page,
        limit=limit
    )


@router.get("/{order_id}")
async def get_order_details(order_id: str, user: User = Depends(get_current_user)):
    """Fetch specific order ID details ensuring the user owns it."""
    order = await order_repo.get_by_id(order_id)
    if not order or order.userId != str(user.id):
        raise NotFoundError("Order not found or inaccessible")
        
    return ok(data={"order": order.model_dump(by_alias=True)})


@router.post("/{order_id}/rating")
async def rate_order(order_id: str, req: OrderRatingRequest, user: User = Depends(get_current_user)):
    """Submit a rating for a past order if it is in 'delivered' status."""
    if not (1 <= req.rating <= 5):
        raise BadRequestError("Rating must be strictly between 1 and 5.")
        
    res = await order_service.submit_rating(order_id, str(user.id), req.rating, req.review)
    return ok(message=res["message"])
