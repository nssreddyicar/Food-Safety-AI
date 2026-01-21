# Food Safety Inspector - Government-Grade Regulatory System

A production-grade mobile and web application for Food Safety Officers (FSOs) to conduct inspections, manage samples, and handle prosecution workflows. Designed for FSSAI (Food Safety and Standards Authority of India) regulatory compliance.

## Project Structure

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
└── README.md           # This file
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Expo CLI (for mobile development)

### Development Setup

```bash
# Install dependencies
npm install

# Start backend server
npm run server:dev

# Start mobile app (Expo)
npm run expo:dev
```

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Architecture Overview

### Layers
1. **Android App** - Expo React Native mobile application
2. **Web App** - Admin panel for authorities
3. **Backend** - Domain logic and workflow enforcement
4. **Server** - HTTP API and authentication
5. **Database** - Data persistence with Drizzle ORM

### Key Domain Rules
- **Immutable Records**: Closed inspections and dispatched samples cannot be modified (legal requirement)
- **Jurisdiction Binding**: Data belongs to jurisdictions, not officers (ensures continuity)
- **Configurable Workflows**: Roles, capacities, and levels are admin-configured

## Deployment

### Android App
- Build via Expo EAS or `expo build:android`
- Deploy to Google Play Store

### Web App
- Static HTML/CSS deployment
- Any web server (Nginx, Apache, CDN)

### Backend & Server
- Container deployment (Docker)
- Replit Deployments

### Database
- PostgreSQL (Neon-backed on Replit)

## Documentation
See `/docs` folder for detailed architecture and workflow documentation.

## License
Proprietary - Government of India Food Safety Department
