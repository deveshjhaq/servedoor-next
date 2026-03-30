# Servedoor Platform

[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge)](#1-backend-setup)
[![Database](https://img.shields.io/badge/Database-MongoDB-4DB33D?style=for-the-badge)](#prerequisites)
[![Frontend](https://img.shields.io/badge/Web-React-61DAFB?style=for-the-badge)](#2-web-frontend-setup)
[![Mobile](https://img.shields.io/badge/Mobile-Flutter-02569B?style=for-the-badge)](#3-flutter-customer-app-setup)

Servedoor is a full food-ordering platform with three major parts:

- Backend API (FastAPI + MongoDB)
- Web frontend (React + CRACO)
- Customer mobile app (Flutter)

This is the universal setup and usage guide for the complete workspace.

## Quick Navigation

- [Prerequisites](#prerequisites)
- [Backend Setup](#1-backend-setup)
- [Web Frontend Setup](#2-web-frontend-setup)
- [Flutter Customer App Setup](#3-flutter-customer-app-setup)
- [Testing](#running-tests)
- [Translations](#readme-translations)

## Workspace Structure

- backend: FastAPI app, routes, services, repositories, models, tests
- frontend: React web app for customer/admin flows
- custmer app: Flutter customer mobile app

## Prerequisites

- Python 3.11 or newer
- Node.js 18 or newer
- Flutter SDK (stable channel)
- MongoDB instance (local or remote)

## 1) Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create environment config:

- Copy backend/.env.example to backend/.env
- Fill values such as Mongo URI, JWT secrets, gateway keys, and CORS origin(s)

Run backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Backend endpoints:

- Health: http://localhost:8001/api/health
- Swagger docs: http://localhost:8001/api/docs
- OpenAPI JSON: http://localhost:8001/api/openapi.json

## 2) Web Frontend Setup

```bash
cd frontend
npm install
npm start
```

Web app runs at:

- http://localhost:3000

## 3) Flutter Customer App Setup

```bash
cd "custmer app"
flutter pub get
flutter run
```

API base URL for mobile is configured in:

- custmer app/lib/utils/ServedoorConstant.dart

Notes:

- Android emulator usually needs 10.0.2.2 to reach localhost
- Physical device should use your machine LAN IP

## Backend + App Integration Scope

Implemented integration covers:

- OTP auth
- Restaurants and menu listing
- Cart and order placement/tracking
- Profile and addresses
- Favorites
- Restaurant gallery and reviews
- Payment methods and payment verification flow

## Running Tests

From workspace root:

```bash
pytest -q
```

You can also run Flutter tests:

```bash
cd "custmer app"
flutter test
```

## Security and Environment

- Never commit .env files with real secrets
- Keep API keys only in local environment files or secure secret stores
- Review CORS and JWT settings before deployment

## Readme Translations

Universal README translations are available in:

- [English](README.en.md)
- [Hindi](README.hi.md)
- [Spanish](README.es.md)
- [Chinese](README.zh.md)
- [Arabic](README.ar.md)
