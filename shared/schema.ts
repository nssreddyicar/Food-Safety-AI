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
  phone: text("phone"),
  role: text("role").notNull().default("fso"),
  designation: text("designation"),
  districtId: varchar("district_id"),
  status: text("status").notNull().default("active"),
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
