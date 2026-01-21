# Shared (Domain Models & Types)

## Purpose
Shared domain models, enums, constants, and type definitions.
Used by frontend, backend, and server layers.

## What This Folder MUST Contain
- TypeScript interfaces and types
- Enums for domain values
- Constants and configuration
- Validation schemas (Zod)

## What This Folder MUST NOT Contain
- Business logic
- Side effects
- Database operations
- HTTP handling

## Structure
```
shared/
├── types/               # TypeScript interfaces
│   ├── officer.types.ts
│   ├── inspection.types.ts
│   ├── sample.types.ts
│   └── jurisdiction.types.ts
├── enums/               # Domain enums
│   ├── status.enums.ts
│   └── roles.enums.ts
├── schemas/             # Validation schemas
│   ├── officer.schema.ts
│   ├── inspection.schema.ts
│   └── sample.schema.ts
└── constants/           # Application constants
    └── config.ts
```

## Usage
```typescript
// Import from shared
import { Officer, InspectionStatus } from '@shared/types';
import { SAMPLE_STATUSES } from '@shared/enums';
```

## Notes
- Use domain language only
- No abbreviations without explanation
- All types must be documented
