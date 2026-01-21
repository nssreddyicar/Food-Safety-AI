/**
 * =============================================================================
 * FILE: backend/index.ts
 * LAYER: DOMAIN / BUSINESS LOGIC
 * =============================================================================
 * 
 * PURPOSE:
 * Central export point for all backend domain services.
 * Provides a clean import interface for the server API layer.
 * 
 * USAGE:
 * import { officerService, inspectionService } from "../backend";
 * 
 * WHAT THIS FILE MUST NOT DO:
 * - Contain any logic
 * - Define types (those are in individual services)
 * =============================================================================
 */

export { officerService } from "./services/officer.service";
export { inspectionService } from "./inspections/inspection.service";
export { sampleService } from "./samples/sample.service";
export { jurisdictionService } from "./jurisdictions/jurisdiction.service";

export type { ServiceResult, AuthenticatedOfficer, JurisdictionAssignment } from "./services/officer.service";
export { INSPECTION_STATUSES } from "./inspections/inspection.service";
export { SAMPLE_STATUSES, SAMPLE_TYPES } from "./samples/sample.service";
