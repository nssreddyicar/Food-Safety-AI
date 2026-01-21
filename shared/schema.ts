/**
 * =============================================================================
 * FILE: shared/schema.ts
 * =============================================================================
 * 
 * PURPOSE:
 * This file defines the PostgreSQL database schema using Drizzle ORM for the
 * Food Safety Inspector system. All tables represent real-world entities in
 * the FSSAI (Food Safety and Standards Authority of India) regulatory framework.
 * 
 * BUSINESS/DOMAIN CONTEXT:
 * - This is a government-grade regulatory system for food safety enforcement
 * - Data must be audit-ready and court-admissible
 * - Records related to inspections, samples, and prosecutions are legally binding
 * - The system supports dynamic administrative hierarchies (State → District → Zone)
 * 
 * PROBLEMS SOLVED:
 * - Provides type-safe database access through Drizzle ORM
 * - Ensures data integrity through proper constraints
 * - Supports dynamic jurisdiction hierarchies (admin-controlled)
 * - Maintains audit trails through timestamps and status fields
 * 
 * ASSUMPTIONS THAT MUST NEVER BE MADE:
 * - Never assume jurisdiction levels are fixed (State, District, Zone are configurable)
 * - Never assume officer roles are static (FSO, DO, etc. are admin-controlled)
 * - Never assume workflow steps are hardcoded (workflows are configurable)
 * - Never assume sample deadlines are fixed (14 days is a system setting)
 * 
 * DATA INTEGRITY RULES:
 * - Inspections become immutable once status is "closed"
 * - Sample records cannot be modified after dispatch to lab
 * - Prosecution records are append-only for court admissibility
 * - All modifications must preserve historical data
 * 
 * DEPENDENT SYSTEMS:
 * - server/routes.ts uses these schemas for API operations
 * - server/db.ts connects to the database using this schema
 * - client/types/index.ts mirrors these types for the mobile app
 * =============================================================================
 */

import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Users table for basic authentication (legacy, use officers table instead).
 * 
 * WHY: Initial user management, being phased out in favor of officers table.
 * NEVER: Use for food safety officer authentication - use officers table.
 */
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const officers = pgTable("officers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  phone: text("phone"),
  role: text("role").notNull().default("fso"),
  designation: text("designation"),
  districtId: varchar("district_id"),
  dateOfJoining: timestamp("date_of_joining"),
  employeeId: text("employee_id"),
  status: text("status").notNull().default("active"),
  showAdminPanel: boolean("show_admin_panel").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOfficerSchema = createInsertSchema(officers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOfficer = z.infer<typeof insertOfficerSchema>;
export type Officer = typeof officers.$inferSelect;

export const districts = pgTable("districts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  state: text("state").notNull(),
  zone: text("zone"),
  headquarters: text("headquarters"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDistrictSchema = createInsertSchema(districts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDistrict = z.infer<typeof insertDistrictSchema>;
export type District = typeof districts.$inferSelect;

export const inspections = pgTable("inspections", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  status: text("status").notNull().default("draft"),
  officerId: varchar("officer_id"),
  districtId: varchar("district_id"),
  jurisdictionId: varchar("jurisdiction_id"),
  fboDetails: jsonb("fbo_details"),
  proprietorDetails: jsonb("proprietor_details"),
  deviations: jsonb("deviations"),
  actionsTaken: jsonb("actions_taken"),
  sampleLifted: boolean("sample_lifted").default(false),
  samples: jsonb("samples"),
  witnesses: jsonb("witnesses"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Inspection = typeof inspections.$inferSelect;

export const samples = pgTable("samples", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  inspectionId: varchar("inspection_id"),
  sampleType: text("sample_type").notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  status: text("status").notNull().default("pending"),
  liftedDate: timestamp("lifted_date"),
  dispatchDate: timestamp("dispatch_date"),
  labReportDate: timestamp("lab_report_date"),
  labResult: text("lab_result"),
  officerId: varchar("officer_id"),
  districtId: varchar("district_id"),
  jurisdictionId: varchar("jurisdiction_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Sample = typeof samples.$inferSelect;

export const systemSettings = pgTable("system_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value"),
  description: text("description"),
  category: text("category").notNull().default("general"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;

// Dynamic Administrative Levels (State, District, Zone, Mandal, etc.)
export const administrativeLevels = pgTable("administrative_levels", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  levelNumber: integer("level_number").notNull(),
  levelName: text("level_name").notNull(),
  displayOrder: integer("display_order").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AdministrativeLevel = typeof administrativeLevels.$inferSelect;

// Jurisdiction Units (Telangana, Hyderabad, North Zone, etc.)
export const jurisdictionUnits = pgTable("jurisdiction_units", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull(),
  levelId: varchar("level_id").notNull(),
  parentId: varchar("parent_id"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type JurisdictionUnit = typeof jurisdictionUnits.$inferSelect;

// Officer Roles (FSO, DO, FAC, Inspector, etc.) - Super Admin controlled
export const officerRoles = pgTable("officer_roles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type OfficerRole = typeof officerRoles.$inferSelect;

// Officer Capacities (Regular, In-Charge, FAC, Temporary, etc.) - Super Admin controlled
export const officerCapacities = pgTable("officer_capacities", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type OfficerCapacity = typeof officerCapacities.$inferSelect;

// Officer Assignments to Jurisdictions (time-bound, audit-preserved)
export const officerAssignments = pgTable("officer_assignments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  officerId: varchar("officer_id").notNull(),
  jurisdictionId: varchar("jurisdiction_id").notNull(),
  roleId: varchar("role_id").notNull(),
  capacityId: varchar("capacity_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isPrimary: boolean("is_primary").default(false),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type OfficerAssignment = typeof officerAssignments.$inferSelect;

// Document Templates with dynamic placeholders
export const documentTemplates = pgTable("document_templates", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("general"),
  content: text("content").notNull(),
  placeholders: jsonb("placeholders"),
  pageSize: text("page_size").notNull().default("A4"),
  orientation: text("orientation").notNull().default("portrait"),
  marginTop: integer("margin_top").notNull().default(20),
  marginBottom: integer("margin_bottom").notNull().default(20),
  marginLeft: integer("margin_left").notNull().default(20),
  marginRight: integer("margin_right").notNull().default(20),
  fontFamily: text("font_family").notNull().default("Times New Roman"),
  fontSize: integer("font_size").notNull().default(12),
  showPageNumbers: boolean("show_page_numbers").default(true),
  pageNumberFormat: text("page_number_format").notNull().default("page_x_of_y"),
  pageNumberPosition: text("page_number_position").notNull().default("center"),
  pageNumberOffset: integer("page_number_offset").notNull().default(0),
  showContinuationText: boolean("show_continuation_text").default(false),
  continuationFormat: text("continuation_format")
    .notNull()
    .default("contd_on_page"),
  showHeader: boolean("show_header").default(true),
  showFooter: boolean("show_footer").default(true),
  headerText: text("header_text"),
  footerText: text("footer_text"),
  headerAlignment: text("header_alignment").notNull().default("center"),
  footerAlignment: text("footer_alignment").notNull().default("center"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type DocumentTemplate = typeof documentTemplates.$inferSelect;

// Sample Workflow Nodes - Dynamic workflow steps controlled by admin
export const workflowNodes = pgTable("workflow_nodes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  position: integer("position").notNull().default(0),
  nodeType: text("node_type").notNull().default("action"), // action, decision, end
  icon: text("icon").default("circle"), // Feather icon name
  color: text("color").default("#1E40AF"), // Node color
  inputFields: jsonb("input_fields"), // JSON array of input field definitions
  templateIds: jsonb("template_ids"), // Array of related template IDs
  isStartNode: boolean("is_start_node").default(false),
  isEndNode: boolean("is_end_node").default(false),
  autoAdvanceCondition: text("auto_advance_condition"), // e.g., "days_elapsed:14"
  editFreezeHours: integer("edit_freeze_hours").default(48), // Hours after which node becomes non-editable
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WorkflowNode = typeof workflowNodes.$inferSelect;

// Workflow Transitions - Connections between nodes with conditions
export const workflowTransitions = pgTable("workflow_transitions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fromNodeId: varchar("from_node_id").notNull(),
  toNodeId: varchar("to_node_id").notNull(),
  conditionType: text("condition_type").notNull().default("always"), // always, lab_result, field_value, custom
  conditionField: text("condition_field"), // e.g., "labResult"
  conditionOperator: text("condition_operator"), // equals, not_equals, contains, greater_than
  conditionValue: text("condition_value"), // e.g., "unsafe", "substandard"
  label: text("label"), // Transition label shown to user
  displayOrder: integer("display_order").notNull().default(0),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WorkflowTransition = typeof workflowTransitions.$inferSelect;

// Sample Workflow State - Tracks where each sample is in the workflow
export const sampleWorkflowState = pgTable("sample_workflow_state", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sampleId: varchar("sample_id").notNull(),
  currentNodeId: varchar("current_node_id").notNull(),
  nodeData: jsonb("node_data"), // Data collected at this node
  enteredAt: timestamp("entered_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  status: text("status").notNull().default("active"), // active, completed, skipped
  createdAt: timestamp("created_at").defaultNow(),
});

export type SampleWorkflowState = typeof sampleWorkflowState.$inferSelect;

// Sample Code Bank - Pre-generated sample codes for officers
export const sampleCodes = pgTable("sample_codes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  prefix: text("prefix").notNull(),
  middle: text("middle").notNull(),
  suffix: text("suffix").notNull(),
  fullCode: text("full_code").notNull().unique(), // Concatenated code for quick lookup
  sampleType: text("sample_type").notNull(), // 'enforcement' or 'surveillance'
  status: text("status").notNull().default("available"), // 'available' or 'used'
  generatedByOfficerId: varchar("generated_by_officer_id"),
  generatedAt: timestamp("generated_at").defaultNow(),
  batchId: varchar("batch_id"), // Groups codes generated together
  jurisdictionId: varchar("jurisdiction_id"),
  // Usage tracking fields (populated when code is used)
  usedByOfficerId: varchar("used_by_officer_id"),
  usedAt: timestamp("used_at"),
  linkedSampleId: varchar("linked_sample_id"),
  linkedSampleReference: text("linked_sample_reference"),
  usageLocation: text("usage_location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SampleCode = typeof sampleCodes.$inferSelect;

// Sample Code Audit Log - Immutable audit trail for code operations
export const sampleCodeAuditLog = pgTable("sample_code_audit_log", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sampleCodeId: varchar("sample_code_id").notNull(),
  action: text("action").notNull(), // 'generated', 'used', 'voided'
  performedByOfficerId: varchar("performed_by_officer_id"),
  performedByName: text("performed_by_name"),
  details: jsonb("details"), // Additional context
  ipAddress: text("ip_address"),
  deviceInfo: text("device_info"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SampleCodeAuditLog = typeof sampleCodeAuditLog.$inferSelect;

// FBO Licenses - License records for Food Business Operators
export const fboLicenses = pgTable("fbo_licenses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  licenseNumber: text("license_number").notNull().unique(),
  fboName: text("fbo_name").notNull(),
  fboAddress: text("fbo_address"),
  fboType: text("fbo_type"), // Manufacturing, Trading, Restaurant, etc.
  licenseCategory: text("license_category").notNull(), // Central, State, Registration
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  feeAmount: integer("fee_amount").default(0),
  feePaidDate: timestamp("fee_paid_date"),
  status: text("status").notNull().default("active"), // active, expired, suspended, cancelled
  jurisdictionId: varchar("jurisdiction_id"),
  officerId: varchar("officer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type FboLicense = typeof fboLicenses.$inferSelect;

// FBO Registrations - Registration records (smaller establishments)
export const fboRegistrations = pgTable("fbo_registrations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  registrationNumber: text("registration_number").notNull().unique(),
  fboName: text("fbo_name").notNull(),
  fboAddress: text("fbo_address"),
  fboType: text("fbo_type"),
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  feeAmount: integer("fee_amount").default(0),
  feePaidDate: timestamp("fee_paid_date"),
  status: text("status").notNull().default("active"),
  jurisdictionId: varchar("jurisdiction_id"),
  officerId: varchar("officer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type FboRegistration = typeof fboRegistrations.$inferSelect;

// Grievances - Consumer complaints and grievances
export const grievances = pgTable("grievances", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  grievanceNumber: text("grievance_number").notNull().unique(),
  complainantName: text("complainant_name").notNull(),
  complainantContact: text("complainant_contact"),
  complainantAddress: text("complainant_address"),
  subject: text("subject").notNull(),
  description: text("description"),
  category: text("category"), // Food Safety, Hygiene, Adulteration, etc.
  source: text("source").notNull().default("offline"), // online, offline
  fboName: text("fbo_name"),
  fboAddress: text("fbo_address"),
  receivedDate: timestamp("received_date").defaultNow(),
  dueDate: timestamp("due_date"),
  resolvedDate: timestamp("resolved_date"),
  status: text("status").notNull().default("pending"), // pending, investigating, resolved, closed
  resolution: text("resolution"),
  jurisdictionId: varchar("jurisdiction_id"),
  assignedOfficerId: varchar("assigned_officer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Grievance = typeof grievances.$inferSelect;

// FSW Activities - Food Safety Worker testing, training, awareness
export const fswActivities = pgTable("fsw_activities", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  activityType: text("activity_type").notNull(), // testing, training, awareness
  activityDate: timestamp("activity_date").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  participantCount: integer("participant_count").default(0),
  targetAudience: text("target_audience"),
  conductedBy: text("conducted_by"),
  duration: text("duration"), // e.g., "2 hours", "1 day"
  status: text("status").notNull().default("completed"),
  images: jsonb("images"), // Array of image URLs
  remarks: text("remarks"),
  jurisdictionId: varchar("jurisdiction_id"),
  officerId: varchar("officer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type FswActivity = typeof fswActivities.$inferSelect;

// Adjudication Cases - Administrative adjudication
export const adjudicationCases = pgTable("adjudication_cases", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  caseNumber: text("case_number").notNull().unique(),
  respondentName: text("respondent_name").notNull(),
  respondentAddress: text("respondent_address"),
  complainantName: text("complainant_name").notNull(),
  offenceDetails: text("offence_details"),
  sampleId: varchar("sample_id"),
  inspectionId: varchar("inspection_id"),
  filingDate: timestamp("filing_date"),
  adjudicatorName: text("adjudicator_name"),
  penaltyAmount: integer("penalty_amount"),
  orderDate: timestamp("order_date"),
  status: text("status").notNull().default("pending"), // pending, hearing, decided, appealed, closed
  outcome: text("outcome"), // penalty, warning, dismissed
  remarks: text("remarks"),
  jurisdictionId: varchar("jurisdiction_id"),
  officerId: varchar("officer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AdjudicationCase = typeof adjudicationCases.$inferSelect;

// Prosecution Cases - Court cases for serious violations
export const prosecutionCases = pgTable("prosecution_cases", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  caseNumber: text("case_number").notNull().unique(),
  courtName: text("court_name"),
  courtLocation: text("court_location"),
  respondentName: text("respondent_name").notNull(),
  respondentAddress: text("respondent_address"),
  complainantName: text("complainant_name").notNull(),
  complainantDesignation: text("complainant_designation"),
  offenceDetails: text("offence_details"),
  sectionsCharged: text("sections_charged"), // e.g., "Section 59 of FSS Act"
  sampleId: varchar("sample_id"),
  inspectionId: varchar("inspection_id"),
  firstRegistrationDate: timestamp("first_registration_date"),
  firstHearingDate: timestamp("first_hearing_date"),
  nextHearingDate: timestamp("next_hearing_date"),
  lastHearingDate: timestamp("last_hearing_date"),
  status: text("status").notNull().default("pending"), // pending, ongoing, convicted, acquitted, closed
  outcome: text("outcome"),
  sentenceDetails: text("sentence_details"),
  fineAmount: integer("fine_amount"),
  jurisdictionId: varchar("jurisdiction_id"),
  officerId: varchar("officer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ProsecutionCase = typeof prosecutionCases.$inferSelect;

// Prosecution Case Hearings - Individual hearing records
export const prosecutionHearings = pgTable("prosecution_hearings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").notNull(),
  hearingDate: timestamp("hearing_date").notNull(),
  hearingType: text("hearing_type"), // first_registration, first_hearing, regular, arguments, judgment
  courtRoom: text("court_room"),
  judgeName: text("judge_name"),
  attendees: text("attendees"),
  proceedings: text("proceedings"),
  orderPassed: text("order_passed"),
  nextDate: timestamp("next_date"),
  nextDatePurpose: text("next_date_purpose"),
  notes: text("notes"),
  images: jsonb("images"), // Array of image URLs for uploaded documents
  status: text("status").notNull().default("scheduled"), // scheduled, completed, adjourned, cancelled
  createdByOfficerId: varchar("created_by_officer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ProsecutionHearing = typeof prosecutionHearings.$inferSelect;

// Action Dashboard Categories - Admin-configurable action categories
export const actionCategories = pgTable("action_categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // e.g., 'court_cases', 'pending_inspections'
  description: text("description"),
  icon: text("icon").notNull().default("alert-circle"), // Feather icon name
  color: text("color").notNull().default("#1E40AF"),
  group: text("group").notNull(), // 'legal', 'inspection', 'sampling', 'administrative', 'protocol'
  entityType: text("entity_type").notNull(), // 'prosecution_case', 'inspection', 'sample', etc.
  countQuery: text("count_query"), // SQL or entity filter for counting items
  dueDateField: text("due_date_field"), // Field name for due date calculation
  slaDefaultDays: integer("sla_default_days").default(7), // Default SLA in days
  priority: text("priority").notNull().default("normal"), // critical, high, normal
  displayOrder: integer("display_order").notNull().default(0),
  isEnabled: boolean("is_enabled").default(true),
  showOnDashboard: boolean("show_on_dashboard").default(true),
  showInReport: boolean("show_in_report").default(true),
  reportDisplayOrder: integer("report_display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ActionCategory = typeof actionCategories.$inferSelect;

// Action Items - Individual action items derived from various entities
export const actionItems = pgTable("action_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull(),
  entityType: text("entity_type").notNull(), // 'prosecution_case', 'inspection', 'sample', etc.
  entityId: varchar("entity_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("normal"), // critical, high, normal
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, overdue
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  assignedOfficerId: varchar("assigned_officer_id"),
  jurisdictionId: varchar("jurisdiction_id"),
  metadata: jsonb("metadata"), // Additional entity-specific data
  reminderSent: boolean("reminder_sent").default(false),
  escalated: boolean("escalated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ActionItem = typeof actionItems.$inferSelect;

// Action Item Audit Log - Immutable audit trail for action status changes
export const actionItemAuditLog = pgTable("action_item_audit_log", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  actionItemId: varchar("action_item_id").notNull(),
  previousStatus: text("previous_status"),
  newStatus: text("new_status").notNull(),
  changedByOfficerId: varchar("changed_by_officer_id"),
  changedByName: text("changed_by_name"),
  changeReason: text("change_reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ActionItemAuditLog = typeof actionItemAuditLog.$inferSelect;

// Dashboard SLA Settings - Global SLA configuration per category
export const slASettings = pgTable("sla_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull(),
  slaDays: integer("sla_days").notNull().default(7),
  warningDays: integer("warning_days").notNull().default(2), // Days before due to show warning
  criticalDays: integer("critical_days").notNull().default(0), // Days to mark as critical
  autoEscalateDays: integer("auto_escalate_days"), // Days after due to auto-escalate
  reminderEnabled: boolean("reminder_enabled").default(true),
  escalationEnabled: boolean("escalation_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SLASetting = typeof slASettings.$inferSelect;

// Special Drives - Admin-defined special inspection drives
export const specialDrives = pgTable("special_drives", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  targetCount: integer("target_count").default(0), // Target number of inspections
  completedCount: integer("completed_count").default(0),
  status: text("status").notNull().default("upcoming"), // upcoming, active, completed, cancelled
  priority: text("priority").notNull().default("high"),
  jurisdictionId: varchar("jurisdiction_id"), // null for all jurisdictions
  createdByOfficerId: varchar("created_by_officer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SpecialDrive = typeof specialDrives.$inferSelect;

// VVIP Protocol Duties - Special duty assignments
export const vvipDuties = pgTable("vvip_duties", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  dutyType: text("duty_type").notNull(), // 'vvip', 'asl', 'event'
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  eventDate: timestamp("event_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  vvipName: text("vvip_name"),
  vvipDesignation: text("vvip_designation"),
  securityLevel: text("security_level"), // 'z_plus', 'z', 'y', 'x'
  assignedOfficerIds: jsonb("assigned_officer_ids"), // Array of officer IDs
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  remarks: text("remarks"),
  images: jsonb("images"),
  jurisdictionId: varchar("jurisdiction_id"),
  createdByOfficerId: varchar("created_by_officer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type VvipDuty = typeof vvipDuties.$inferSelect;

// Workshops & Trainings - Training and workshop records
export const workshops = pgTable("workshops", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  workshopType: text("workshop_type").notNull(), // 'training', 'workshop', 'seminar', 'dlac_meeting'
  venue: text("venue"),
  eventDate: timestamp("event_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  organizerName: text("organizer_name"),
  targetAudience: text("target_audience"),
  maxParticipants: integer("max_participants"),
  registeredParticipants: integer("registered_participants").default(0),
  attendedParticipants: integer("attended_participants").default(0),
  status: text("status").notNull().default("scheduled"), // scheduled, ongoing, completed, cancelled
  isCompulsory: boolean("is_compulsory").default(false),
  assignedOfficerIds: jsonb("assigned_officer_ids"),
  remarks: text("remarks"),
  materials: jsonb("materials"), // Array of attachment URLs
  jurisdictionId: varchar("jurisdiction_id"),
  createdByOfficerId: varchar("created_by_officer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Workshop = typeof workshops.$inferSelect;

// Improvement Notices - Regulatory notices issued to FBOs
export const improvementNotices = pgTable("improvement_notices", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  noticeNumber: text("notice_number").notNull().unique(),
  inspectionId: varchar("inspection_id"),
  fboName: text("fbo_name").notNull(),
  fboAddress: text("fbo_address"),
  fboLicenseNumber: text("fbo_license_number"),
  issueDate: timestamp("issue_date").notNull(),
  complianceDeadline: timestamp("compliance_deadline").notNull(),
  deviations: jsonb("deviations"), // Array of deviations to be corrected
  status: text("status").notNull().default("issued"), // issued, compliance_verified, non_compliant, escalated
  verificationDate: timestamp("verification_date"),
  verificationRemarks: text("verification_remarks"),
  followUpInspectionId: varchar("follow_up_inspection_id"),
  issuedByOfficerId: varchar("issued_by_officer_id"),
  jurisdictionId: varchar("jurisdiction_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ImprovementNotice = typeof improvementNotices.$inferSelect;

// Seized Articles - Records of seized food articles
export const seizedArticles = pgTable("seized_articles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  seizureNumber: text("seizure_number").notNull().unique(),
  inspectionId: varchar("inspection_id"),
  fboName: text("fbo_name").notNull(),
  fboAddress: text("fbo_address"),
  articleName: text("article_name").notNull(),
  quantity: text("quantity"),
  estimatedValue: integer("estimated_value"),
  seizureDate: timestamp("seizure_date").notNull(),
  reasonForSeizure: text("reason_for_seizure"),
  storageLocation: text("storage_location"),
  status: text("status").notNull().default("seized"), // seized, destroyed, released, disposed
  disposalDate: timestamp("disposal_date"),
  disposalMethod: text("disposal_method"),
  disposalWitness: text("disposal_witness"),
  images: jsonb("images"),
  seizedByOfficerId: varchar("seized_by_officer_id"),
  jurisdictionId: varchar("jurisdiction_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SeizedArticle = typeof seizedArticles.$inferSelect;

// Dashboard Statistics Cards - Admin-configurable statistics cards for mobile dashboard
export const statisticsCards = pgTable("statistics_cards", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // e.g., 'licenses_issued', 'inspections_completed'
  description: text("description"),
  icon: text("icon").notNull().default("bar-chart-2"), // Feather icon name
  color: text("color").notNull().default("#1E40AF"),
  group: text("group").notNull().default("general"), // 'license', 'inspection', 'sample', 'financial'
  valueType: text("value_type").notNull().default("count"), // 'count', 'currency', 'percentage'
  entityType: text("entity_type"), // 'license', 'inspection', 'sample', etc.
  countQuery: text("count_query"), // Filter or calculation method
  displayOrder: integer("display_order").notNull().default(0),
  isEnabled: boolean("is_enabled").default(true),
  showOnDashboard: boolean("show_on_dashboard").default(true),
  showInReport: boolean("show_in_report").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type StatisticsCard = typeof statisticsCards.$inferSelect;

// Dashboard Settings - Global dashboard configuration
export const dashboardSettings = pgTable("dashboard_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  settingKey: text("setting_key").notNull().unique(), // e.g., 'show_action_dashboard', 'stats_columns'
  settingValue: text("setting_value"),
  settingType: text("setting_type").notNull().default("string"), // 'string', 'boolean', 'number', 'json'
  description: text("description"),
  category: text("category").notNull().default("general"), // 'general', 'action_dashboard', 'statistics', 'report'
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type DashboardSetting = typeof dashboardSettings.$inferSelect;

// Report Layout Configuration - Admin-configurable report sections
export const reportSections = pgTable("report_sections", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // e.g., 'action_summary', 'category_breakdown'
  description: text("description"),
  sectionType: text("section_type").notNull(), // 'summary', 'table', 'chart', 'statistics'
  displayOrder: integer("display_order").notNull().default(0),
  isEnabled: boolean("is_enabled").default(true),
  showInPdf: boolean("show_in_pdf").default(true),
  showInExcel: boolean("show_in_excel").default(true),
  configuration: jsonb("configuration"), // Section-specific configuration (columns, filters, etc.)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ReportSection = typeof reportSections.$inferSelect;

// =============================================================================
// DYNAMIC COMPLAINT MANAGEMENT SYSTEM
// =============================================================================
// 
// PURPOSE: Location-aware, evidence-supported, admin-controlled complaint system
// 
// DESIGN PRINCIPLES:
// - All form fields are dynamic (admin-configured)
// - Location data is immutable once submitted
// - Evidence is traceable with metadata
// - Jurisdiction auto-mapped from GPS coordinates
// - Workflows are configurable, not hardcoded
// =============================================================================

/**
 * Complaint Form Configuration - Admin-controlled form fields.
 * 
 * WHY: Allows Super Admin to configure which fields appear on complaint form.
 * RULES:
 * - Field visibility, validation, and order are admin-controlled
 * - No hardcoded fields - all dynamic
 * - Changes affect new complaints only (existing are preserved)
 */
export const complaintFormConfigs = pgTable("complaint_form_configs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fieldName: text("field_name").notNull(), // Internal name (e.g., "complainant_name")
  fieldLabel: text("field_label").notNull(), // Display label (e.g., "Your Name")
  fieldType: text("field_type").notNull(), // text, textarea, date, dropdown, phone, email, file, location
  fieldGroup: text("field_group").notNull(), // complainant, incident, accused, evidence
  displayOrder: integer("display_order").notNull().default(0),
  isRequired: boolean("is_required").default(false),
  isVisible: boolean("is_visible").default(true),
  isVisibleToOfficer: boolean("is_visible_to_officer").default(true),
  isVisibleToComplainant: boolean("is_visible_to_complainant").default(true),
  isEditable: boolean("is_editable").default(true), // Can complainant edit after submit?
  validationRules: jsonb("validation_rules"), // { minLength, maxLength, pattern, etc. }
  dropdownOptions: jsonb("dropdown_options"), // For dropdown fields: [{value, label}]
  defaultValue: text("default_value"),
  helpText: text("help_text"), // Instructions for user
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ComplaintFormConfig = typeof complaintFormConfigs.$inferSelect;

/**
 * Complaint Status Workflows - Admin-controlled status transitions.
 * 
 * WHY: Allows Super Admin to define allowed status transitions.
 * RULES:
 * - No hardcoded workflows
 * - Each transition can have conditions
 */
export const complaintStatusWorkflows = pgTable("complaint_status_workflows", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fromStatus: text("from_status").notNull(),
  toStatus: text("to_status").notNull(),
  transitionName: text("transition_name").notNull(), // e.g., "Assign to Officer"
  requiredRole: text("required_role"), // Which role can perform this transition
  requiresEvidence: boolean("requires_evidence").default(false),
  requiresRemarks: boolean("requires_remarks").default(false),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ComplaintStatusWorkflow = typeof complaintStatusWorkflows.$inferSelect;

/**
 * Complaints - Core complaint records with location data.
 * 
 * WHY: Stores citizen complaints with GPS location and jurisdiction mapping.
 * RULES:
 * - Location data is IMMUTABLE once submitted
 * - Jurisdiction auto-assigned from GPS
 * - formData stores dynamic field values as JSON
 */
export const complaints = pgTable("complaints", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  complaintCode: text("complaint_code").notNull().unique(), // Public tracking code
  
  // Complainant Details (core fields, additional in formData)
  complainantName: text("complainant_name").notNull(),
  complainantMobile: text("complainant_mobile"),
  complainantEmail: text("complainant_email"),
  
  // Location Data (IMMUTABLE after submission)
  latitude: text("latitude"),
  longitude: text("longitude"),
  locationAccuracy: text("location_accuracy"), // meters
  locationTimestamp: timestamp("location_timestamp"),
  locationSource: text("location_source").notNull().default("manual"), // gps, manual
  locationAddress: text("location_address"), // Reverse geocoded or manual
  nearbyLandmark: text("nearby_landmark"),
  
  // Incident Details
  incidentDate: timestamp("incident_date"),
  incidentDescription: text("incident_description"),
  
  // Dynamic Form Data (stores all admin-configured fields)
  formData: jsonb("form_data"), // { fieldName: value, ... }
  
  // Jurisdiction (auto-mapped from GPS or manual)
  jurisdictionId: varchar("jurisdiction_id"),
  jurisdictionName: text("jurisdiction_name"), // Snapshot at submission time
  
  // Status & Assignment
  status: text("status").notNull().default("submitted"),
  assignedOfficerId: varchar("assigned_officer_id"),
  assignedAt: timestamp("assigned_at"),
  
  // Resolution
  resolvedAt: timestamp("resolved_at"),
  resolutionRemarks: text("resolution_remarks"),
  
  // Audit Fields
  submittedAt: timestamp("submitted_at").defaultNow(),
  submittedVia: text("submitted_via").default("mobile"), // mobile, web, offline
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Complaint = typeof complaints.$inferSelect;

/**
 * Complaint Evidence - Uploaded proofs with metadata.
 * 
 * WHY: Stores photos, videos, documents as evidence with GPS metadata.
 * RULES:
 * - All uploads are traceable
 * - GPS metadata captured if available
 * - Evidence cannot be deleted (audit requirement)
 */
export const complaintEvidence = pgTable("complaint_evidence", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  complaintId: varchar("complaint_id").notNull(),
  
  // File Details
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(), // image, video, audio, document
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size"), // bytes
  fileUrl: text("file_url").notNull(),
  
  // GPS Metadata (from file EXIF or capture time)
  latitude: text("latitude"),
  longitude: text("longitude"),
  captureTimestamp: timestamp("capture_timestamp"),
  
  // Upload Context
  uploadedBy: text("uploaded_by").notNull(), // complainant, officer
  uploadedByOfficerId: varchar("uploaded_by_officer_id"),
  description: text("description"),
  
  // Audit
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false), // Soft delete only
});

export type ComplaintEvidence = typeof complaintEvidence.$inferSelect;

/**
 * Complaint History - Audit trail for all changes.
 * 
 * WHY: Legal requirement - all changes must be logged.
 * RULES:
 * - Records are APPEND-ONLY
 * - Never delete or modify history
 * - Stores before/after for status changes
 */
export const complaintHistory = pgTable("complaint_history", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  complaintId: varchar("complaint_id").notNull(),
  
  // Change Details
  action: text("action").notNull(), // status_change, assigned, evidence_added, remark_added
  fromStatus: text("from_status"),
  toStatus: text("to_status"),
  remarks: text("remarks"),
  
  // Evidence (if action added evidence)
  evidenceId: varchar("evidence_id"),
  
  // Actor
  performedBy: text("performed_by").notNull(), // system, officer, complainant
  officerId: varchar("officer_id"),
  officerName: text("officer_name"),
  
  // Location (for field actions)
  latitude: text("latitude"),
  longitude: text("longitude"),
  
  // Audit
  performedAt: timestamp("performed_at").defaultNow(),
  ipAddress: text("ip_address"),
});

export type ComplaintHistory = typeof complaintHistory.$inferSelect;

/**
 * Complaint Settings - System-wide complaint configuration.
 * 
 * WHY: Admin-controlled global settings for complaint system.
 */
export const complaintSettings = pgTable("complaint_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value"),
  settingType: text("setting_type").notNull(), // boolean, number, string, json
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ComplaintSetting = typeof complaintSettings.$inferSelect;
