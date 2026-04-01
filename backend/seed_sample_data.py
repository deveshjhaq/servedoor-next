"""
Sample data seeder for serveDoor application.
Run this script to populate the database with sample data for testing.

Usage: python seed_sample_data.py
"""
import asyncio
from datetime import datetime, timezone, timedelta
from app.core.database import db
from app.models.models import User, Restaurant, Order, Banner, Coupon, SiteSettings


async def seed_data():
    """Seed sample data into MongoDB collections."""
    print("🌱 Starting data seeding...")
    
    # Connect to database
    await db.connect()
    print("✅ Connected to database")
    
    # Clear existing data (optional - comment out if you want to keep existing data)
    # await db.database.users.delete_many({})
    # await db.database.restaurants.delete_many({})
    # await db.database.orders.delete_many({})
    # await db.database.banners.delete_many({})
    # await db.database.coupons.delete_many({})
    
    # Seed Users
    users_data = [
        {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+919876543210",
            "role": "customer",
            "isActive": True,
            "createdAt": datetime.now(timezone.utc) - timedelta(days=30)
        },
        {
            "name": "Jane Smith",
            "email": "jane@example.com",
            "phone": "+919876543211",
            "role": "customer",
            "isActive": True,
            "createdAt": datetime.now(timezone.utc) - timedelta(days=25)
        },
        {
            "name": "Bob Wilson",
            "email": "bob@example.com",
            "phone": "+919876543212",
            "role": "customer",
            "isActive": True,
            "createdAt": datetime.now(timezone.utc) - timedelta(days=20)
        }
    ]
    
    user_ids = []
    for user_data in users_data:
        result = await db.database.users.insert_one(user_data)
        user_ids.append(str(result.inserted_id))
    print(f"✅ Seeded {len(user_ids)} users")
    
    # Seed Restaurants
    restaurants_data = [
        {
            "name": "Pizza Palace",
            "description": "Best pizzas in town",
            "cuisine": "Italian",
            "rating": 4.5,
            "deliveryTime": "30-40 mins",
            "isActive": True,
            "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591",
            "createdAt": datetime.now(timezone.utc) - timedelta(days=60)
        },
        {
            "name": "Burger Hub",
            "description": "Juicy burgers and fries",
            "cuisine": "American",
            "rating": 4.2,
            "deliveryTime": "25-35 mins",
            "isActive": True,
            "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
            "createdAt": datetime.now(timezone.utc) - timedelta(days=55)
        },
        {
            "name": "Sushi Express",
            "description": "Fresh sushi daily",
            "cuisine": "Japanese",
            "rating": 4.7,
            "deliveryTime": "35-45 mins",
            "isActive": True,
            "image": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351",
            "createdAt": datetime.now(timezone.utc) - timedelta(days=50)
        }
    ]
    
    restaurant_ids = []
    for restaurant_data in restaurants_data:
        result = await db.database.restaurants.insert_one(restaurant_data)
        restaurant_ids.append(str(result.inserted_id))
    print(f"✅ Seeded {len(restaurant_ids)} restaurants")
    
    # Seed Orders
    orders_data = []
    statuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"]
    
    for i in range(25):
        order_data = {
            "userId": user_ids[i % len(user_ids)],
            "restaurantId": restaurant_ids[i % len(restaurant_ids)],
            "items": [
                {
                    "name": f"Item {i+1}",
                    "quantity": (i % 3) + 1,
                    "price": 100 + (i * 10)
                }
            ],
            "totalAmount": 100 + (i * 10),
            "status": statuses[i % len(statuses)],
            "deliveryAddress": {
                "street": f"{i+1} Main Street",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001"
            },
            "createdAt": datetime.now(timezone.utc) - timedelta(days=i)
        }
        orders_data.append(order_data)
    
    order_ids = []
    for order_data in orders_data:
        result = await db.database.orders.insert_one(order_data)
        order_ids.append(str(result.inserted_id))
    print(f"✅ Seeded {len(order_ids)} orders")
    
    # Seed Banners
    banners_data = [
        {
            "title": "50% Off on First Order",
            "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
            "link": "/restaurants",
            "isActive": True,
            "order": 1
        },
        {
            "title": "Free Delivery Above ₹299",
            "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
            "link": "/restaurants",
            "isActive": True,
            "order": 2
        }
    ]
    
    banner_ids = []
    for banner_data in banners_data:
        result = await db.database.banners.insert_one(banner_data)
        banner_ids.append(str(result.inserted_id))
    print(f"✅ Seeded {len(banner_ids)} banners")
    
    # Seed Coupons
    coupons_data = [
        {
            "code": "FIRST50",
            "discount": 50,
            "discountType": "percentage",
            "minOrderValue": 200,
            "maxDiscount": 100,
            "isActive": True,
            "expiresAt": datetime.now(timezone.utc) + timedelta(days=30)
        },
        {
            "code": "SAVE100",
            "discount": 100,
            "discountType": "flat",
            "minOrderValue": 500,
            "isActive": True,
            "expiresAt": datetime.now(timezone.utc) + timedelta(days=15)
        }
    ]
    
    coupon_ids = []
    for coupon_data in coupons_data:
        result = await db.database.coupons.insert_one(coupon_data)
        coupon_ids.append(str(result.inserted_id))
    print(f"✅ Seeded {len(coupon_ids)} coupons")
    
    # Seed Site Settings
    settings_data = {
        "deliveryCharge": 40,
        "minOrderValue": 100,
        "gstPercentage": 5,
        "platformFee": 10
    }
    await db.database.settings.delete_many({})
    await db.database.settings.insert_one(settings_data)
    print("✅ Seeded site settings")
    
    await db.disconnect()
    print("\n🎉 Data seeding completed successfully!")
    print(f"   - {len(user_ids)} users")
    print(f"   - {len(restaurant_ids)} restaurants")
    print(f"   - {len(order_ids)} orders")
    print(f"   - {len(banner_ids)} banners")
    print(f"   - {len(coupon_ids)} coupons")


if __name__ == "__main__":
    asyncio.run(seed_data())
