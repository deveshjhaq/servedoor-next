# Plataforma Servedoor (Guia Universal)

Servedoor es una plataforma completa de pedidos de comida con:

- API backend (FastAPI + MongoDB)
- Frontend web (React)
- App movil Flutter para clientes

## Configuracion rapida

1. Iniciar backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

2. Iniciar frontend web:

```bash
cd frontend
npm install
npm start
```

3. Iniciar app Flutter:

```bash
cd "custmer app"
flutter pub get
flutter run
```

## Funciones principales

- Autenticacion OTP
- Restaurantes y menu
- Carrito y pedidos
- Perfil y direcciones
- Favoritos, galeria y resenas
- Metodos de pago y verificacion

## Archivos importantes

- Plantilla env backend: backend/.env.example
- Config URL API movil: custmer app/lib/utils/ServedoorConstant.dart
