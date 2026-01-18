# Food Safety Inspector - Mobile Application

## Overview
A government-grade mobile application for Food Safety Officers (FSO) to manage inspections, sampling, and prosecution workflows. Built with React Native (Expo) and Express.js backend.

## Current State
MVP implementation with core features:
- User authentication (invite-only login with database)
- Dashboard with key metrics and urgent actions
- Inspection management (create, view, search, filter)
- Sample tracking with 14-day lab report countdown
- Officer profile management
- Multi-jurisdiction support with jurisdiction switching
- Jurisdiction-bound data (inspections/samples linked to jurisdictions, not officers)
- Document templates with dynamic placeholders and PDF generation
- Admin panel access control (per-officer configuration)

## Project Architecture

### Frontend (Expo React Native)
```
client/
├── App.tsx                    # Root component with providers
├── components/                # Reusable UI components
│   ├── Button.tsx             # Primary button component
│   ├── Card.tsx               # Card container with elevation
│   ├── EmptyState.tsx         # Empty state with illustration
│   ├── FAB.tsx                # Floating action button
│   ├── FilterChips.tsx        # Horizontal filter chips
│   ├── HeaderTitle.tsx        # Custom header with app icon
│   ├── Input.tsx              # Form input component
│   ├── InspectionCard.tsx     # Inspection list item
│   ├── SampleCard.tsx         # Sample list item
│   ├── SkeletonLoader.tsx     # Loading skeletons
│   ├── StatCard.tsx           # Dashboard stat card
│   ├── StatusBadge.tsx        # Status indicator badges
│   └── UrgentActionCard.tsx   # Urgent action item
├── constants/theme.ts         # Colors, spacing, typography
├── context/AuthContext.tsx    # Authentication context
├── hooks/                     # Custom hooks
│   ├── useAuth.ts             # Authentication hook
│   ├── useScreenOptions.ts    # Navigation screen options
│   └── useTheme.ts            # Theme hook
├── lib/                       # Utilities
│   ├── query-client.ts        # React Query setup
│   └── storage.ts             # AsyncStorage operations
├── navigation/                # React Navigation setup
│   ├── DashboardStackNavigator.tsx
│   ├── InspectionsStackNavigator.tsx
│   ├── MainTabNavigator.tsx   # Bottom tab navigator
│   ├── ProfileStackNavigator.tsx
│   ├── RootStackNavigator.tsx # Root with auth flow
│   └── SamplesStackNavigator.tsx
├── screens/                   # App screens
│   ├── ActionDashboardScreen.tsx # Action tracking with category cards
│   ├── DashboardScreen.tsx
│   ├── InspectionDetailsScreen.tsx
│   ├── InspectionsScreen.tsx
│   ├── LoginScreen.tsx
│   ├── NewInspectionScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── SampleDetailsScreen.tsx
│   ├── SamplesScreen.tsx
│   └── TemplatesScreen.tsx    # Document templates with PDF download
└── types/index.ts             # TypeScript types
```

### Backend (Express.js)
```
server/
├── index.ts                   # Server entry point
├── routes.ts                  # API routes
└── templates/landing-page.html # Landing page
```

## User Roles
- **FSO (Food Safety Officer)**: Primary mobile app user - creates inspections, lifts samples
- **DO (Designated Officer)**: Reviews inspections, issues notices
- **Commissioner**: Prosecution orders for unsafe samples
- **Super Admin**: System configuration (web panel - future)

## Key Features

### Authentication
- Invite-only system (no self-registration)
- Demo mode: Any email + 6+ character password logs in
- Session persisted with AsyncStorage

### Dashboard
- Pending inspections count
- Overdue lab reports
- Samples in transit
- Completed this month
- Urgent actions list with countdown timers
- Quick access to Action Dashboard

### Action Dashboard System
Comprehensive action and reminder tracking system with role-based action categories:

**Mobile Dashboard Features:**
- Summary cards showing: Overdue, Due Today, This Week, Total counts
- Grouped action categories:
  - **Legal & Court**: Court cases, adjudication files, penalty recovery
  - **Inspection & Enforcement**: Pending inspections, follow-ups, seized articles, improvement notices
  - **Sampling & Laboratory**: Pending samples, lab reports, unsafe/substandard samples
  - **Administrative**: Special drives, workshops, grievances, license applications
  - **Protocol & Duties**: VVIP duties
- Priority indicators (critical/high/normal) with visual badges
- SLA tracking with overdue highlighting
- Drill-down navigation to detailed lists

**Admin Configuration (at `/admin/action-dashboard`):**
- Configure 21+ action categories with enable/disable toggles
- SLA settings (days) per category
- Priority levels (critical, high, normal)
- Show/hide on mobile dashboard
- Load default categories button
- Mobile preview panel

**API Endpoints:**
- `GET /api/action-dashboard` - Aggregated dashboard data with category counts
- `GET /api/action-categories` - List all action categories
- `POST /api/action-categories/seed-defaults` - Load default 21 categories
- `PUT /api/action-categories/:id` - Update category settings

### Report Generation (PDF & Excel)
Professional report generation for action dashboard data with time period selection:

**Features:**
- Time period selection with 4 categories: Month, Quarter, Year, Financial Year (Indian April-March format)
- Report includes: Action Dashboard Summary, Action Categories Breakdown, Statistics Overview, Financial Summary
- Two export formats:
  - **PDF Report**: Professional HTML template with gradient styling, color-coded sections, and multi-page layout
  - **Excel Report**: CSV format that can be opened in Excel/Google Sheets with structured data tables
- Platform-aware generation:
  - **Mobile (Expo Go)**: Creates actual files with Share functionality
  - **Web**: Direct download for both formats

**Files:**
- `client/screens/GenerateReportScreen.tsx` - Report generation screen with dual format buttons
- `client/lib/report-template.ts` - HTML template for PDF generation
- `client/lib/excel-template.ts` - CSV template for Excel generation
- `client/components/TimeFilter.tsx` - Time period selection component

**Navigation:**
- Access via file icon button next to time filter on Action Dashboard
- Route: `GenerateReport` with `timeSelection` params

### Inspections
- Create new inspections with dynamic form
- Inspection types: Routine, Special Drive, Complaint Based, VVIP, Initiatives
- FBO and Proprietor details
- Deviations tracking with severity levels
- Actions taken with:
  - Dropdown selection (Warning, Improvement Notice, Seizure Order, Prohibition Order, Prosecution, License actions)
  - Text description input
  - Image upload support (up to 5 images per action)
  - Countdown/due date tracking
- Sample lifting with two sample types:
  - **Enforcement Sample** - For regulatory enforcement
  - **Surveillance Sample** - For monitoring purposes
- Witness details with Aadhaar and signature capture
- Save as draft or submit

### Sample Details (Enhanced)
Each sample captures comprehensive information:
- Sample name, code (auto-generated), collection place
- Date and officer details (auto-filled)
- Sample cost and quantity in grams
- Preservative information (yes/no with type selection)
- Packing type (Packed/Loose)
- For packed samples:
  - Manufacturer details (name, address, license)
  - Distributor details (optional)
  - Repacker details (optional)
  - Relabeller details (optional)
  - Manufacturing date, expiry date
  - Lot/batch number

### Sample Tracking
- 14-day countdown from dispatch to lab report deadline
- Dynamic workflow-based timeline (admin-configurable)
- Visual urgency indicators (red for overdue, amber for < 3 days)
- Filter by status
- Sample type badges (ENF/SRV)

### Dynamic Sample Workflow System
Admin-configurable workflow engine for sample lifecycle management:
- **Workflow Nodes**: Define each step in the sample process (e.g., Sample Lifted, Dispatched, Lab Report, Prosecution)
- **Node Types**: action, decision, end - with conditional branching
- **Transitions**: Define movement between nodes with conditions (always, lab_result, field_value)
- **Conditional Logic**: Branch to different paths based on lab results (safe → closed, unsafe → prosecution, substandard → notice)
- **Input Fields**: Custom data collection fields per node (JSON-defined)
  - Field types: `text`, `date` (calendar picker with DD-MM-YYYY format), `select`, `textarea`, `number`, `image` (camera/gallery upload)
- **Template Linking**: Associate document templates with specific workflow nodes (shown on mobile timeline)
- Mobile app timeline dynamically adapts to admin configuration
- Interactive workflow nodes - tap any node to open modal with dynamic input fields
- Image upload support with camera and gallery options

#### Default Workflow
The system seeds with a default 6-node workflow with comprehensive input fields:
1. **Sample Lifted** (Start): Date, place, image upload, remarks
2. **Dispatched to Lab**: Date, mode, courier name, tracking number, image, remarks
3. **Lab Report Received** (Decision): Report date, report number, covering letter details, analyst name/opinion, result, image
   - If Safe → Sample Closed (End)
   - If Unsafe → Initiate Prosecution
   - If Substandard → Issue Improvement Notice

#### Admin Panel
Access at `/admin/workflow` to configure workflow nodes, transitions, input fields, and template assignments
- Use "Load Default Workflow" button to seed/reset the default workflow with enhanced fields

### Prosecution Case Management
Complete court case tracking system accessible from Profile > Court Cases:
- **Case List Screen** (CourtCasesScreen.tsx):
  - Search by case number, respondent, complainant, or court name
  - Filter by status (Pending, Ongoing, Convicted, Acquitted, Closed)
  - Visual urgency indicators for upcoming hearings (≤7 days = warning, past due = red)
  - FAB button to create new cases
- **Case Details Screen** (CaseDetailsScreen.tsx):
  - Case information: case number, court, respondent/complainant details
  - Key dates: registration, first hearing, next hearing, last hearing
  - Offence details and sections charged
  - Hearing history with date, notes, images, and status tracking
  - Add hearing modal with form validation
- **New Case Screen** (NewCaseScreen.tsx):
  - Comprehensive form with all case fields
  - Date pickers for registration and hearing dates
  - Status dropdown (pending, ongoing, convicted, acquitted, closed)
  - Link to inspection/sample (optional)

### Court Hearing Tracking
Each hearing records:
- Hearing date (required)
- Status: scheduled, completed, adjourned, cancelled
- Notes/remarks
- Image attachments (for orders, documents)
- Next hearing date (updates case's nextHearingDate)

## Design System
- **Primary Color**: #1E40AF (Deep authoritative blue)
- **Accent Color**: #DC2626 (Urgent red)
- **Success**: #059669 (Green for compliant)
- **Warning**: #D97706 (Amber for attention)
- See `design_guidelines.md` for complete specifications

## Running the App
1. Frontend: `npm run expo:dev` (port 8081)
2. Backend: `npm run server:dev` (port 5000)
3. Scan QR code with Expo Go to test on device

## Data Persistence
- AsyncStorage for local data persistence on mobile
- PostgreSQL database for officer/admin data
- Inspections and samples are bound to jurisdictions (via jurisdictionId), not individual officers
- When officers change, historical data remains tied to the jurisdiction for continuity

## Future Enhancements
- Backend database integration (PostgreSQL)
- Document generation (PDF)
- Web admin panel
- Multi-device sync
- Push notifications for deadlines
