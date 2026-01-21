# Food Safety Inspector - Government-Grade Regulatory System

## Overview
This project is a government-grade mobile and web application designed for Food Safety Officers (FSOs) to efficiently manage their daily tasks, including inspections, sample collection, and prosecution workflows. The application aims to streamline regulatory enforcement, enhance data integrity, and provide FSOs with robust tools for their field operations.

The application's vision is to become the leading digital platform for food safety enforcement, offering a comprehensive and intuitive solution that empowers officers, reduces administrative burden, and provides transparent oversight of food safety regulations.

## User Preferences
- I prefer detailed explanations.
- I want iterative development.
- Ask before making major changes.
- Do not make changes to the folder `server/templates`.

## Project Structure (Production-Ready)

```
/
├── android-app/        # Expo React Native mobile app (Play Store ready)
├── web-app/            # Web Admin & Authority Panel (browser deployable)
├── backend/            # Business logic & domain services
├── server/             # API, routing, authentication
├── database/           # Schema, migrations, data access
├── shared/             # Shared domain models & types
├── infra/              # Deployment & infrastructure
├── docs/               # Architecture & workflow documentation
├── client/             # (Legacy) Original Expo client code
└── README.md           # Project overview
```

Each folder is independently buildable and deployable.

## System Architecture

### Android App (`android-app/`)
Expo React Native mobile application for cross-platform deployment (Android, iOS, Web).

**Contents:**
- `screens/` - All application screens
- `components/` - Reusable UI components
- `navigation/` - React Navigation configuration
- `hooks/` - Custom React hooks
- `context/` - React Context providers
- `lib/` - Utility libraries
- `constants/` - Theme and configuration

**Rules:**
- NO backend business logic
- UI renders based on API responses
- All workflow rules come from backend

### Web App (`web-app/`)
Browser-based administration panel for Super Admins, District Officers, and Commissioners.

**Contents:**
- Admin panel HTML/CSS
- Landing page
- Setup wizard

### Backend (`backend/`)
Core domain logic and business rules enforcement.

**Contents:**
- `inspections/` - Inspection workflow and rules
- `samples/` - Sample chain-of-custody
- `jurisdictions/` - Hierarchy management
- `services/` - Cross-cutting services (officers)
- `workflows/` - Configurable workflow definitions

**Domain Rules Enforced:**
1. Closed inspections are IMMUTABLE (court admissibility)
2. Dispatched samples are IMMUTABLE (chain-of-custody)
3. Data bound to jurisdictions, not officers
4. All roles/capacities are admin-configurable

**Rules:**
- NO HTTP logic
- NO UI logic
- NO direct SQL

### Server (`server/`)
HTTP API server handling authentication, request routing, and validation.

**Contents:**
- `routes.ts` - API endpoint definitions
- `index.ts` - Express server setup
- `db.ts` - Database connection
- `config/` - Server configuration
- `templates/` - Admin panel HTML
- `domain/` - (Legacy) Domain services
- `data/` - (Legacy) Repositories

**Rules:**
- Controllers must be thin
- Only orchestrate backend services
- No business rules in routes

### Database (`database/`)
Data access layer with repository pattern.

**Contents:**
- `models/` - Drizzle ORM schema definitions
- `repositories/` - Repository pattern implementations
- `migrations/` - Database migration files
- `seeds/` - Initial data seeding scripts

**Rules:**
- NO business logic
- Historical data must never be overwritten
- Append-only where legally required

### Shared (`shared/`)
Shared type definitions and domain vocabulary.

**Contents:**
- `types/` - TypeScript interfaces
- `enums/` - Domain enumerations
- `schemas/` - Schema definitions

**Rules:**
- NO logic
- NO side effects

## External Dependencies
- **React Native (Expo)**: Frontend framework
- **Express.js**: Backend framework
- **PostgreSQL**: Database
- **Drizzle ORM**: Type-safe database operations
- **React Navigation**: Mobile navigation
- **React Query**: Data fetching
- **AsyncStorage**: Local persistence
- **expo-camera**: QR/barcode scanning

## Important Files

### Backend Services
- `backend/inspections/inspection.service.ts` - Inspection workflow
- `backend/samples/sample.service.ts` - Chain-of-custody
- `backend/jurisdictions/jurisdiction.service.ts` - Hierarchy
- `backend/services/officer.service.ts` - Officer management

### Database Repositories
- `database/repositories/officer.repository.ts`
- `database/repositories/inspection.repository.ts`
- `database/repositories/sample.repository.ts`
- `database/repositories/jurisdiction.repository.ts`

### Server API
- `server/routes.ts` - HTTP endpoints
- `server/config/index.ts` - Configuration
- `server/db.ts` - Database connection

### Shared Types
- `shared/schemas/schema.ts` - Database schema
- `shared/types/index.ts` - TypeScript types
- `shared/enums/index.ts` - Domain enumerations

## Recent Changes
- Restructured project into production-ready folder layout
- Created separate android-app, web-app, backend, server, database folders
- Added shared types and enums
- Created README.md for each folder
- Preserved all existing functionality during restructure
- Updated import paths for new folder structure
