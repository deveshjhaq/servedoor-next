# Test Credentials - serveDoor App

## Admin Panel Access
- **Route**: /admin (hidden from navbar)
- **Phone**: 9876543210
- **Password**: admin123
- **OTP**: Sent via Fast2SMS. Get from MongoDB:
  ```
  python3 -c "import asyncio; from motor.motor_asyncio import AsyncIOMotorClient; async def g(): c=AsyncIOMotorClient('mongodb://localhost:27017'); db=c['servedoor']; r=await db.otp_storage.find_one({'phone': '9876543210', 'verified': False}, sort=[('_id',-1)]); c.close(); return r.get('otp','') if r else ''; print(asyncio.run(g()))"
  ```

## Customer Test User (OTP-based)
- **Phone**: 9999999999 (already registered)
- **OTP Retrieval**: 
  ```
  python3 -c "import asyncio; from motor.motor_asyncio import AsyncIOMotorClient; async def g(): c=AsyncIOMotorClient('mongodb://localhost:27017'); db=c['servedoor']; r=await db.otp_storage.find_one({'phone': '9999999999', 'verified': False}, sort=[('_id',-1)]); c.close(); return r.get('otp','') if r else ''; print(asyncio.run(g()))"
  ```
- **Wallet Balance**: ₹500 (added during testing)
- **User ID**: 69c91e63cb67366cf01f93e1

## Test Orders
- **Delivered Order DB ID**: 69c932e5f9b7014f4be9f36c (OrderID: ORD945B7BAA)
- **On-Way Order DB ID**: 69c933e9f9b7014f4be9f370

## Traditional Auth (Email/Password)
- Signup: POST /api/users/signup
- Login: POST /api/users/signin

## API Base URL
- Local: http://localhost:8001/api
