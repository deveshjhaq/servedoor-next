"""
restaurants.py — Public and Admin routes for exploring and managing restaurants.
"""
from fastapi import APIRouter, Query, Depends
import logging
from typing import Optional

from app.core.responses import ok, paginated
from app.core.exceptions import NotFoundError
from app.repositories.repos import restaurant_repo, order_repo, user_repo
from app.models.models import Restaurant
from app.routes.dependencies import get_current_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/restaurants", tags=["restaurants"])

# ── Public Endpoints ──

@router.get("/")
async def list_restaurants(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    cuisine: Optional[str] = None,
    rating: Optional[float] = None,
    search: Optional[str] = None
):
    """List approved, active restaurants dynamically filtered."""
    skip = (page - 1) * limit
    
    query = {"isActive": True, "status": "approved"}
    if cuisine:
        query["tags"] = {"$in": [cuisine]}
    if rating is not None:
        query["rating"] = {"$gte": rating}
    if search:
        query["$text"] = {"$search": search}
        
    restaurants = await restaurant_repo.find_many(query=query, skip=skip, limit=limit)
    
    return paginated(
        items=[r.model_dump(by_alias=True) for r in restaurants],
        total=len(restaurants) + skip,  # Simplistic for now
        page=page,
        limit=limit
    )

@router.get("/categories")
async def list_categories():
    """Return top-level cuisine categories."""
    categories = [
        {"id": 1, "name": "Pizza", "image": "pizza.png"},
        {"id": 2, "name": "Burger", "image": "burger.png"},
        {"id": 3, "name": "Sushi", "image": "sushi.png"},
        {"id": 4, "name": "Indian", "image": "indian.png"},
        {"id": 5, "name": "Healthy", "image": "healthy.png"}
    ]
    return ok(data={"categories": categories})


@router.get("/{restaurant_id}")
async def get_restaurant(restaurant_id: str):
    """Fetch detail structure of a specific restaurant including its MenuItems."""
    restaurant = await restaurant_repo.get_by_id(restaurant_id)
    if not restaurant or not restaurant.isActive or restaurant.status != "approved":
        raise NotFoundError("Restaurant not found or disabled.")
        
    return ok(data={"restaurant": restaurant.model_dump(by_alias=True)})


@router.get("/{restaurant_id}/menu")
async def get_restaurant_menu(restaurant_id: str):
    """Fetch only the menu for a specific restaurant."""
    restaurant = await restaurant_repo.get_by_id(restaurant_id)
    if not restaurant:
        raise NotFoundError("Restaurant not found")
    
    return ok(data={"menu": [m.model_dump() for m in restaurant.menu]})


@router.get("/{restaurant_id}/gallery")
async def get_restaurant_gallery(restaurant_id: str):
    """Fetch gallery sections used by customer app: all, food, ambience, user."""
    restaurant = await restaurant_repo.get_by_id(restaurant_id)
    if not restaurant:
        raise NotFoundError("Restaurant not found")

    food_images = [m.image for m in restaurant.menu if m.image]
    ambience_images = [restaurant.image] if restaurant.image else []
    user_images = food_images[:2]
    all_images = []

    for image in ambience_images + food_images + user_images:
        if image and image not in all_images:
            all_images.append(image)

    return ok(
        data={
            "all": all_images,
            "food": food_images,
            "ambience": ambience_images,
            "user": user_images,
        }
    )


@router.get("/{restaurant_id}/reviews")
async def get_restaurant_reviews(
    restaurant_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
):
    """Aggregate user reviews from rated orders for this restaurant."""
    skip = (page - 1) * limit
    orders = await order_repo.find_many(
        query={"restaurantId": restaurant_id, "rating": {"$ne": None}},
        skip=skip,
        limit=limit,
    )

    review_items = []
    total_rating = 0

    for order in orders:
        rating_obj = order.rating
        if not rating_obj:
            continue
        user = await user_repo.get_by_id(order.userId)
        user_name = user.name if user else "Servedoor User"
        total_rating += rating_obj.rating
        review_items.append(
            {
                "orderId": str(order.id),
                "userId": order.userId,
                "userName": user_name,
                "rating": rating_obj.rating,
                "review": rating_obj.review or "",
                "ratedAt": rating_obj.ratedAt,
            }
        )

    average_rating = round(total_rating / len(review_items), 2) if review_items else 0.0
    return ok(data={"reviews": review_items, "averageRating": average_rating, "count": len(review_items)})

# ── Admin Endpoints ──

@router.post("/", dependencies=[Depends(get_current_admin)])
async def create_restaurant(req: Restaurant):
    """Create a new restaurant (Admin only)."""
    restaurant = await restaurant_repo.create(req)
    return ok(data={"restaurant": restaurant.model_dump(by_alias=True)}, message="Restaurant created")

@router.put("/{restaurant_id}", dependencies=[Depends(get_current_admin)])
async def update_restaurant(restaurant_id: str, req: Restaurant):
    """Update restaurant contents (Admin only)."""
    success = await restaurant_repo.update(restaurant_id, req.model_dump(exclude={"id"}, by_alias=True))
    if not success:
        raise NotFoundError("Restaurant not found")
        
    return ok(message="Restaurant updated successfully")
