# Servedoor Customer App

[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?style=for-the-badge)](#setup)
[![Dart](https://img.shields.io/badge/Dart-3.x-0175C2?style=for-the-badge)](#tech-stack)
[![API](https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge)](#api-host-configuration)

Servedoor Customer App is a Flutter mobile application for restaurant discovery, cart, ordering, profile management, favorites, reviews, gallery browsing, and payment flows.

## Quick Navigation

- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [API Host Configuration](#api-host-configuration)
- [Project Layout](#project-layout)
- [Testing](#testing)

## Tech Stack

- Flutter (Dart)
- REST API integration with Servedoor FastAPI backend

## Key Features

- OTP-based sign-in
- Restaurant list and menu browsing
- Cart management and order placement
- Order history and tracking
- Profile and address management
- Favorites, gallery, and reviews
- Payment methods and verification integration

## Prerequisites

- Flutter SDK (stable)
- Android Studio or VS Code with Flutter extension
- Running Servedoor backend API

## Setup

1. Go to app directory:

```bash
cd "custmer app"
```

2. Install dependencies:

```bash
flutter pub get
```

3. Configure backend base URL in:

- lib/utils/ServedoorConstant.dart

4. Run app:

```bash
flutter run
```

5. Build release APK (optional):

```bash
flutter build apk --release
```

## API Host Configuration

- Android emulator: use 10.0.2.2 for localhost mapping
- Physical device: use your machine LAN IP

Example:

- http://10.0.2.2:8001/api

## Project Layout

- lib/screen: UI screens
- lib/services: API service layer
- lib/utils: constants, widgets, helpers

## Testing

```bash
flutter test
```

## Notes

- Keep secrets and private endpoints out of source code.
- Use environment-safe URLs for staging and production.
- Prefer separate base URLs for local, staging, and production builds.

## License

Use your repository license terms.

