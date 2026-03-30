# منصة Servedoor (دليل عام)

Servedoor هي منصة كاملة لطلبات الطعام وتتكون من:

- واجهة برمجية خلفية (FastAPI + MongoDB)
- واجهة ويب (React)
- تطبيق عميل Flutter

## تشغيل سريع

1. تشغيل الخلفية:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

2. تشغيل واجهة الويب:

```bash
cd frontend
npm install
npm start
```

3. تشغيل تطبيق Flutter:

```bash
cd "custmer app"
flutter pub get
flutter run
```

## الميزات الرئيسية

- تسجيل OTP
- استعراض المطاعم والقائمة
- السلة والطلبات
- الملف الشخصي والعناوين
- المفضلة والمعرض والمراجعات
- طرق الدفع والتحقق من الدفع

## ملفات مهمة

- قالب البيئة للخلفية: backend/.env.example
- إعداد عنوان API للموبايل: custmer app/lib/utils/ServedoorConstant.dart
