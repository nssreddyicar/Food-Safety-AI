# Food Safety Inspector - Mobile Application

## Overview
This project is a government-grade mobile application designed for Food Safety Officers (FSOs) to efficiently manage their daily tasks, including inspections, sample collection, and prosecution workflows. The application aims to streamline regulatory enforcement, enhance data integrity, and provide FSOs with robust tools for their field operations. Its core purpose is to improve public health outcomes by ensuring food safety compliance.

The application's vision is to become the leading digital platform for food safety enforcement, offering a comprehensive and intuitive solution that empowers officers, reduces administrative burden, and provides transparent oversight of food safety regulations.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `server/templates`.

## System Architecture

### Frontend
The mobile application is built using Expo React Native, ensuring cross-platform compatibility. It follows a modular architecture with dedicated folders for components, hooks, utilities, and screens. Key UI/UX decisions include a clear, actionable dashboard, intuitive navigation via React Navigation (including bottom tabs and stack navigators), and a consistent design system defined in `constants/theme.ts`. The primary color scheme uses a deep authoritative blue (#1E40AF) with an urgent red accent (#DC2626) for critical indicators.

**Core Features and Technical Implementations:**
- **Authentication**: Invite-only system with session persistence using AsyncStorage.
- **Dashboard**: Displays key metrics, urgent actions, and quick access to a comprehensive Action Dashboard.
- **Action Dashboard System**: A configurable system for tracking various FSO actions (e.g., Legal & Court, Inspection & Enforcement, Sampling & Laboratory, Administrative, Protocol & Duties). It features role-based categories, SLA tracking, priority indicators, and drill-down capabilities.
- **Report Generation**: Supports professional PDF and Excel report generation from Action Dashboard data, with time period selection and platform-aware output (file creation on mobile, direct download on web).
- **Inspection Management**: Allows creation of new inspections with dynamic forms, tracking deviations, actions taken (including image uploads), and sample lifting (Enforcement/Surveillance types).
- **Sample Details & Tracking**: Comprehensive sample information capture, 14-day lab report countdown with visual urgency indicators, and filtering by status.
- **Dynamic Sample Workflow System**: An admin-configurable workflow engine for managing the sample lifecycle with nodes (action, decision, end), conditional transitions, and dynamic input fields (text, date, select, image). Default workflows are provided and can be customized.
- **Prosecution Case Management**: A complete system for tracking court cases, including case list, detailed view with hearing history, and new case creation. Features include search, filtering, and urgency indicators for upcoming hearings.
- **QR/Barcode Scanner**: Real-time camera-based scanning (supporting multiple formats) with flash toggle, haptic feedback, and a notes management system for saving, viewing, copying, sharing, and deleting scanned data. Data is stored locally using AsyncStorage.

### Backend
The backend is developed with Express.js following a strict layered architecture for maintainability, testability, and regulatory compliance.

**Layered Architecture:**

1. **Data Access Layer (`server/data/repositories/`)**: 
   - Pure database operations via Drizzle ORM
   - Repository pattern: `officer.repository.ts`, `inspection.repository.ts`, `sample.repository.ts`, `jurisdiction.repository.ts`
   - No business logic - only CRUD operations and queries
   - All operations are jurisdiction-aware

2. **Domain/Business Logic Layer (`server/domain/`)**: 
   - Services enforcing domain rules: `officerService`, `inspectionService`, `sampleService`, `jurisdictionService`
   - Workflow state machines for inspections and samples
   - Immutability rules: Closed inspections and dispatched samples cannot be modified (legal requirement)
   - Authority checks: Officers can only access data within their jurisdiction hierarchy

3. **API Layer (`server/routes.ts`)**: 
   - HTTP endpoint handlers
   - Request validation and authorization
   - Calls domain services for business operations

4. **Configuration Layer (`server/config/`)**: 
   - Environment-based settings
   - Configurable values (lab report deadlines, edit freeze hours)
   - All settings that might change are configurable, not hardcoded

**Domain Rules:**
- Inspections and samples are bound to JURISDICTIONS, not officers (ensures data continuity when officers transfer)
- Closed inspections are IMMUTABLE for court admissibility
- Dispatched samples are IMMUTABLE for chain-of-custody compliance
- Officer roles, capacities, and jurisdiction levels are admin-configurable

**Technical Implementations:**
- **API Routes**: Defined in `server/routes.ts`, incorporating a security model and categorized endpoints.
- **Data Schema**: Managed in `shared/schema.ts`, reflecting the database structure with FSSAI regulatory context.

### Data Persistence
- **Mobile Local Storage**: AsyncStorage is used for local data persistence on the mobile client, particularly for offline support and scanned notes.
- **Backend Database**: PostgreSQL is used for central data storage, managing officer and administrative data.
- **Jurisdiction-Bound Data**: Inspections and samples are bound to specific jurisdictions via `jurisdictionId`, ensuring data continuity regardless of officer transfers.

## External Dependencies
- **React Native (Expo)**: Frontend framework for mobile application development.
- **Express.js**: Backend framework for building RESTful APIs.
- **PostgreSQL**: Relational database for persistent data storage.
- **React Navigation**: For managing navigation flows within the mobile application.
- **React Query**: For data fetching, caching, and state management in the frontend.
- **AsyncStorage**: For local data persistence on the mobile device.
- **expo-camera**: For camera-based QR/barcode scanning functionality.
- **JSDoc**: For code documentation standards.