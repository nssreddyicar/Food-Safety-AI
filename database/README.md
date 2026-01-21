# Database (Data Persistence)

## Purpose
Data access layer handling all database operations through the repository pattern. Manages schema definitions, migrations, and data integrity.

## What This Folder Contains
- `models/` - Drizzle ORM schema definitions
- `repositories/` - Repository pattern implementations
- `migrations/` - Database migration files
- `seeds/` - Initial data seeding scripts

## What This Folder MUST NOT Contain
- Business logic
- Workflow rules
- HTTP handling
- UI logic

## Repository Pattern

### Available Repositories
- `officer.repository.ts` - Officer CRUD operations
- `inspection.repository.ts` - Inspection data access
- `sample.repository.ts` - Sample data access
- `jurisdiction.repository.ts` - Jurisdiction hierarchy

### Base Repository
- `base.repository.ts` - Shared types and utilities

## Data Integrity Rules

### Historical Data
- Historical data must NEVER be overwritten
- Use append-only patterns for audit trails

### Audit Context
- All write operations must include audit metadata
- Track who, when, and why for every change

### Jurisdiction Binding
- All inspections and samples have jurisdictionId
- Data continuity maintained across officer transfers

## Architecture Rules
- Pure data access only
- No business logic
- Return data, don't transform
- Use Drizzle ORM for type safety
