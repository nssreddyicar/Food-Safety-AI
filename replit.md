# Food Safety Inspector - Mobile Application

## Overview
A government-grade mobile application for Food Safety Officers (FSO) to manage inspections, sampling, and prosecution workflows. Built with React Native (Expo) and Express.js backend.

## Current State
MVP implementation with core features:
- User authentication (invite-only login)
- Dashboard with key metrics and urgent actions
- Inspection management (create, view, search, filter)
- Sample tracking with 14-day lab report countdown
- Officer profile management

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
│   ├── DashboardScreen.tsx
│   ├── InspectionDetailsScreen.tsx
│   ├── InspectionsScreen.tsx
│   ├── LoginScreen.tsx
│   ├── NewInspectionScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── SampleDetailsScreen.tsx
│   └── SamplesScreen.tsx
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

### Inspections
- Create new inspections with dynamic form
- Inspection types: Routine, Special Drive, Complaint Based, VVIP, Initiatives
- FBO and Proprietor details
- Deviations tracking
- Actions taken (Warning, Notice, Seizure, etc.)
- Sample lifting
- Save as draft or submit

### Sample Tracking
- 14-day countdown from dispatch to lab report deadline
- Status tracking: Pending → Dispatched → Lab Report
- Visual urgency indicators (red for overdue, amber for < 3 days)
- Filter by status

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
Currently using AsyncStorage for local data persistence. Demo data is seeded on first login.

## Future Enhancements
- Backend database integration (PostgreSQL)
- Document generation (PDF)
- Web admin panel
- Multi-device sync
- Push notifications for deadlines
