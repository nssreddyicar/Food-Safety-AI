# Android App (Flutter)

## Purpose
Android mobile application for Food Safety Officers and authorities.
Built with Flutter for Play Store deployment.

## What This Folder MUST Contain
- Flutter project structure
- UI screens and widgets
- State management
- API service clients
- Local storage handling

## What This Folder MUST NOT Contain
- Backend business logic
- Direct database access
- Workflow rule enforcement
- Server-side authentication logic

## Structure
```
android-app/
├── lib/
│   ├── main.dart           # App entry point
│   ├── screens/            # UI screens
│   ├── widgets/            # Reusable widgets
│   ├── state/              # State management (Provider/Riverpod/Bloc)
│   ├── services/           # API clients
│   └── models/             # Data models (from shared/)
├── android/                # Android-specific config
├── assets/                 # Images, fonts, etc.
├── test/                   # Unit and widget tests
└── pubspec.yaml            # Dependencies
```

## Build & Deploy
```bash
# Development
flutter run

# Build APK
flutter build apk --release

# Build App Bundle (Play Store)
flutter build appbundle --release
```

## Environment Configuration
- `lib/config/env_dev.dart` - Development API endpoints
- `lib/config/env_prod.dart` - Production API endpoints

## Notes
- Flutter SDK required (not available on Replit)
- Build locally or via CI/CD (GitHub Actions, Codemagic)
- All business logic comes from backend API
