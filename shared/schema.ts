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
