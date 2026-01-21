# Backend (Domain & Business Logic)

## Purpose
Core domain logic and business rules for the Food Safety Inspection system. This layer enforces all legal workflows, data immutability rules, and regulatory compliance.

## What This Folder Contains
- `inspections/` - Inspection workflow logic and state machines
- `samples/` - Sample chain-of-custody and lab report handling
- `jurisdictions/` - Hierarchy management and authority checks
- `services/` - Cross-cutting services (officer management)
- `workflows/` - Configurable workflow definitions
- `documents/` - Document generation logic

## What This Folder MUST NOT Contain
- HTTP routing or request handling
- UI rendering logic
- Direct SQL queries
- Authentication middleware

## Domain Rules Enforced

### Inspection Immutability
- Closed inspections CANNOT be modified
- This is a legal requirement for court admissibility

### Sample Chain-of-Custody
- Dispatched samples CANNOT be modified
- Ensures evidence integrity for prosecution

### Jurisdiction Binding
- All data bound to jurisdictions, not officers
- Ensures data continuity when officers transfer

### Configurable Workflows
- Officer roles, capacities, and levels are admin-configured
- Never hardcode regulatory values

## Architecture Rules
- Pure domain logic only
- No side effects (HTTP, filesystem)
- All operations return results, not throw exceptions
- Services can call repositories through database layer
