import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  pageNumberPosition: text("page_number_position").notNull().default("center"),
  pageNumberOffset: integer("page_number_offset").notNull().default(0),
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
