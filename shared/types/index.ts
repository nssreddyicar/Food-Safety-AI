/**
 * =============================================================================
 * FILE: shared/types/index.ts
 * LAYER: SHARED
 * =============================================================================
 * 
 * PURPOSE:
 * Shared TypeScript type definitions used across all layers.
 * Ensures consistent domain vocabulary throughout the system.
 * 
 * WHAT THIS FILE MUST NOT DO:
 * - Contain any logic
 * - Have side effects
 * - Import from layer-specific code
 * =============================================================================
 */

/**
 * Result type for operations that may fail.
 */
export type ServiceResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Paginated result type.
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Officer assignment to jurisdiction.
 */
export interface JurisdictionAssignment {
  jurisdictionId: string;
  jurisdictionName: string;
  roleId: string;
  capacityId: string;
  isPrimary: boolean;
}

/**
 * Authenticated officer profile.
 */
export interface AuthenticatedOfficer {
  id: string;
  name: string;
  email: string;
  role: string;
  designation: string | null;
  phone: string | null;
  showAdminPanel: boolean | null;
  jurisdictions: JurisdictionAssignment[];
  primaryJurisdiction: JurisdictionAssignment | null;
}
