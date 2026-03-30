"""
models.py — Unified domain models, schemas, and database entity shapes.
Upgraded to Pydantic V2.
"""
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from pydantic_core import core_schema
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from bson import ObjectId
import uuid

# ── Custom types ──────────────────────────────────────────────────────────────

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        def validate(v):
            if isinstance(v, ObjectId):
                return v
            if not ObjectId.is_valid(v):
                raise ValueError("Invalid objectid")
            return ObjectId(v)

        return core_schema.no_info_plain_validator_function(
            validate,
            serialization=core_schema.to_string_ser_schema(),
        )

# Base model to auto-alias `id` to `_id` and handle ObjectIds
class MongoModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )


def now_utc() -> datetime:
    return datetime.now(tz=timezone.utc)


# ── Core Types ────────────────────────────────────────────────────────────────

class Coordinates(BaseModel):
    lat: float
    lng: float

class LocationResponse(BaseModel):
    city: str
    area: str
    address: str
    coordinates: Coordinates

class Address(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str = "home"  # home, work, other
    address: str
    area: str
    city: str
    pincode: str
    coordinates: Coordinates
    isDefault: bool = False
    instructions: Optional[str] = None


# ── Users & Customers ─────────────────────────────────────────────────────────

class UserPreferences(BaseModel):
    cuisines: List[str] = []
    dietaryRestrictions: List[str] = []
    favoriteRestaurantIds: List[str] = []
    emailNotifications: bool = True
    smsNotifications: bool = True
    pushNotifications: bool = True

class User(MongoModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    addresses: List[Address] = []
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    isPhoneVerified: bool = False
    isEmailVerified: bool = False
    walletBalance: float = 0.0
    totalOrders: int = 0
    isActive: bool = True
    createdAt: datetime = Field(default_factory=now_utc)
    updatedAt: datetime = Field(default_factory=now_utc)


# ── Admin & System ────────────────────────────────────────────────────────────

class AdminUser(MongoModel):
    phone: str
    password: str
    name: str
    email: str
    role: str = "admin"  # admin, super_admin
    isActive: bool = True
    lastLogin: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=now_utc)
    updatedAt: datetime = Field(default_factory=now_utc)


class RiderUser(MongoModel):
    phone: str
    password: str
    name: str = "Rider"
    currentLocation: Optional[Coordinates] = None
    isActive: bool = True
    isNewUser: bool = True
    createdAt: datetime = Field(default_factory=now_utc)
    updatedAt: datetime = Field(default_factory=now_utc)


class OTPStorage(MongoModel):
    phone: str
    otp: str
    expires_at: datetime
    verified: bool = False
    attempts: int = 0
    max_attempts: int = 3


class SystemSettings(MongoModel):
    delivery_radius: float = 10.0  # km
    min_order_value: float = 100.0
    delivery_fee: float = 30.0
    free_delivery_above: float = 300.0
    commission_rate: float = 15.0
    gst_rate: float = 5.0
    app_maintenance: bool = False
    maintenance_message: str = "App under maintenance"
    support_phone: str = "+91-1234567890"
    support_email: str = "support@servedoor.com"
    updated_by: str
    updated_at: datetime = Field(default_factory=now_utc)


class Banner(MongoModel):
    title: str
    subtitle: Optional[str] = None
    image_url: str
    link_url: Optional[str] = None
    is_active: bool = True
    position: int = 0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_by: str
    created_at: datetime = Field(default_factory=now_utc)


class Coupon(MongoModel):
    code: str
    title: str
    description: str
    discount_type: str  # percentage, fixed
    discount_value: float
    min_order_value: float
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    used_count: int = 0
    is_active: bool = True
    valid_from: datetime
    valid_until: datetime
    applicable_to: str = "all"  # all, restaurants, users
    created_by: str
    created_at: datetime = Field(default_factory=now_utc)


# ── Restaurants & Menus ───────────────────────────────────────────────────────

class MenuItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str
    image: Optional[str] = None
    isVeg: bool = True
    isAvailable: bool = True

class Location(BaseModel):
    coordinates: Coordinates
    address: str
    area: str
    city: str
    pincode: Optional[str] = None

class CuisineCategory(BaseModel):
    id: int
    name: str
    image: str

class Restaurant(MongoModel):
    name: str
    cuisine: str
    rating: float = 4.0
    deliveryTime: str
    location: Location
    image: str
    offers: List[str] = []
    promoted: bool = False
    tags: List[str] = []
    menu: List[MenuItem] = []
    isActive: bool = True
    status: str = "approved"  # pending, approved, rejected
    distance: Optional[str] = None  # Calculated dynamically
    createdAt: datetime = Field(default_factory=now_utc)
    updatedAt: datetime = Field(default_factory=now_utc)


# ── Cart & Orders ─────────────────────────────────────────────────────────────

class CartItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurantId: str
    restaurantName: str
    menuItemId: str
    menuItemName: str
    price: float
    quantity: int
    isVeg: bool = True
    customizations: List[str] = []
    totalPrice: float

class CouponDetails(BaseModel):
    code: str
    title: str
    discountType: str
    discountValue: float
    discountAmount: float

class Cart(MongoModel):
    userId: str
    restaurantId: Optional[str] = None
    restaurantName: Optional[str] = None
    items: List[CartItem] = []
    subtotal: float = 0.0
    deliveryFee: float = 0.0
    taxes: float = 0.0
    discount: float = 0.0
    total: float = 0.0
    appliedCoupon: Optional[CouponDetails] = None
    createdAt: datetime = Field(default_factory=now_utc)
    updatedAt: datetime = Field(default_factory=now_utc)

class OrderItem(BaseModel):
    menuItemId: str
    menuItemName: str
    price: float
    quantity: int
    isVeg: bool = True
    customizations: List[str] = []
    totalPrice: float

class OrderTracking(BaseModel):
    status: str
    timestamp: datetime
    location: Optional[Dict[str, float]] = None
    message: str

class OrderRating(BaseModel):
    rating: int = Field(ge=1, le=5)
    review: Optional[str] = None
    ratedAt: datetime = Field(default_factory=now_utc)

class Order(MongoModel):
    orderId: str = Field(default_factory=lambda: f"ORD{uuid.uuid4().hex[:8].upper()}")
    userId: str
    restaurantId: str
    restaurantName: str
    items: List[OrderItem] = []
    deliveryAddress: Dict[str, Any]  # Stored inline mapping
    
    # Financials
    subtotal: float
    deliveryFee: float
    taxes: float
    discount: float
    total: float
    appliedCoupon: Optional[CouponDetails] = None
    
    # Tracking
    status: str = "placed"  # placed, confirmed, preparing, on_way, delivered, cancelled
    paymentMethod: str = "cod"
    paymentStatus: str = "pending"
    paymentId: Optional[str] = None
    tracking: List[OrderTracking] = []
    estimatedDeliveryTime: Optional[datetime] = None
    actualDeliveryTime: Optional[datetime] = None
    riderId: Optional[str] = None
    riderName: Optional[str] = None
    
    # Post-order
    rating: Optional[OrderRating] = None
    cancellationReason: Optional[str] = None
    canCancel: bool = True
    
    createdAt: datetime = Field(default_factory=now_utc)
    updatedAt: datetime = Field(default_factory=now_utc)


# ── Wallets & Notifications ───────────────────────────────────────────────────

class WalletTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # credit, debit
    amount: float
    description: str
    orderId: Optional[str] = None
    paymentId: Optional[str] = None
    status: str = "completed"
    timestamp: datetime = Field(default_factory=now_utc)

class UserWallet(MongoModel):
    userId: str
    balance: float = 0.0
    transactions: List[WalletTransaction] = []
    lastUpdated: datetime = Field(default_factory=datetime.utcnow)

# ── Admin Only Models ──

class Banner(MongoModel):
    title: str
    imageUrl: str
    linkUrl: Optional[str] = None
    isActive: bool = True
    order: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class Coupon(MongoModel):
    code: str
    description: str
    discountType: str = "percentage" # percentage, flat
    discountValue: float
    minOrderValue: float = 0
    maxDiscount: Optional[float] = None
    validFrom: datetime
    validUntil: datetime
    isActive: bool = True
    usageLimit: Optional[int] = None
    usedCount: int = 0

class SiteSettings(MongoModel):
    platformFee: float = 0.0
    supportEmail: str = "support@servedoor.com"
    supportPhone: str = ""
    maintenanceMode: bool = False
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class Notification(MongoModel):
    userId: str
    title: str
    message: str
    type: str = "info"  # info, success, warning, error
    isRead: bool = False
    orderId: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    createdAt: datetime = Field(default_factory=now_utc)

# ── API Specific Schemas (Requests/Responses) ─────────────────────────────────

class AddToCartRequest(BaseModel):
    restaurantId: str
    restaurantName: str
    menuItemId: str
    menuItemName: str
    price: float
    quantity: int = 1
    isVeg: bool = True
    customizations: List[str] = []

class CreateOrderRequest(BaseModel):
    deliveryAddressId: Optional[str] = None
    deliveryAddress: Optional[Dict[str, Any]] = None
    paymentMethod: str = "cod"
    instructions: Optional[str] = None
    walletAmountToUse: float = 0.0
