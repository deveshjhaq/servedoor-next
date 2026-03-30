"""
order_service.py — Business logic for processing and tracking Orders.
"""
from datetime import datetime, timezone
import uuid
import logging
from typing import Optional
from fastapi import BackgroundTasks

from app.models.models import Order, OrderItem, CreateOrderRequest, OrderTracking, OrderRating, WalletTransaction, UserWallet
from app.repositories.repos import order_repo, cart_repo, user_repo, wallet_repo
from app.services.notification_service import notification_service
from app.core.exceptions import BadRequestError

logger = logging.getLogger(__name__)

def now_utc() -> datetime:
    return datetime.now(tz=timezone.utc)

class OrderService:

    async def create_order_from_cart(self, user_id: str, req: CreateOrderRequest, background_tasks: Optional[BackgroundTasks] = None) -> dict:
        """Convert a user's cart into a final Order entity."""
        cart = await cart_repo.get_by_user_id(user_id)
        if not cart or not cart.items:
            raise BadRequestError("Cannot place order. Cart is empty.")

        user = await user_repo.get_by_id(user_id)
        if not user:
            raise BadRequestError("User not found.")

        # Establish Delivery Address mapping
        delivery_address = None
        if req.deliveryAddressId:
            delivery_address = next((a for a in user.addresses if str(a.id) == req.deliveryAddressId), None)
            if delivery_address:
                delivery_address = delivery_address.model_dump(by_alias=True)
            
        if not delivery_address and req.deliveryAddress:
            delivery_address = req.deliveryAddress
            
        if not delivery_address:
            # Fallback
            if user.addresses:
                delivery_address = user.addresses[0].model_dump(by_alias=True)
            else:
                raise BadRequestError("No delivery address selected or found.")

        # Construct Order Tracking history initialized with placed status
        tracking = [
            OrderTracking(
                status="placed", 
                timestamp=now_utc(), 
                message="Order placed successfully"
            )
        ]

        # Convert CartItems to OrderItems safely 
        order_items = [
            OrderItem(
                menuItemId=i.menuItemId,
                menuItemName=i.menuItemName,
                price=i.price,
                quantity=i.quantity,
                isVeg=i.isVeg,
                customizations=i.customizations,
                totalPrice=i.totalPrice
            ) for i in cart.items
        ]

        # Handle Wallet Usage
        final_payable = cart.total
        wallet_used = 0.0
        wallet_doc = None
        if req.walletAmountToUse > 0:
            wallet_doc = await wallet_repo.get_by_user_id(user_id)
            if not wallet_doc or wallet_doc.balance < req.walletAmountToUse:
                raise BadRequestError("Insufficient wallet balance.")
            if req.walletAmountToUse > final_payable:
                raise BadRequestError("Wallet amount exceeds order total.")
                
            wallet_used = req.walletAmountToUse
            final_payable -= wallet_used
            
        # Build massive Order document
        order_model = Order(
            userId=user_id,
            restaurantId=cart.restaurantId,
            restaurantName=cart.restaurantName,
            items=order_items,
            deliveryAddress=delivery_address,
            subtotal=cart.subtotal,
            deliveryFee=cart.deliveryFee,
            taxes=cart.taxes,
            discount=cart.discount,
            total=final_payable, # Reflected total payable
            appliedCoupon=cart.appliedCoupon.model_dump() if cart.appliedCoupon else None,
            paymentMethod=req.paymentMethod,
            paymentStatus="pending" if req.paymentMethod == "online" and final_payable > 0 else "completed",
            status="placed",
            tracking=tracking
        )

        try:
            created_order = await order_repo.create(order_model)

            # Deduct wallet and log transaction if used
            if wallet_used > 0 and wallet_doc:
                txn = WalletTransaction(
                    type="debit",
                    amount=wallet_used,
                    description=f"Used for Order {created_order.orderId}",
                    orderId=str(created_order.id)
                )
                wallet_doc.balance -= wallet_used
                wallet_doc.transactions.append(txn)
                await wallet_repo.update(str(wallet_doc.id), wallet_doc.model_dump(exclude={"id"}, by_alias=True))

            # Important: Empty the cart after successful checkout, keeping cart doc active
            cart.items = []
            cart.restaurantId = None
            cart.restaurantName = None
            cart.subtotal = cart.deliveryFee = cart.taxes = cart.discount = cart.total = 0.0
            await cart_repo.update(str(cart.id), cart.model_dump(exclude={"id"}, by_alias=True))
            
            # Increment user total order metric
            await user_repo.update(user_id, {"totalOrders": user.totalOrders + 1})

            # Fire off email invoice quietly in background loop
            if background_tasks and user.email:
                background_tasks.add_task(
                    notification_service.send_invoice_email,
                    created_order.model_dump(by_alias=True),
                    user.model_dump(by_alias=True)
                )

            return {"success": True, "order": created_order.model_dump(by_alias=True)}

        except Exception as e:
            logger.exception("Failed inserting order for user %s", user_id)
            raise BadRequestError("System failure while processing order.")

    async def update_order_status(self, order_id: str, new_status: str, msg: str) -> dict:
        """Update workflow status and append to tracking array."""
        order = await order_repo.get_by_id(order_id)
        if not order:
            return {"success": False, "error": "Order not found."}

        new_tracking = OrderTracking(status=new_status, timestamp=now_utc(), message=msg)
        order.tracking.append(new_tracking)
        order.status = new_status
        
        # Specific timings & logic
        if new_status == "delivered":
            order.actualDeliveryTime = now_utc()
            
        if new_status == "cancelled":
            order.canCancel = False
            # Automated Refund on Cancellation
            if order.paymentStatus == "completed":
                await self.process_refund(order_id, str(order.userId), order.total)

        order.updatedAt = now_utc()
        
        update_data = order.model_dump(exclude={"id"}, by_alias=True)
        await order_repo.update(order_id, update_data)
        
        return {"success": True, "order": order.model_dump(by_alias=True)}

    async def submit_rating(self, order_id: str, user_id: str, rating_val: int, review: Optional[str]) -> dict:
        """Allow user to rate a delivered past order."""
        order = await order_repo.get_by_id(order_id)
        if not order or order.userId != user_id:
            raise BadRequestError("Order not found or access denied.")

        if order.status != "delivered":
            raise BadRequestError("You can only rate orders that have been delivered.")

        if order.rating:
            raise BadRequestError("Order already rated.")

        rating = OrderRating(rating=rating_val, review=review, ratedAt=now_utc())
        
        await order_repo.update(order_id, {"rating": rating.model_dump()})
        
        return {"success": True, "message": "Rating saved successfully"}
        
    async def process_refund(self, order_id: str, user_id: str, amount: float) -> dict:
        """Process refund by crediting the user's wallet."""
        wallet = await wallet_repo.get_by_user_id(user_id)
        if not wallet:
            wallet = UserWallet(userId=user_id, balance=0.0)
            wallet = await wallet_repo.create(wallet)
            
        txn = WalletTransaction(
            type="credit",
            amount=amount,
            description=f"Refund for cancelled order",
            orderId=order_id
        )
        
        wallet.balance += amount
        wallet.transactions.append(txn)
        wallet.lastUpdated = now_utc()
        
        await wallet_repo.update(str(wallet.id), wallet.model_dump(exclude={"id"}, by_alias=True))
        logger.info(f"Refunded {amount} to user {user_id} wallet for order {order_id}")
        return {"success": True, "message": "Refund processed to wallet"}

order_service = OrderService()
