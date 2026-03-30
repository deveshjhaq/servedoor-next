"""
cart_service.py — Business logic and pricing calculations for the Cart.
"""
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import uuid
import logging

from app.models.models import Cart, CartItem, AddToCartRequest
from app.repositories.repos import cart_repo
from app.core.config import DELIVERY_FEE, FREE_DELIVERY_ABOVE, TAX_RATE

logger = logging.getLogger(__name__)

def now_utc() -> datetime:
    return datetime.now(tz=timezone.utc)

class CartService:
    
    def calculate_totals(self, cart: Cart) -> Cart:
        """Calculate cart totals according to system pricing rules."""
        subtotal = sum(item.totalPrice for item in cart.items)
        delivery_fee = 0.0 if subtotal >= FREE_DELIVERY_ABOVE else DELIVERY_FEE
        taxes = round(subtotal * TAX_RATE, 2)
        total = subtotal + delivery_fee + taxes - cart.discount
        
        cart.subtotal = subtotal
        cart.deliveryFee = delivery_fee
        cart.taxes = taxes
        cart.total = total
        return cart

    async def get_or_create_cart(self, user_id: str) -> Cart:
        cart = await cart_repo.get_by_user_id(user_id)
        if not cart:
            cart = Cart(userId=user_id)
            cart = await cart_repo.create(cart)
        return cart

    async def add_item(self, user_id: str, req: AddToCartRequest) -> dict:
        """Add item and enforce single-restaurant rule."""
        cart = await self.get_or_create_cart(user_id)
        
        # Single restaurant enforcement
        if cart.restaurantId and cart.restaurantId != req.restaurantId and len(cart.items) > 0:
            return {
                "success": False,
                "error": "Cart contains items from another restaurant",
                "requiresClear": True,
                "currentRestaurantName": cart.restaurantName
            }
            
        # Bind cart to this restaurant
        if not cart.restaurantId or len(cart.items) == 0:
            cart.restaurantId = req.restaurantId
            cart.restaurantName = req.restaurantName

        # Check existing item
        existing_item = next((item for item in cart.items if item.menuItemId == req.menuItemId), None)
        
        if existing_item:
            existing_item.quantity += req.quantity
            existing_item.totalPrice = existing_item.price * existing_item.quantity
        else:
            new_item = CartItem(
                id=str(uuid.uuid4()),
                restaurantId=req.restaurantId,
                restaurantName=req.restaurantName,
                menuItemId=req.menuItemId,
                menuItemName=req.menuItemName,
                price=req.price,
                quantity=req.quantity,
                isVeg=req.isVeg,
                customizations=req.customizations,
                totalPrice=req.price * req.quantity
            )
            cart.items.append(new_item)
            
        cart = self.calculate_totals(cart)
        cart.updatedAt = now_utc()
        
        # Avoid overriding the _id by extracting dictionary form
        update_data = cart.model_dump(exclude={"id"}, by_alias=True)
        await cart_repo.update(str(cart.id), update_data)
        
        return {"success": True, "cart": cart.model_dump(by_alias=True)}

    async def update_quantity(self, user_id: str, item_id: str, quantity: int) -> dict:
        """Update cart item quantity."""
        cart = await cart_repo.get_by_user_id(user_id)
        if not cart:
            return {"success": False, "error": "Cart not found"}
            
        target_item = next((item for item in cart.items if item.id == item_id), None)
        if not target_item:
            return {"success": False, "error": "Item not found in cart"}
            
        if quantity <= 0:
            cart.items.remove(target_item)
        else:
            target_item.quantity = quantity
            target_item.totalPrice = target_item.price * target_item.quantity
            
        # Clean up restaurant if empty
        if len(cart.items) == 0:
            cart.restaurantId = None
            cart.restaurantName = None
            cart.appliedCoupon = None
            cart.discount = 0.0
            
        cart = self.calculate_totals(cart)
        cart.updatedAt = now_utc()
        
        update_data = cart.model_dump(exclude={"id"}, by_alias=True)
        await cart_repo.update(str(cart.id), update_data)
        
        return {"success": True, "cart": cart.model_dump(by_alias=True)}

    async def clear_cart(self, user_id: str) -> dict:
        """Empty cart but keep document."""
        cart = await cart_repo.get_by_user_id(user_id)
        if not cart:
            return {"success": True, "message": "Cart already empty"}
            
        cart.items = []
        cart.restaurantId = None
        cart.restaurantName = None
        cart.appliedCoupon = None
        cart.discount = 0.0
        cart = self.calculate_totals(cart)
        cart.updatedAt = now_utc()
        
        update_data = cart.model_dump(exclude={"id"}, by_alias=True)
        await cart_repo.update(str(cart.id), update_data)
        
        return {"success": True, "message": "Cart cleared"}


cart_service = CartService()
