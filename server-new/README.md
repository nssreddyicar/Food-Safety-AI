# Server (API Layer)

## Purpose
HTTP APIs, authentication, authorization, and request validation.
Thin controllers that orchestrate backend services.

## What This Folder MUST Contain
- Express/Fastify routes
- Controller functions (thin orchestration)
- Authentication middleware
- Request validation
- Authorization checks

## What This Folder MUST NOT Contain
- Business logic (use backend/)
- Database queries (use database/)
- UI components
- Domain rules

## Structure
```
server/
├── routes/              # Route definitions
│   ├── officer.routes.ts
│   ├── inspection.routes.ts
│   ├── sample.routes.ts
│   └── jurisdiction.routes.ts
├── controllers/         # Request handlers
│   ├── officer.controller.ts
│   ├── inspection.controller.ts
│   ├── sample.controller.ts
│   └── jurisdiction.controller.ts
├── middleware/          # Express middleware
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── error.middleware.ts
├── auth/                # Authentication logic
│   └── jwt.service.ts
└── server.ts            # Server entry point
```

## API Design
- RESTful endpoints
- JSON request/response
- JWT authentication
- Role-based authorization

## Notes
- Controllers must be thin (orchestrate, not implement)
- All business rules in backend/
- All data access through database/
