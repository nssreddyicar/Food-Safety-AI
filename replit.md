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
- `inspections_screen.dart` - FBO Inspection management
- `samples_screen.dart` - Sample tracking with deadlines
- `scanner_screen.dart` - QR/Barcode scanner
- `court_cases_screen.dart` - Prosecution management
- `profile_screen.dart` - Officer profile
- `complaints_screen.dart` - Complaint management

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

#### Complaint Screens
- `ComplaintsScreen.tsx` - List/filter/search complaints with status tabs
- `ComplaintDetailsScreen.tsx` - View details, update status, assign officer
- `SubmitComplaintScreen.tsx` - Public complaint submission with GPS & evidence
- `ComplaintsStackNavigator.tsx` - Navigation stack

#### Institutional Inspection Screens
- `InstitutionalInspectionsScreen.tsx` - **Home screen** with status tabs (All/Draft/Submitted), search bar, inspection cards showing date/status/score, and floating + button
- `SafetyAssessmentScreen.tsx` - 35-indicator FSSAI risk assessment form with 7 pillars, real-time score calculation, photo evidence with watermarks
- `InstitutionalInspectionsStackNavigator.tsx` - Navigation stack (list → assessment → details)

#### FBO Inspection Screens
- `InspectionsScreen.tsx` - List FBO inspections
- `NewInspectionScreen.tsx` - Create new FBO inspection
- `InspectionDetailsScreen.tsx` - View inspection details

#### Other Screens
- `DashboardScreen.tsx` - Key metrics, urgent actions, quick navigation
- `SamplesScreen.tsx` - Sample tracking with deadlines
- `CourtCasesScreen.tsx` - Prosecution case management
- `ProfileScreen.tsx` - Officer profile and settings
- `ActionDashboardScreen.tsx` - Action items and follow-ups

### Backend Architecture
Express.js with strict layered architecture:

1. **API Layer** (`server/routes.ts`) - HTTP endpoints
2. **Domain Layer** (`server/domain/`) - Business logic & rules
3. **Data Access Layer** (`server/data/repositories/`) - Database operations
4. **Services** (`server/services/`) - PDF generation, file storage, etc.
5. **Configuration** (`server/config/`) - App settings

### Domain Rules (Legal Compliance)
1. **Inspections**: Closed inspections are IMMUTABLE (court admissibility)
2. **Samples**: Dispatched samples are IMMUTABLE (chain-of-custody)
3. **Jurisdictions**: Data is jurisdiction-bound, not officer-bound
4. **Audit Trail**: All modifications logged with officer ID and timestamp
5. **GPS Immutability**: Location data cannot be modified after capture

## Key Files

### Flutter App
- `android-app/lib/main.dart` - Entry point
- `android-app/lib/navigation/app_navigator.dart` - Bottom tabs
- `android-app/lib/screens/` - All screens
- `android-app/lib/services/api_client.dart` - HTTP client
- `android-app/pubspec.yaml` - Dependencies

### Expo App
- `client/App.tsx` - Entry point with navigation
- `client/screens/` - All screens
- `client/navigation/` - Stack and tab navigators
- `client/components/` - Reusable UI components
- `client/lib/query-client.ts` - API client utilities
- `client/context/AuthContext.tsx` - Authentication state

### Shared Types
- `shared/types/` - TypeScript interfaces
- `shared/enums/status.enums.ts` - Status values
- `shared/schema.ts` - Drizzle ORM schema

### Backend
- `server/routes.ts` - API endpoints (~6300 lines)
- `server/domain/` - Business logic services
- `server/data/repositories/` - Data access layer
- `server/services/storage.service.ts` - File storage service
- `server/services/institutional-inspection-pdf.service.ts` - PDF report generation

## API Reference

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
- `GET /api/complaints` - List complaints with filters
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id/status` - Update complaint status
- `PUT /api/complaints/:id/assign` - Assign complaint to officer
- `POST /api/complaints/:id/evidence` - Add evidence with EXIF metadata

### Institutional Inspection API
FSSAI-aligned institutional food safety inspections:

- `GET /api/institutional-inspections` - List all inspections with filters
- `GET /api/institutional-inspections/:id` - Get inspection details
- `POST /api/institutional-inspections` - Create new inspection (draft)
- `POST /api/institutional-inspections/:id/submit` - Submit completed inspection
- `POST /api/institutional-inspections/:id/responses` - Save indicator responses
- `GET /api/institutional-inspections/:id/report` - Generate PDF report
- `GET /api/institutional-inspections/form-config` - Get pillars, indicators, institution types
- `GET /api/institutional-inspections/institution-types` - List institution types
- `GET /api/institutional-inspections/person-types` - List person types for watermarks
- `POST /api/institutional-inspections/calculate-score` - Calculate risk score from responses

### Admin Panel APIs

#### FBO Inspections Admin (`/admin/fbo-inspections`)
- `GET/POST/PUT/DELETE /api/admin/fbo-inspection/types` - Inspection types CRUD
- `GET/POST/PUT/DELETE /api/admin/fbo-inspection/deviation-categories` - Deviation categories CRUD
- `GET/POST/PUT/DELETE /api/admin/fbo-inspection/action-types` - Action types CRUD
- `GET/POST/PUT/DELETE /api/admin/fbo-inspection/form-fields` - Form fields CRUD
- `POST /api/admin/fbo-inspection/reset-defaults` - Reset to factory defaults

#### Institutional Inspections Admin (`/admin/institutional-inspections`)
- `GET/POST/PUT/DELETE /api/admin/institutional-inspection/pillars` - Pillars CRUD
- `GET/POST/PUT/DELETE /api/admin/institutional-inspection/indicators` - Indicators CRUD
- `GET/POST/PUT/DELETE /api/admin/institutional-inspection/institution-types` - Institution types CRUD
- `GET/PUT /api/admin/institutional-inspection/person-types` - Person types management
- `GET/PUT /api/admin/institutional-inspection/config` - Risk thresholds config
- `POST /api/admin/institutional-inspection/reset-defaults` - Reset to FSSAI defaults

#### Complaints Admin (`/admin/complaints`)
- `GET/PUT /api/admin/complaints/form-config` - Form field configuration
- Shared link management for complaint submission

## Admin Panels

### Super Admin Dashboard (`/admin`)
- Officer management
- District management
- System settings

### FBO Inspections Admin (`/admin/fbo-inspections`)
5 tabs: Overview, Inspection Types, Deviation Categories, Action Types, Form Fields
- 7 default inspection types (Routine, Follow-up, Surveillance, etc.)
- 10 deviation categories with severity levels and FSSAI legal references
- 10 action types from Verbal Warning to Emergency Prohibition
- 50 configurable form fields across 7 groups

### Institutional Inspections Admin (`/admin/institutional-inspections`)
5 tabs: Overview, Pillars & Indicators, Institution Types, Person Types, Risk Thresholds
- 7 FSSAI pillars with 35 indicators (5 per pillar)
- Dynamic person type management with watermark fields
- Configurable risk score thresholds

### Complaints Admin (`/admin/complaints`)
- Dynamic form field configuration
- Shared link management
- Status workflow configuration

## Credentials
- **Super Admin**: superadmin / Admin@123
- **Test Officer**: officer@test.com / Officer@123

## Pending Features
- **Mobile OTP Authentication**: Requires Twilio integration setup. When ready, set up Twilio connector in Replit integrations or manually add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER as secrets.

## Recent Changes (January 2026)

### Institutional Inspections List Screen
- **New Home Screen**: Institutional Inspections tab now shows a list of all inspections instead of immediately opening the form
- **Status Tabs**: Filter by All, Draft, or Submitted with count badges
- **Search Bar**: Search by institution name or inspection code
- **Inspection Cards**: Each card shows inspection code, date, institution name, address, and for submitted inspections: total score with risk classification badge
- **Floating + Button**: Tap to create a new assessment
- **Tap to View**: Click submitted inspections to view details

### Previous Changes
- **PDF Report with Image Appendix**: Indicator photos appear at end of report in 2-column, 5-row grid with captions
- **Assessment Summary Before Submit**: Shows total score, pillar-wise scores with progress bars, risk category, deviation counts
- **Custom Success Screen**: "Inspection Submitted" with "Download PDF Report" button
- **Watermark Images**: Each indicator response can have photos with compact watermarks (20% height) showing institution details, GPS, timestamp
- **Real-time Score Calculation**: Score updates as officer answers each indicator
- **7 Pillars with 35 Indicators**: FSSAI-aligned assessment framework

### Core Features
- **Evidence Anti-Fraud Watermarking**: Camera-only capture with GPS, timestamps baked into images
- **District-based Complaint IDs**: Format {DISTRICT_ABBR}{4-digit-seq}{MMYYYY}
- **Shared Complaint Links**: Officers create shareable links for pre-assigned districts
- **PDF Acknowledgements**: Downloadable receipts after complaint submission
- **Dynamic Form Configuration**: All form fields configurable via admin panel

## Development Notes
- Use Expo on Replit for development preview
- Build Flutter externally for Play Store
- Both apps share same backend API
- PostgreSQL database available via DATABASE_URL
- GitHub integration configured for version control

## Technology Stack
- **Frontend**: React Native (Expo), Flutter
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **PDF Generation**: pdfkit
- **File Storage**: Local filesystem with API endpoints
- **Authentication**: Session-based for admin, token-based for mobile
