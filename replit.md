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

## Architecture Principles

**See full guidelines**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

Core principles for this government-grade system:
1. **Explicit Updates** - No automatic cascading across layers
2. **Layer Boundaries** - Each layer has clear responsibilities
3. **Domain-Driven** - Business rules enforced in domain layer only
4. **Immutability** - Closed records cannot be modified (legal requirement)
5. **Audit Trail** - All changes logged with officer ID and timestamp

## System Architecture

### Project Structure
```
/
├── android-app/        # LAYER 1A: Flutter (Production)
├── client/             # LAYER 1B: Expo (Development)
├── web-app/            # LAYER 1C: React Admin (Future)
├── server/             # LAYER 2: API & Domain Logic
│   ├── domain/         # Business rules (immutability, workflows)
│   ├── data/           # Repository pattern (data access)
│   └── services/       # Infrastructure services
├── shared/             # LAYER 3: Types & Contracts
├── docs/               # Documentation
└── infra/              # Docker, deployment
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
- `complaints_screen.dart` - Complaint management (pending)

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

Complaint Screens:
- `ComplaintsScreen.tsx` - List/filter/search complaints
- `ComplaintDetailsScreen.tsx` - View details, update status, assign
- `ComplaintsStackNavigator.tsx` - Navigation stack

Institutional Inspection Screens (new):
- `InstitutionalInspectionsScreen.tsx` - List/filter institutional inspections
- `NewInstitutionalInspectionScreen.tsx` - Create new institutional inspection
- `InstitutionalInspectionAssessmentScreen.tsx` - 35-indicator risk assessment
- `InstitutionalInspectionsStackNavigator.tsx` - Navigation stack

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

### Complaint Management API
Dynamic, location-aware complaint system with admin-configurable forms:

- `GET /api/complaints/form-config` - Get form configuration (public)
- `POST /api/complaints/submit` - Submit new complaint with GPS/evidence (public)
- `GET /api/complaints/track/:code` - Track complaint by public code (public)
- `GET /api/complaints` - List complaints with filters (officer)
- `GET /api/complaints/:id` - Get complaint details (officer)
- `PUT /api/complaints/:id/status` - Update complaint status (officer)
- `PUT /api/complaints/:id/assign` - Assign complaint to officer (admin)
- `POST /api/complaints/:id/evidence` - Add evidence with EXIF metadata

Domain files:
- `server/domain/complaint/complaint.service.ts` - Business rules
- `server/data/repositories/complaint.repository.ts` - Data access
- `shared/types/complaint.types.ts` - TypeScript interfaces

Key features:
- GPS location capture with immutability (legal requirement)
- Admin-configurable dynamic form fields
- Evidence uploads with EXIF metadata preservation
- Jurisdiction auto-mapping from coordinates
- Public tracking via generated codes (PII protected)

## Credentials
- **Super Admin**: superadmin / Admin@123
- **Test Officer**: officer@test.com / Officer@123

## Recent Changes
- **Fully Dynamic Complaint Form**: Web complaint form now renders ALL fields dynamically from admin config - field labels, required status, visibility, help text, dropdown options, and file upload settings are all configurable
- **Enhanced Admin Form Field Editor**: Admin can now configure file upload settings (max files 1-10, max size MB) and watermark settings (enable/disable, GPS display, timestamp display, position, opacity) for evidence fields
- **Field Groups**: Form fields organized into 5 groups: Complainant, Establishment, Incident, Location, Evidence - each renders as a separate card in the form
- **Web Complaint Form**: Public web form at `/complaint?token=xxx` for shared link submissions. Accessible without app installation, mobile-responsive design.
- **Admin Complaint Management**: New admin panel section for managing complaints, form config, and status workflows at `/admin/complaints`
- **Dynamic Complaint Form Configuration**: Complaint type and nature dropdowns now fetch from `/api/complaints/form-config` API, managed via admin panel. Seeded with default options (Food Safety, Hygiene Violation, etc.)
- **Evidence Image Anti-Fraud Watermarking**: Camera-only image capture (max 3 images) with tamper-evident watermarks showing GPS coordinates, capture timestamp, and upload timestamp baked into images
- **Complaint ID System Redesign**: District-based IDs (format: {DISTRICT_ABBR}{4-digit-seq}{MMYYYY}, e.g., DEL0001012026) with monthly sequence reset
- **Shared Complaint Links**: Officers can create shareable links for pre-assigned district complaint forms with unique tokens
- **PDF Acknowledgement**: Generates downloadable PDF receipts after complaint submission with tracking info
- **Shared Link API**: Create, validate, and list shared links with token-based authentication
- **New DB Tables**: shared_complaint_links, complaint_sequences for link management and ID generation
- **District Abbreviations**: Added abbreviation field to districts table for ID generation
- Added Dynamic Complaint Management System with 9 API endpoints
- Complaint features: GPS location capture, evidence uploads, admin-configurable forms, public tracking codes
- Added complaint domain service with legal compliance rules (location immutability)
- Added complaint repository for data access layer
- Added shared TypeScript types for complaints
- Added comprehensive architecture documentation (docs/ARCHITECTURE.md)
- Added layer README files with responsibilities
- Added Expo file storage service (client/lib/file-storage.ts)
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
