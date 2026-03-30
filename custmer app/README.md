# Servedoor Customer App

Servedoor Customer App is a Flutter mobile application for restaurant discovery, cart, ordering, profile management, favorites, reviews, gallery browsing, and payment flows.

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

## License

Use your repository license terms.

