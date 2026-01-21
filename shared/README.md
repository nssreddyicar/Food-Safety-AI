# Shared (Domain Models & Types)

## Purpose
Shared type definitions, enums, and schemas used across frontend, backend, and server layers. Ensures consistent domain vocabulary throughout the system.

## What This Folder Contains
- `types/` - TypeScript interfaces and types
- `enums/` - Domain enumerations (statuses, roles)
- `schemas/` - Drizzle ORM schema definitions

## What This Folder MUST NOT Contain
- Business logic
- Side effects
- HTTP handling
- UI components

## Domain Vocabulary

### Inspection Statuses
- `draft` - Inspection created but not started
- `in_progress` - Inspection underway
- `completed` - Inspection finished
- `requires_followup` - Needs additional action
- `closed` - Finalized (IMMUTABLE)

### Sample Statuses
- `pending` - Sample registered
- `collected` - Sample physically collected
- `dispatched` - Sent to laboratory
- `at_lab` - Being analyzed
- `result_received` - Lab results received
- `processed` - Final processing complete

### Sample Types
- `enforcement` - Legal enforcement sample
- `surveillance` - Routine surveillance sample

## Architecture Rules
- No logic, only type definitions
- No side effects
- Use domain language only
- Keep in sync across all layers
