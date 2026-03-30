"""
payment_service.py — Integration points for Razorpay / Cashfree logic and validations.
"""
import logging
import uuid
import hashlib
import hmac

from app.core.exceptions import BadRequestError, NotFoundError
from app.repositories.repos import order_repo

logger = logging.getLogger(__name__)

class PaymentService:
    def verify_razorpay_signature(self, order_id: str, payment_id: str, signature: str, secret: str) -> bool:
        """Verify Razorpay callback signature."""
        msg = f"{order_id}|{payment_id}"
        generated_sig = hmac.new(
            secret.encode(),
            msg.encode(),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(generated_sig, signature)

    async def create_gateway_order(self, amount: float, currency: str = "INR", gateway: str = "razorpay") -> dict:
        """Initialize order with payment provider returning token/order_id."""
        if gateway == "razorpay":
            # Mock structure until Razorpay SDK installed
            return {
                "success": True,
                "id": f"order_{uuid.uuid4().hex[:14]}",
                "amount": int(amount * 100),
                "currency": currency
            }
        else:
            return {"success": False, "error": f"Gateway {gateway} unsupported currently."}

    async def create_cashfree_order(self, order_id: str, amount: float, user) -> dict:
        order = await order_repo.get_by_id(order_id)
        if not order or order.userId != str(user.id):
            raise NotFoundError("Order not found")
        if amount <= 0:
            raise BadRequestError("Amount must be greater than zero")

        return {
            "gateway": "cashfree",
            "orderId": order_id,
            "gatewayOrderId": f"cf_order_{uuid.uuid4().hex[:14]}",
            "paymentSessionId": f"cf_session_{uuid.uuid4().hex[:20]}",
            "amount": amount,
            "currency": "INR",
        }

    async def verify_cashfree_payment(self, order_id: str, payment_id: str) -> dict:
        order = await order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundError("Order not found")

        await order_repo.update(
            order_id,
            {
                "paymentStatus": "completed",
                "paymentId": payment_id,
                "status": "confirmed" if order.status == "placed" else order.status,
            },
        )
        return {"verified": True, "orderId": order_id, "paymentId": payment_id}

    async def create_razorpay_order(self, order_id: str, amount: float, user) -> dict:
        order = await order_repo.get_by_id(order_id)
        if not order or order.userId != str(user.id):
            raise NotFoundError("Order not found")
        if amount <= 0:
            raise BadRequestError("Amount must be greater than zero")

        gateway_order = await self.create_gateway_order(amount=amount, gateway="razorpay")
        return {
            "gateway": "razorpay",
            "orderId": order_id,
            "gatewayOrderId": gateway_order.get("id"),
            "amount": gateway_order.get("amount"),
            "currency": gateway_order.get("currency", "INR"),
        }

    async def verify_razorpay_payment(self, order_id: str, payment_id: str) -> dict:
        order = await order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundError("Order not found")

        await order_repo.update(
            order_id,
            {
                "paymentStatus": "completed",
                "paymentId": payment_id,
                "status": "confirmed" if order.status == "placed" else order.status,
            },
        )
        return {"verified": True, "orderId": order_id, "paymentId": payment_id}

payment_service = PaymentService()
