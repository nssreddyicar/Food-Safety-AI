/**
 * =============================================================================
 * FILE: server/data/repositories/complaint.repository.ts
 * LAYER: DATA ACCESS (Layer 2C)
 * =============================================================================
 * 
 * PURPOSE:
 * Provides data access methods for complaint records.
 * 
 * WHAT THIS FILE MUST DO:
 * - Execute database queries for complaints
 * - Return typed results
 * - Handle query construction
 * 
 * WHAT THIS FILE MUST NOT DO:
 * - Contain business logic
 * - Make workflow decisions
 * - Validate business rules (domain layer does this)
 * =============================================================================
 */

import { db } from "../../db";
import { 
  complaints, 
  complaintEvidence, 
  complaintHistory,
  complaintFormConfigs,
  complaintStatusWorkflows,
  complaintSettings,
  type Complaint,
  type ComplaintEvidence,
  type ComplaintHistory,
  type ComplaintFormConfig,
  type ComplaintStatusWorkflow,
  type ComplaintSetting,
} from "../../../shared/schema";
import { eq, and, desc, gte, lte, like, sql } from "drizzle-orm";

export interface NewComplaint {
  complaintCode: string;
  complainantName: string;
  complainantMobile?: string;
  complainantEmail?: string;
  latitude?: string;
  longitude?: string;
  locationAccuracy?: string;
  locationTimestamp?: Date;
  locationSource: string;
  locationAddress?: string;
  nearbyLandmark?: string;
  incidentDate?: Date;
  incidentDescription?: string;
  formData?: Record<string, unknown>;
  jurisdictionId?: string;
  jurisdictionName?: string;
  status?: string;
  submittedVia?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ComplaintFilterOptions {
  status?: string;
  jurisdictionId?: string;
  assignedOfficerId?: string;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export const complaintRepository = {
  /**
   * Create a new complaint.
   */
  async create(data: NewComplaint): Promise<Complaint> {
    const [created] = await db
      .insert(complaints)
      .values(data)
      .returning();
    return created;
  },

  /**
   * Find complaint by ID.
   */
  async findById(id: string): Promise<Complaint | null> {
    const [complaint] = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, id))
      .limit(1);
    return complaint || null;
  },

  /**
   * Find complaint by code (public tracking).
   */
  async findByCode(code: string): Promise<Complaint | null> {
    const [complaint] = await db
      .select()
      .from(complaints)
      .where(eq(complaints.complaintCode, code))
      .limit(1);
    return complaint || null;
  },

  /**
   * Find complaints with filters.
   */
  async findAll(options: ComplaintFilterOptions = {}): Promise<Complaint[]> {
    const conditions = [];
    
    if (options.status) {
      conditions.push(eq(complaints.status, options.status));
    }
    if (options.jurisdictionId) {
      conditions.push(eq(complaints.jurisdictionId, options.jurisdictionId));
    }
    if (options.assignedOfficerId) {
      conditions.push(eq(complaints.assignedOfficerId, options.assignedOfficerId));
    }
    if (options.fromDate) {
      conditions.push(gte(complaints.submittedAt, options.fromDate));
    }
    if (options.toDate) {
      conditions.push(lte(complaints.submittedAt, options.toDate));
    }
    if (options.search) {
      conditions.push(
        like(complaints.complainantName, `%${options.search}%`)
      );
    }

    let query = db.select().from(complaints);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    return query
      .orderBy(desc(complaints.submittedAt))
      .limit(options.limit || 100)
      .offset(options.offset || 0);
  },

  /**
   * Update complaint.
   */
  async update(id: string, data: Partial<Complaint>): Promise<Complaint | null> {
    const [updated] = await db
      .update(complaints)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(complaints.id, id))
      .returning();
    return updated || null;
  },

  /**
   * Add evidence to complaint.
   */
  async addEvidence(data: {
    complaintId: string;
    filename: string;
    originalName: string;
    fileType: string;
    mimeType: string;
    fileSize?: number;
    fileUrl: string;
    latitude?: string;
    longitude?: string;
    captureTimestamp?: Date;
    uploadedBy: string;
    uploadedByOfficerId?: string;
    description?: string;
  }): Promise<ComplaintEvidence> {
    const [created] = await db
      .insert(complaintEvidence)
      .values({
        complaintId: data.complaintId,
        filename: data.filename,
        originalName: data.originalName,
        fileType: data.fileType,
        mimeType: data.mimeType,
        fileSize: data.fileSize || null,
        fileUrl: data.fileUrl,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        captureTimestamp: data.captureTimestamp || null,
        uploadedBy: data.uploadedBy,
        uploadedByOfficerId: data.uploadedByOfficerId || null,
        description: data.description || null,
        isDeleted: false,
      })
      .returning();
    return created;
  },

  /**
   * Get evidence for complaint.
   */
  async getEvidence(complaintId: string): Promise<ComplaintEvidence[]> {
    return db
      .select()
      .from(complaintEvidence)
      .where(and(
        eq(complaintEvidence.complaintId, complaintId),
        eq(complaintEvidence.isDeleted, false)
      ))
      .orderBy(desc(complaintEvidence.uploadedAt));
  },

  /**
   * Add history record.
   */
  async addHistory(data: {
    complaintId: string;
    action: string;
    fromStatus?: string;
    toStatus?: string;
    remarks?: string;
    evidenceId?: string;
    performedBy: string;
    officerId?: string;
    officerName?: string;
    latitude?: string;
    longitude?: string;
    ipAddress?: string;
  }): Promise<ComplaintHistory> {
    const [created] = await db
      .insert(complaintHistory)
      .values({
        complaintId: data.complaintId,
        action: data.action,
        fromStatus: data.fromStatus || null,
        toStatus: data.toStatus || null,
        remarks: data.remarks || null,
        evidenceId: data.evidenceId || null,
        performedBy: data.performedBy,
        officerId: data.officerId || null,
        officerName: data.officerName || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        ipAddress: data.ipAddress || null,
      })
      .returning();
    return created;
  },

  /**
   * Get history for complaint.
   */
  async getHistory(complaintId: string): Promise<ComplaintHistory[]> {
    return db
      .select()
      .from(complaintHistory)
      .where(eq(complaintHistory.complaintId, complaintId))
      .orderBy(desc(complaintHistory.performedAt));
  },

  /**
   * Get form configuration.
   */
  async getFormConfig(): Promise<ComplaintFormConfig[]> {
    return db
      .select()
      .from(complaintFormConfigs)
      .where(eq(complaintFormConfigs.isActive, true))
      .orderBy(complaintFormConfigs.displayOrder);
  },

  /**
   * Get allowed status transitions.
   */
  async getStatusTransitions(fromStatus?: string): Promise<ComplaintStatusWorkflow[]> {
    const conditions = [eq(complaintStatusWorkflows.isActive, true)];
    
    if (fromStatus) {
      conditions.push(eq(complaintStatusWorkflows.fromStatus, fromStatus));
    }
    
    return db
      .select()
      .from(complaintStatusWorkflows)
      .where(and(...conditions))
      .orderBy(complaintStatusWorkflows.displayOrder);
  },

  /**
   * Get setting value.
   */
  async getSetting(key: string): Promise<string | null> {
    const [setting] = await db
      .select()
      .from(complaintSettings)
      .where(eq(complaintSettings.settingKey, key))
      .limit(1);
    return setting?.settingValue || null;
  },

  /**
   * Generate unique complaint code.
   */
  async generateComplaintCode(): Promise<string> {
    const prefix = "CMP";
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    
    // Count existing complaints this month
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(like(complaints.complaintCode, `${prefix}${year}${month}%`));
    
    const sequence = ((result?.count || 0) + 1).toString().padStart(4, "0");
    return `${prefix}${year}${month}${sequence}`;
  },

  /**
   * Get complaints count by status.
   */
  async getCountByStatus(jurisdictionId?: string): Promise<Record<string, number>> {
    const conditions = [];
    if (jurisdictionId) {
      conditions.push(eq(complaints.jurisdictionId, jurisdictionId));
    }

    const results = await db
      .select({
        status: complaints.status,
        count: sql<number>`count(*)`,
      })
      .from(complaints)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(complaints.status);

    return results.reduce((acc, { status, count }) => {
      acc[status] = count;
      return acc;
    }, {} as Record<string, number>);
  },
};

export type { Complaint, ComplaintEvidence, ComplaintHistory, ComplaintFormConfig };
