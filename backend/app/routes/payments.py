"""
payments.py — Routes for Payment Gateways
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
import logging

from app.core.responses import ok
from app.routes.dependencies import get_current_user
from app.models.models import User
from app.services.payment_service import payment_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["payments"])


class PaymentCreateRequest(BaseModel):
    orderId: str
    amount: float

class PaymentVerifyRequest(BaseModel):
    paymentId: str
    orderId: str


@router.get("/methods")
async def get_payment_methods():
    return ok(data={
        "methods": [
            {"id": "cod", "name": "Cash on Delivery", "isActive": True},
            {"id": "online", "name": "Pay Online (Razorpay/Cashfree)", "isActive": True},
            {"id": "wallet", "name": "ServeDoor Wallet", "isActive": True}
        ]
    })


# ── Cashfree Endpoints ──

@router.post("/cashfree/create")
async def create_cashfree_order(req: PaymentCreateRequest, user: User = Depends(get_current_user)):
    """Initialize Cashfree Order session."""
    data = await payment_service.create_cashfree_order(
        order_id=req.orderId,
        amount=req.amount,
        user=user
    )
    return ok(data=data)

@router.post("/cashfree/verify")
async def verify_cashfree_payment(req: PaymentVerifyRequest, user: User = Depends(get_current_user)):
    """Verify Cashfree payment success."""
    res = await payment_service.verify_cashfree_payment(req.orderId, req.paymentId)
    return ok(data=res)


# ── Razorpay Endpoints ──

@router.post("/razorpay/create")
async def create_razorpay_order(req: PaymentCreateRequest, user: User = Depends(get_current_user)):
    """Initialize Razorpay Order."""
    data = await payment_service.create_razorpay_order(
        order_id=req.orderId,
        amount=req.amount,
        user=user
    )
    return ok(data=data)

@router.post("/razorpay/verify")
async def verify_razorpay_payment(req: PaymentVerifyRequest, user: User = Depends(get_current_user)):
    """Verify Razorpay payment success."""
    res = await payment_service.verify_razorpay_payment(req.orderId, req.paymentId)
    return ok(data=res)
