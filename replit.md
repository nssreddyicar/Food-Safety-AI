# Food Safety Inspector - Government-Grade Regulatory System

## Overview
Government-grade regulatory system for Food Safety Officers (FSOs) to manage inspections, sample collection, and prosecution workflows under FSSAI regulations. Designed for court-admissible records with strict immutability rules for legal compliance.

## User Preferences
- Prefer detailed explanations
- Iterative development approach
- Ask before major changes
- Do not modify `server/templates` folder
- Flutter for Android mobile app (build externally - not on Replit)

## System Architecture

### Project Structure (NEW)
```
/
├── android-app/        # Flutter Android app (Play Store ready)
├── web-app/            # React Admin & Authority Panel  
├── backend/            # Domain logic & business rules
├── server/             # API layer (routes, controllers, auth)
├── database/           # Schema, repositories, migrations
├── shared/             # Shared types & enums
├── infra/              # Docker, deployment, CI/CD
├── docs/               # Architecture documentation
└── client/             # [LEGACY] Expo React Native (deprecated)
```

### Android App (Flutter)
**Location**: `android-app/`
**Build**: External (Flutter SDK required - not available on Replit)

Files created:
- `lib/main.dart` - App entry point
- `lib/screens/` - Login, Dashboard screens
- `lib/widgets/` - Reusable UI components
- `lib/services/` - API client, auth service
- `lib/models/` - Officer model
- `lib/config/` - Theme, environment config
- `pubspec.yaml` - Flutter dependencies

**To build locally**:
```bash
cd android-app
flutter pub get
flutter run
```

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

### New Structure
- `android-app/` - Flutter mobile app scaffold
- `shared/types/` - TypeScript interfaces for all entities
- `shared/enums/status.enums.ts` - Status values and transitions
- `infra/docker/` - Docker deployment configs
- `docs/workflows/` - Inspection and sample workflow documentation

### Existing (server/)
- `server/routes.ts` - API endpoints
- `server/domain/` - Business logic services
- `server/data/repositories/` - Data access layer
- `shared/schema.ts` - Drizzle ORM schema

## Credentials
- **Super Admin**: superadmin / Admin@123
- **Test Officer**: officer@test.com / Officer@123

## Recent Changes
- Switched from Expo React Native to Flutter for Android app
- Created new folder structure with strict separation of concerns
- Added Flutter project scaffold (14 files) for external build
- Created shared types layer for cross-platform consistency
- Added infrastructure setup (Docker, env templates)
- Added architecture documentation (overview, workflows)

## Development Notes
- Flutter app must be built externally (local machine or CI/CD)
- Backend runs on Replit as before
- Web admin panel can run on Replit
- PostgreSQL database available via DATABASE_URL
