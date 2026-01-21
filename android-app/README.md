# Android App (Flutter) - Production Build

## Purpose
This is the **production Flutter app** for Food Safety Officers.
Deploy to Google Play Store for Android devices.

**For development/testing on Replit**: Use the Expo React Native app in `/client`

## Features (Matching Expo App)
- Login/Authentication
- Dashboard with key metrics and urgent actions
- Inspection management (list, create, edit, close)
- Sample tracking with lab report deadlines
- QR/Barcode scanner
- Court case management
- Officer profile

## Project Structure
```
android-app/
├── lib/
│   ├── main.dart              # App entry point
│   ├── config/
│   │   ├── theme.dart         # Colors, spacing, theme
│   │   └── env.dart           # API environment config
│   ├── navigation/
│   │   └── app_navigator.dart # Bottom tabs + stack nav
│   ├── screens/
│   │   ├── login_screen.dart
│   │   ├── dashboard_screen.dart
│   │   ├── inspections_screen.dart
│   │   ├── samples_screen.dart
│   │   ├── scanner_screen.dart
│   │   ├── court_cases_screen.dart
│   │   └── profile_screen.dart
│   ├── widgets/
│   │   ├── primary_button.dart
│   │   ├── text_input.dart
│   │   ├── stat_card.dart
│   │   └── urgent_action_card.dart
│   ├── models/
│   │   ├── officer.dart
│   │   ├── inspection.dart
│   │   └── sample.dart
│   └── services/
│       ├── api_client.dart
│       └── auth_service.dart
└── pubspec.yaml
```

## Build Instructions

### Prerequisites
- Flutter SDK 3.10+
- Android SDK
- Android Studio or VS Code with Flutter extension

### Development
```bash
cd android-app
flutter pub get
flutter run
```

### Production Build (APK)
```bash
flutter build apk --release
```

### Production Build (App Bundle for Play Store)
```bash
flutter build appbundle --release
```

## API Configuration

The app connects to the same backend API as the Expo app.

**Development** (default):
```dart
// lib/config/env.dart
_apiBaseUrl = 'http://localhost:5000';
```

**Production** (set via build):
```bash
flutter build apk --release --dart-define=API_BASE_URL=https://your-api.com
```

## Backend API
Both Flutter and Expo apps use the same Express.js backend:
- Base URL: Configured in `lib/config/env.dart`
- Authentication: JWT tokens
- Endpoints: Same as Expo app

## Notes
- Flutter app must be built externally (not on Replit)
- Expo app can be used for development/preview on Replit
- Both apps share the same backend API
- Domain rules (immutability, jurisdictions) enforced by backend
