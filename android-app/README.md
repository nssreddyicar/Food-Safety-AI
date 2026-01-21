# Android App (Expo React Native)

## Purpose
Mobile application for Food Safety Officers (FSOs) to conduct inspections, manage samples, and handle prosecution workflows. Built with Expo React Native for cross-platform deployment (Android, iOS, Web).

## What This Folder Contains
- `screens/` - All application screens (Dashboard, Inspections, Samples, Scanner, etc.)
- `components/` - Reusable UI components (Cards, Buttons, Forms, etc.)
- `navigation/` - React Navigation configuration (Tab, Stack navigators)
- `hooks/` - Custom React hooks (auth, theme, screen options)
- `context/` - React Context providers (AuthContext)
- `lib/` - Utility libraries (API client, storage, report templates)
- `constants/` - Theme and configuration constants
- `types/` - TypeScript type definitions

## What This Folder MUST NOT Contain
- Backend business logic
- Direct database access
- Workflow rule enforcement
- Authentication logic (must come from server)

## Deployment
- **Android**: Build APK/AAB via `expo build:android` or EAS Build
- **iOS**: Build via `expo build:ios` or EAS Build
- **Web**: Deploy static bundle to any web host

## Development
```bash
# Install dependencies
npm install

# Start development server
npm run expo:dev

# Build for production
npx expo export
```

## Architecture Rules
- UI renders based on API responses only
- All workflow rules enforced by backend
- Offline support via AsyncStorage caching
- Real device features (camera, location) used when available
