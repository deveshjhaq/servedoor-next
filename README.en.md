# Servedoor Platform (Universal Guide)

Servedoor is a complete food-ordering platform with:

- Backend API (FastAPI + MongoDB)
- Web frontend (React)
- Flutter customer app

## Quick Setup

1. Start backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

2. Start web frontend:

```bash
cd frontend
npm install
npm start
```

3. Start Flutter app:

```bash
cd "custmer app"
flutter pub get
flutter run
```

## Core Features

- OTP auth
- Restaurants and menu
- Cart and orders
- Profile and addresses
- Favorites, gallery, reviews
- Payment methods and verification

## Important Files

- Backend env template: backend/.env.example
- Mobile API URL config: custmer app/lib/utils/ServedoorConstant.dart
