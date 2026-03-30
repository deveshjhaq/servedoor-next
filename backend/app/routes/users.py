"""
users.py — Routes for Customer Profile, Addresses, and Digital Wallet.
"""
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
import logging
import uuid
from typing import Optional, List

from app.core.responses import ok, paginated
from app.core.exceptions import BadRequestError, NotFoundError
from app.repositories.repos import user_repo, wallet_repo, restaurant_repo
from app.routes.dependencies import get_current_user
from app.models.models import User, Address, UserWallet, WalletTransaction

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])


# ── Profile Endpoints ──

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

@router.get("/profile")
async def get_profile(user: User = Depends(get_current_user)):
    """Fetch the authenticated user's profile."""
    return ok(data={"user": user.model_dump(by_alias=True)})

@router.put("/profile")
async def update_profile(req: UpdateProfileRequest, user: User = Depends(get_current_user)):
    """Update profile details."""
    update_data = req.model_dump(exclude_unset=True)
    if update_data:
        await user_repo.update(str(user.id), update_data)
        updated_user = await user_repo.get_by_id(str(user.id))
        return ok(data={"user": updated_user.model_dump(by_alias=True)}, message="Profile updated")
    return ok(message="No changes made")


# ── Address Endpoints ──

@router.get("/addresses")
async def get_addresses(user: User = Depends(get_current_user)):
    return ok(data={"addresses": [a.model_dump() for a in user.addresses]})

@router.post("/addresses")
async def add_address(address: Address, user: User = Depends(get_current_user)):
    if not address.id:
        address.id = str(uuid.uuid4())
    
    if address.isDefault or len(user.addresses) == 0:
        for a in user.addresses:
            a.isDefault = False
            
    user.addresses.append(address)
    await user_repo.update(str(user.id), {"addresses": [a.model_dump() for a in user.addresses]})
    return ok(data={"address": address.model_dump()}, message="Address added successfully")

@router.put("/addresses/{address_id}")
async def update_address(address_id: str, address: Address, user: User = Depends(get_current_user)):
    for idx, a in enumerate(user.addresses):
        if str(a.id) == address_id:
            if address.isDefault:
                for other_addr in user.addresses:
                    other_addr.isDefault = False
            user.addresses[idx] = address
            await user_repo.update(str(user.id), {"addresses": [x.model_dump() for x in user.addresses]})
            return ok(message="Address updated")
    raise NotFoundError("Address not found")

@router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, user: User = Depends(get_current_user)):
    new_addresses = [a for a in user.addresses if str(a.id) != address_id]
    if len(new_addresses) == len(user.addresses):
        raise NotFoundError("Address not found")
        
    await user_repo.update(str(user.id), {"addresses": [a.model_dump() for a in new_addresses]})
    return ok(message="Address deleted")

@router.put("/addresses/{address_id}/default")
async def set_default_address(address_id: str, user: User = Depends(get_current_user)):
    found = False
    for a in user.addresses:
        if str(a.id) == address_id:
            a.isDefault = True
            found = True
        else:
            a.isDefault = False
    
    if not found:
        raise NotFoundError("Address not found")
        
    await user_repo.update(str(user.id), {"addresses": [a.model_dump() for a in user.addresses]})
    return ok(message="Default address updated")


# ── Wallet Endpoints ──

class AddWalletMoneyRequest(BaseModel):
    amount: float
    paymentMethod: str

class UseWalletRequest(BaseModel):
    amount: float


class FavoriteRestaurantRequest(BaseModel):
    restaurantId: str

@router.get("/wallet/balance")
async def get_wallet_balance(user: User = Depends(get_current_user)):
    wallet = await wallet_repo.get_by_user_id(str(user.id))
    if not wallet:
        wallet = UserWallet(userId=str(user.id), balance=0.0)
        await wallet_repo.create(wallet)
    return ok(data={"balance": wallet.balance})

@router.get("/wallet/transactions")
async def get_wallet_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    user: User = Depends(get_current_user)
):
    wallet = await wallet_repo.get_by_user_id(str(user.id))
    if not wallet:
        return paginated([], 0, page, limit)
        
    txns = wallet.transactions
    txns.sort(key=lambda x: x.timestamp, reverse=True)
    
    skip = (page - 1) * limit
    paginated_txns = txns[skip : skip + limit]
    
    return paginated(
        items=[t.model_dump() for t in paginated_txns],
        total=len(txns),
        page=page,
        limit=limit
    )

@router.post("/wallet/add")
async def add_wallet_money(req: AddWalletMoneyRequest, user: User = Depends(get_current_user)):
    if req.amount <= 0:
        raise BadRequestError("Amount must be positive.")
        
    wallet = await wallet_repo.get_by_user_id(str(user.id))
    if not wallet:
        wallet = UserWallet(userId=str(user.id), balance=0.0)
        wallet = await wallet_repo.create(wallet)
        
    txn = WalletTransaction(
        type="credit",
        amount=req.amount,
        description=f"Added via {req.paymentMethod}"
    )
    
    wallet.balance += req.amount
    wallet.transactions.append(txn)
    
    await wallet_repo.update(str(wallet.id), wallet.model_dump(exclude={"id"}, by_alias=True))
    
    return ok(data={"balance": wallet.balance}, message="Funds added successfully")

@router.post("/wallet/use")
async def use_wallet_money(req: UseWalletRequest, user: User = Depends(get_current_user)):
    """General endpoint for subtracting wallet balance, e.g., external logic."""
    if req.amount <= 0:
        raise BadRequestError("Amount must be positive.")
        
    wallet = await wallet_repo.get_by_user_id(str(user.id))
    if not wallet or wallet.balance < req.amount:
        raise BadRequestError("Insufficient wallet balance.")
        
    txn = WalletTransaction(
        type="debit",
        amount=req.amount,
        description="Used from wallet manually"
    )
    
    wallet.balance -= req.amount
    wallet.transactions.append(txn)
    
    await wallet_repo.update(str(wallet.id), wallet.model_dump(exclude={"id"}, by_alias=True))
    return ok(data={"balance": wallet.balance}, message="Funds deducted")


# ── Favorites Endpoints ──

@router.get("/favorites")
async def get_favorites(user: User = Depends(get_current_user)):
    favorite_ids = user.preferences.favoriteRestaurantIds
    restaurants = []
    for restaurant_id in favorite_ids:
        restaurant = await restaurant_repo.get_by_id(restaurant_id)
        if restaurant and restaurant.isActive and restaurant.status == "approved":
            restaurants.append(restaurant.model_dump(by_alias=True))
    return ok(data={"favorites": restaurants, "favoriteIds": favorite_ids})


@router.post("/favorites")
async def add_favorite(req: FavoriteRestaurantRequest, user: User = Depends(get_current_user)):
    restaurant = await restaurant_repo.get_by_id(req.restaurantId)
    if not restaurant or not restaurant.isActive or restaurant.status != "approved":
        raise NotFoundError("Restaurant not found")

    favorite_ids = list(user.preferences.favoriteRestaurantIds)
    if req.restaurantId not in favorite_ids:
        favorite_ids.append(req.restaurantId)

    await user_repo.update(
        str(user.id),
        {"preferences.favoriteRestaurantIds": favorite_ids},
    )
    return ok(data={"favoriteIds": favorite_ids}, message="Added to favorites")


@router.delete("/favorites/{restaurant_id}")
async def remove_favorite(restaurant_id: str, user: User = Depends(get_current_user)):
    favorite_ids = [rid for rid in user.preferences.favoriteRestaurantIds if rid != restaurant_id]
    await user_repo.update(
        str(user.id),
        {"preferences.favoriteRestaurantIds": favorite_ids},
    )
    return ok(data={"favoriteIds": favorite_ids}, message="Removed from favorites")
