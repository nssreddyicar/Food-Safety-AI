# Server (API & Routing)

## Purpose
HTTP API server handling authentication, request routing, validation, and response formatting. Acts as the interface between clients and backend logic.

## What This Folder Contains
- `routes.ts` - API endpoint definitions
- `index.ts` - Express server setup
- `db.ts` - Database connection
- `storage.ts` - File storage utilities
- `config/` - Server configuration
- `templates/` - HTML templates (served for admin panel)

## What This Folder MUST NOT Contain
- Business logic or workflow rules
- Direct data manipulation
- UI components
- Domain rule enforcement

## API Categories

### Officer Routes
- `POST /api/officer/login` - Officer authentication
- `GET /api/officer/profile` - Get officer profile

### Inspection Routes
- `GET /api/inspections` - List inspections
- `POST /api/inspections` - Create inspection
- `GET /api/inspections/:id` - Get inspection details

### Sample Routes
- `GET /api/samples` - List samples
- `POST /api/samples` - Create sample
- `GET /api/samples/:id` - Get sample details

### Admin Routes
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/*` - Administrative operations

## Architecture Rules
- Controllers must be thin
- Only orchestrate backend services
- No business logic in routes
- Validate inputs, delegate logic to backend
