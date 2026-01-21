/**
 * =============================================================================
 * FILE: shared/enums/index.ts
 * LAYER: SHARED
 * =============================================================================
 * 
 * PURPOSE:
 * Domain enumerations used across all layers.
 * Ensures consistent status values throughout the system.
 * 
 * WHAT THIS FILE MUST NOT DO:
 * - Contain any logic
 * - Have side effects
 * =============================================================================
 */

/**
 * Inspection status values.
 * 
 * WORKFLOW:
 * draft → in_progress → completed → closed
 *                    ↘ requires_followup → closed
 */
export const INSPECTION_STATUSES = {
  DRAFT: "draft",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  REQUIRES_FOLLOWUP: "requires_followup",
  CLOSED: "closed",
} as const;

export type InspectionStatus = typeof INSPECTION_STATUSES[keyof typeof INSPECTION_STATUSES];

/**
 * Sample status values.
 * 
 * WORKFLOW:
 * pending → collected → dispatched → at_lab → result_received → processed
 */
export const SAMPLE_STATUSES = {
  PENDING: "pending",
  COLLECTED: "collected",
  DISPATCHED: "dispatched",
  AT_LAB: "at_lab",
  RESULT_RECEIVED: "result_received",
  PROCESSED: "processed",
} as const;

export type SampleStatus = typeof SAMPLE_STATUSES[keyof typeof SAMPLE_STATUSES];

/**
 * Sample types.
 */
export const SAMPLE_TYPES = {
  ENFORCEMENT: "enforcement",
  SURVEILLANCE: "surveillance",
} as const;

export type SampleType = typeof SAMPLE_TYPES[keyof typeof SAMPLE_TYPES];

/**
 * Officer status values.
 */
export const OFFICER_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  TRANSFERRED: "transferred",
} as const;

export type OfficerStatus = typeof OFFICER_STATUSES[keyof typeof OFFICER_STATUSES];

/**
 * Jurisdiction status values.
 */
export const JURISDICTION_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type JurisdictionStatus = typeof JURISDICTION_STATUSES[keyof typeof JURISDICTION_STATUSES];
