"""
cart.py — Routes for User Cart management.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
import logging

from app.core.responses import ok
from app.core.exceptions import BadRequestError
from app.services.cart_service import cart_service
from app.routes.dependencies import get_current_user
from app.models.models import User, AddToCartRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cart", tags=["cart"])


class UpdateQuantityRequest(BaseModel):
    menuItemId: str
    quantity: int


@router.get("/")
async def get_cart(user: User = Depends(get_current_user)):
    """Fetch the active cart for the authenticated user."""
    cart = await cart_service.get_or_create_cart(str(user.id))
    return ok(data={"cart": cart.model_dump(by_alias=True)})


@router.post("/items")
async def add_cart_item(req: AddToCartRequest, user: User = Depends(get_current_user)):
    """Add a menu item to the cart. Enforces single-restaurant ordering."""
    res = await cart_service.add_item(str(user.id), req)
    if not res.get("success"):
        if res.get("requiresClear"):
            # Special structured error for frontend Cart Clear Modal
            return ok({
                "requiresClear": True,
                "currentRestaurantName": res["currentRestaurantName"]
            }, message="Cart conflict")
            
        raise BadRequestError(res.get("error", "Failed to add item"))
        
    return ok(data={"cart": res["cart"]}, message="Item added successfully")


@router.put("/items/{item_id}")
async def update_cart_item(item_id: str, req: UpdateQuantityRequest, user: User = Depends(get_current_user)):
    """Update item quantity or remove if quantity is 0."""
    res = await cart_service.update_quantity(str(user.id), item_id, req.quantity)
    if not res.get("success"):
        raise BadRequestError(res.get("error", "Failed to update item"))
        
    return ok(data={"cart": res["cart"]}, message="Item updated")


@router.delete("/")
async def clear_cart(user: User = Depends(get_current_user)):
    """Empty the cart without deleting the cart document entirely."""
    res = await cart_service.clear_cart(str(user.id))
    if not res.get("success"):
        raise BadRequestError(res.get("error", "Failed to clear cart"))
        
    # Send empty cart representation back
    cart = await cart_service.get_or_create_cart(str(user.id))
    return ok(data={"cart": cart.model_dump(by_alias=True)}, message="Cart cleared")
