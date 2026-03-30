# Servedoor प्लेटफॉर्म (यूनिवर्सल गाइड)

Servedoor एक पूरा food-ordering प्लेटफॉर्म है जिसमें शामिल हैं:

- Backend API (FastAPI + MongoDB)
- Web frontend (React)
- Flutter customer app

## त्वरित सेटअप

1. Backend चलाएं:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

2. Web frontend चलाएं:

```bash
cd frontend
npm install
npm start
```

3. Flutter app चलाएं:

```bash
cd "custmer app"
flutter pub get
flutter run
```

## मुख्य फीचर्स

- OTP authentication
- Restaurant और menu listing
- Cart और orders
- Profile और addresses
- Favorites, gallery, reviews
- Payment methods और verification

## महत्वपूर्ण फाइलें

- Backend env template: backend/.env.example
- Mobile API URL config: custmer app/lib/utils/ServedoorConstant.dart
