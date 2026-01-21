# Food Safety Inspector - Government-Grade Regulatory System

## Overview
Government-grade regulatory system for Food Safety Officers (FSOs) to manage inspections, sample collection, and prosecution workflows under FSSAI regulations. Designed for court-admissible records with strict immutability rules for legal compliance.

## User Preferences
- Prefer detailed explanations
- Iterative development approach
- Ask before major changes
- Do not modify `server/templates` folder

## App Strategy
- **Flutter** (`android-app/`) = Production app for Play Store
- **Expo** (`client/`) = Development/testing on Replit (preview here)
- Both apps use the same backend API

## System Architecture

### Project Structure
```
/
├── android-app/        # Flutter Android app (Play Store - build externally)
├── client/             # Expo React Native (development on Replit)
├── web-app/            # React Admin Panel (future)
├── server/             # Express.js API layer
├── shared/             # Shared types & enums
├── infra/              # Docker, deployment configs
├── docs/               # Architecture documentation
└── README.md
```

### Flutter App (`android-app/`)
**Build**: External only (Flutter SDK required)

Screens:
- `login_screen.dart` - Officer authentication
- `dashboard_screen.dart` - Key metrics, urgent actions
- `inspections_screen.dart` - Inspection management
- `samples_screen.dart` - Sample tracking with deadlines
- `scanner_screen.dart` - QR/Barcode scanner
- `court_cases_screen.dart` - Prosecution management
- `profile_screen.dart` - Officer profile

To build:
```bash
cd android-app
flutter pub get
flutter run
```

### Expo App (`client/`)
**Runs on Replit** - Use for development/testing

Same features as Flutter, accessible via:
- Expo Go app (scan QR)
- Web preview

### Backend Architecture
Express.js with strict layered architecture:

1. **API Layer** (`server/routes.ts`)
2. **Domain Layer** (`server/domain/`)
3. **Data Access Layer** (`server/data/repositories/`)
4. **Configuration** (`server/config/`)

### Domain Rules (Legal Compliance)
1. **Inspections**: Closed inspections are IMMUTABLE (court admissibility)
2. **Samples**: Dispatched samples are IMMUTABLE (chain-of-custody)
3. **Jurisdictions**: Data is jurisdiction-bound, not officer-bound
4. **Audit Trail**: All modifications logged with officer ID and timestamp

## Key Files

### Flutter App
- `android-app/lib/main.dart` - Entry point
- `android-app/lib/navigation/app_navigator.dart` - Bottom tabs
- `android-app/lib/screens/` - All screens
- `android-app/lib/services/api_client.dart` - HTTP client
- `android-app/pubspec.yaml` - Dependencies

### Shared Types
- `shared/types/` - TypeScript interfaces
- `shared/enums/status.enums.ts` - Status values

### Backend
- `server/routes.ts` - API endpoints
- `server/domain/` - Business logic
- `server/data/repositories/` - Data access
- `server/services/storage.service.ts` - File storage service
- `shared/schema.ts` - Drizzle ORM schema

### File Storage API
- `POST /api/files/upload` - Upload file (base64, categories: inspection/sample/document/profile)
- `GET /api/files/:filename` - Download file
- `DELETE /api/files/:filename` - Delete file
- `GET /api/files?category=inspection` - List files by category

## Credentials
- **Super Admin**: superadmin / Admin@123
- **Test Officer**: officer@test.com / Officer@123

## Recent Changes
- Added file storage service with API endpoints for upload/download/delete
- Added Flutter storage service for file uploads
- Made Flutter the production app (Play Store deployment)
- Expo remains for development/testing on Replit
- Added all screens to Flutter: Dashboard, Inspections, Samples, Scanner, Court Cases, Profile
- Added navigation with bottom tabs
- Added models for Inspection and Sample with immutability checks

## Development Notes
- Use Expo on Replit for development preview
- Build Flutter externally for Play Store
- Both apps share same backend API
- PostgreSQL database available via DATABASE_URL
