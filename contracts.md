# serveDoor API Contracts & Integration Plan

## Overview
This document outlines the API contracts and integration plan for serveDoor - a food delivery application inspired by Swiggy's design and functionality.

## Current Mock Data Implementation
The frontend currently uses mock data from `/frontend/src/data/mockData.js` with the following structures:

### 1. Restaurants Data
```javascript
{
  id: number,
  name: string,
  cuisine: string,
  rating: number,
  deliveryTime: string,
  distance: string,
  image: string,
  offer: string,
  promoted: boolean,
  tags: string[]
}
```

### 2. Cuisine Categories
```javascript
{
  id: number,
  name: string,
  image: string
}
```

### 3. User Location
```javascript
{
  city: string,
  area: string,
  coordinates: { lat: number, lng: number }
}
```

## Backend API Contracts

### 1. Restaurant Management APIs

#### GET /api/restaurants
- **Purpose**: Get all restaurants with filtering and pagination
- **Query Parameters**:
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of items per page
  - `cuisine` (optional): Filter by cuisine type
  - `rating` (optional): Minimum rating filter
  - `promoted` (optional): Filter promoted restaurants
  - `search` (optional): Search restaurants by name or cuisine
  - `location` (optional): User location for distance calculation
- **Response**: Array of restaurant objects with pagination metadata

#### GET /api/restaurants/:id
- **Purpose**: Get detailed information about a specific restaurant
- **Response**: Restaurant object with menu items

#### POST /api/restaurants
- **Purpose**: Add new restaurant (Admin only)
- **Request Body**: Restaurant object
- **Response**: Created restaurant object

### 2. Cuisine Categories APIs

#### GET /api/cuisines
- **Purpose**: Get all cuisine categories
- **Response**: Array of cuisine category objects

### 3. User Location APIs

#### POST /api/location/detect
- **Purpose**: Detect user location
- **Request Body**: `{ coordinates: { lat: number, lng: number } }`
- **Response**: Location details with area and city

#### GET /api/location/cities
- **Purpose**: Get list of available cities
- **Response**: Array of city names

### 4. Cart Management APIs

#### POST /api/cart/add
- **Purpose**: Add item to cart
- **Request Body**: `{ restaurantId: number, quantity: number, userId: string }`
- **Response**: Updated cart object

#### GET /api/cart/:userId
- **Purpose**: Get user's cart items
- **Response**: Cart object with items

#### DELETE /api/cart/:userId/item/:itemId
- **Purpose**: Remove item from cart
- **Response**: Updated cart object

### 5. User Authentication APIs

#### POST /api/auth/signup
- **Purpose**: User registration
- **Request Body**: `{ name: string, email: string, password: string, phone: string }`
- **Response**: User object with token

#### POST /api/auth/signin
- **Purpose**: User login
- **Request Body**: `{ email: string, password: string }`
- **Response**: User object with token

## Database Models

### 1. Restaurant Model
```javascript
{
  _id: ObjectId,
  name: string,
  cuisine: string,
  rating: number,
  deliveryTime: string,
  location: {
    coordinates: [longitude, latitude],
    address: string,
    area: string,
    city: string
  },
  image: string,
  offers: [string],
  promoted: boolean,
  tags: [string],
  menu: [MenuItem],
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. User Model
```javascript
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string, // hashed
  phone: string,
  addresses: [Address],
  preferences: {
    cuisines: [string],
    dietaryRestrictions: [string]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Cart Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [{
    restaurantId: ObjectId,
    restaurantName: string,
    quantity: number,
    price: number
  }],
  totalAmount: number,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Order Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  restaurantId: ObjectId,
  items: [OrderItem],
  totalAmount: number,
  deliveryAddress: Address,
  status: string, // 'placed', 'confirmed', 'preparing', 'on_way', 'delivered'
  paymentMethod: string,
  paymentStatus: string,
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Integration Plan

### Phase 1: Replace Mock Data
1. Create API service layer in `/frontend/src/services/api.js`
2. Replace mock data calls in components with actual API calls
3. Add loading states and error handling
4. Implement proper state management (Context API or Redux)

### Phase 2: Authentication Integration
1. Create authentication context
2. Add login/signup forms
3. Implement protected routes
4. Add JWT token management

### Phase 3: Advanced Features
1. Real-time order tracking
2. Payment integration
3. Location-based filtering
4. Search functionality
5. User preferences and favorites

## Backend Implementation Priority
1. ✅ Restaurant CRUD APIs
2. ✅ Cuisine categories API
3. ✅ Basic cart functionality
4. ✅ User authentication
5. 🔄 Location-based services
6. 🔄 Order management
7. 🔄 Payment integration

## Environment Variables Required
```bash
# Backend (.env)
MONGO_URL=mongodb://localhost:27017/servedoor
JWT_SECRET=your_jwt_secret_key
DB_NAME=servedoor

# Frontend (.env)
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Testing Strategy
1. Unit tests for API endpoints
2. Integration tests for complete user flows
3. Frontend component testing
4. End-to-end testing with Playwright

## Notes
- All images are currently using Unsplash URLs - consider implementing image upload functionality
- Distance calculations will need geospatial queries in MongoDB
- Real-time features (order tracking) may require WebSocket implementation
- Consider implementing caching for frequently accessed data (Redis)