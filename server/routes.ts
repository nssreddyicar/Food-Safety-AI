import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import * as fs from "fs";
import * as path from "path";
import { db } from "./db";
import { officers, districts, inspections, samples, systemSettings, administrativeLevels, jurisdictionUnits, officerRoles, officerCapacities, officerAssignments } from "../shared/schema";
import { desc, asc, count, sql } from "drizzle-orm";

const ADMIN_CREDENTIALS = {
  username: "superadmin",
  password: "Admin@123",
};

const adminSessions = new Map<string, { expires: number }>();

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function isValidSession(token: string): boolean {
  const session = adminSessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expires) {
    adminSessions.delete(token);
    return false;
  }
  return true;
}

function getSessionToken(req: Request): string | undefined {
  return req.headers.cookie
    ?.split(";")
    .find((c) => c.trim().startsWith("admin_session="))
    ?.split("=")[1];
}

function requireAuth(req: Request, res: Response, next: () => void) {
  const token = getSessionToken(req);
  if (!token || !isValidSession(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/admin", (_req: Request, res: Response) => {
    const templatePath = path.resolve(process.cwd(), "server", "templates", "admin-login.html");
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  app.get("/admin/dashboard", (req: Request, res: Response) => {
    const sessionToken = getSessionToken(req);
    if (!sessionToken || !isValidSession(sessionToken)) {
      return res.redirect("/admin");
    }
    const templatePath = path.resolve(process.cwd(), "server", "templates", "admin-dashboard.html");
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  app.get("/admin/officers", (req: Request, res: Response) => {
    const sessionToken = getSessionToken(req);
    if (!sessionToken || !isValidSession(sessionToken)) {
      return res.redirect("/admin");
    }
    const templatePath = path.resolve(process.cwd(), "server", "templates", "admin-officers.html");
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  app.get("/admin/districts", (req: Request, res: Response) => {
    const sessionToken = getSessionToken(req);
    if (!sessionToken || !isValidSession(sessionToken)) {
      return res.redirect("/admin");
    }
    const templatePath = path.resolve(process.cwd(), "server", "templates", "admin-districts.html");
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  app.get("/admin/reports", (req: Request, res: Response) => {
    const sessionToken = getSessionToken(req);
    if (!sessionToken || !isValidSession(sessionToken)) {
      return res.redirect("/admin");
    }
    const templatePath = path.resolve(process.cwd(), "server", "templates", "admin-reports.html");
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  app.get("/admin/settings", (req: Request, res: Response) => {
    const sessionToken = getSessionToken(req);
    if (!sessionToken || !isValidSession(sessionToken)) {
      return res.redirect("/admin");
    }
    const templatePath = path.resolve(process.cwd(), "server", "templates", "admin-settings.html");
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  // Jurisdiction Management Pages
  app.get("/admin/jurisdiction", (req: Request, res: Response) => {
    const sessionToken = getSessionToken(req);
    if (!sessionToken || !isValidSession(sessionToken)) {
      return res.redirect("/admin");
    }
    const templatePath = path.resolve(process.cwd(), "server", "templates", "admin-jurisdiction.html");
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  app.get("/admin/jurisdiction/levels", (req: Request, res: Response) => {
    const sessionToken = getSessionToken(req);
    if (!sessionToken || !isValidSession(sessionToken)) {
      return res.redirect("/admin");
    }
    const templatePath = path.resolve(process.cwd(), "server", "templates", "admin-jurisdiction-levels.html");
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  app.get("/admin/jurisdiction/units", (req: Request, res: Response) => {
    const sessionToken = getSessionToken(req);
    if (!sessionToken || !isValidSession(sessionToken)) {
      return res.redirect("/admin");
    }
    const templatePath = path.resolve(process.cwd(), "server", "templates", "admin-jurisdiction-units.html");
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  app.get("/admin/jurisdiction/assignments", (req: Request, res: Response) => {
    const sessionToken = getSessionToken(req);
    if (!sessionToken || !isValidSession(sessionToken)) {
      return res.redirect("/admin");
    }
    const templatePath = path.resolve(process.cwd(), "server", "templates", "admin-jurisdiction-assignments.html");
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  app.get("/admin/jurisdiction/roles", (req: Request, res: Response) => {
    const sessionToken = getSessionToken(req);
    if (!sessionToken || !isValidSession(sessionToken)) {
      return res.redirect("/admin");
    }
    const templatePath = path.resolve(process.cwd(), "server", "templates", "admin-jurisdiction-roles.html");
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  app.post("/api/admin/login", (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const token = generateSessionToken();
      const expires = Date.now() + 24 * 60 * 60 * 1000;
      adminSessions.set(token, { expires });
      res.cookie("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax",
      });
      return res.json({ success: true, message: "Login successful" });
    }
    return res.status(401).json({ success: false, message: "Invalid username or password" });
  });

  app.post("/api/admin/logout", (req: Request, res: Response) => {
    const sessionToken = getSessionToken(req);
    if (sessionToken) {
      adminSessions.delete(sessionToken);
    }
    res.clearCookie("admin_session");
    return res.json({ success: true });
  });

  app.get("/api/admin/check", (req: Request, res: Response) => {
    const sessionToken = getSessionToken(req);
    if (sessionToken && isValidSession(sessionToken)) {
      return res.json({ authenticated: true });
    }
    return res.status(401).json({ authenticated: false });
  });

  // Officer Mobile App Login API
  app.post("/api/officer/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ success: false, error: "Email and password are required" });
      }

      const [officer] = await db.select().from(officers).where(sql`${officers.email} = ${email}`);
      
      if (!officer) {
        return res.status(401).json({ success: false, error: "Invalid email or password" });
      }

      if (officer.status !== 'active') {
        return res.status(401).json({ success: false, error: "Your account is inactive. Contact administrator." });
      }

      if (!officer.password) {
        return res.status(401).json({ success: false, error: "Password not set. Contact administrator." });
      }

      if (officer.password !== password) {
        return res.status(401).json({ success: false, error: "Invalid email or password" });
      }

      // Get all active assignments for the officer
      const assignments = await db.select().from(officerAssignments).where(
        sql`${officerAssignments.officerId} = ${officer.id} AND ${officerAssignments.status} = 'active'`
      );
      
      // Build full jurisdiction info for each assignment
      const allJurisdictions = [];
      for (const assignment of assignments) {
        const [unit] = await db.select().from(jurisdictionUnits).where(
          sql`${jurisdictionUnits.id} = ${assignment.jurisdictionId}`
        );
        const [role] = await db.select().from(officerRoles).where(
          sql`${officerRoles.id} = ${assignment.roleId}`
        );
        const [capacity] = await db.select().from(officerCapacities).where(
          sql`${officerCapacities.id} = ${assignment.capacityId}`
        );
        allJurisdictions.push({
          assignmentId: assignment.id,
          unitId: unit?.id,
          unitName: unit?.name,
          roleName: role?.name,
          capacityName: capacity?.name,
          isPrimary: assignment.isPrimary,
        });
      }
      
      // Set primary jurisdiction as default active
      const primaryAssignment = allJurisdictions.find((a: any) => a.isPrimary) || allJurisdictions[0];

      // Return officer data (without password)
      const { password: _, ...officerData } = officer;
      
      return res.json({
        success: true,
        officer: {
          ...officerData,
          jurisdiction: primaryAssignment || null,
          allJurisdictions: allJurisdictions,
        },
      });
    } catch (error) {
      console.error("Officer login error:", error);
      return res.status(500).json({ success: false, error: "Login failed. Please try again." });
    }
  });

  app.get("/api/admin/stats", async (_req: Request, res: Response) => {
    try {
      const [officerCount] = await db.select({ count: count() }).from(officers).where(sql`${officers.status} = 'active'`);
      const [inspectionCount] = await db.select({ count: count() }).from(inspections);
      const [sampleCount] = await db.select({ count: count() }).from(samples).where(sql`${samples.status} = 'dispatched'`);
      const [prosecutionCount] = await db.select({ count: count() }).from(inspections).where(sql`${inspections.actionsTaken}::text LIKE '%Prosecution%'`);
      
      res.json({
        activeOfficers: officerCount?.count || 0,
        totalInspections: inspectionCount?.count || 0,
        samplesInTransit: sampleCount?.count || 0,
        pendingProsecutions: prosecutionCount?.count || 0,
      });
    } catch (error) {
      res.json({
        activeOfficers: 0,
        totalInspections: 0,
        samplesInTransit: 0,
        pendingProsecutions: 0,
      });
    }
  });

  app.get("/api/admin/officers", async (_req: Request, res: Response) => {
    try {
      const allOfficers = await db.select().from(officers).orderBy(desc(officers.createdAt));
      res.json(allOfficers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch officers" });
    }
  });

  app.post("/api/admin/officers", async (req: Request, res: Response) => {
    try {
      const { name, email, phone, role, designation, districtId, status, password, dateOfJoining, employeeId, showAdminPanel } = req.body;
      const [newOfficer] = await db.insert(officers).values({
        name,
        email,
        phone,
        role: role || "fso",
        designation,
        districtId,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : null,
        employeeId: employeeId || null,
        status: status || "active",
        password: password || null,
        showAdminPanel: showAdminPanel || false,
      }).returning();
      res.json(newOfficer);
    } catch (error: any) {
      if (error.code === "23505") {
        res.status(400).json({ error: "Email already exists" });
      } else {
        res.status(500).json({ error: "Failed to create officer" });
      }
    }
  });

  app.put("/api/admin/officers/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, email, phone, role, designation, districtId, status, password, dateOfJoining, employeeId, showAdminPanel } = req.body;
      const updateData: any = { 
        name, 
        email, 
        phone, 
        role, 
        designation, 
        districtId, 
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : null,
        employeeId: employeeId || null,
        status, 
        showAdminPanel: showAdminPanel || false,
        updatedAt: new Date() 
      };
      if (password) {
        updateData.password = password;
      }
      const [updated] = await db.update(officers)
        .set(updateData)
        .where(sql`${officers.id} = ${id}`)
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update officer" });
    }
  });

  app.delete("/api/admin/officers/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(officers).where(sql`${officers.id} = ${id}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete officer" });
    }
  });

  app.get("/api/admin/districts", async (_req: Request, res: Response) => {
    try {
      const allDistricts = await db.select().from(districts).orderBy(desc(districts.createdAt));
      res.json(allDistricts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch districts" });
    }
  });

  app.post("/api/admin/districts", async (req: Request, res: Response) => {
    try {
      const { name, state, zone, headquarters, status } = req.body;
      const [newDistrict] = await db.insert(districts).values({
        name,
        state,
        zone,
        headquarters,
        status: status || "active",
      }).returning();
      res.json(newDistrict);
    } catch (error: any) {
      if (error.code === "23505") {
        res.status(400).json({ error: "District name already exists" });
      } else {
        res.status(500).json({ error: "Failed to create district" });
      }
    }
  });

  app.put("/api/admin/districts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, state, zone, headquarters, status } = req.body;
      const [updated] = await db.update(districts)
        .set({ name, state, zone, headquarters, status, updatedAt: new Date() })
        .where(sql`${districts.id} = ${id}`)
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update district" });
    }
  });

  app.delete("/api/admin/districts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(districts).where(sql`${districts.id} = ${id}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete district" });
    }
  });

  app.get("/api/admin/reports", async (_req: Request, res: Response) => {
    try {
      const allInspections = await db.select().from(inspections).orderBy(desc(inspections.createdAt));
      const allSamples = await db.select().from(samples).orderBy(desc(samples.createdAt));
      
      const inspectionsByStatus = await db.select({
        status: inspections.status,
        count: count(),
      }).from(inspections).groupBy(inspections.status);

      const inspectionsByType = await db.select({
        type: inspections.type,
        count: count(),
      }).from(inspections).groupBy(inspections.type);

      const samplesByStatus = await db.select({
        status: samples.status,
        count: count(),
      }).from(samples).groupBy(samples.status);

      const samplesByResult = await db.select({
        result: samples.labResult,
        count: count(),
      }).from(samples).where(sql`${samples.labResult} IS NOT NULL`).groupBy(samples.labResult);

      res.json({
        inspections: allInspections,
        samples: allSamples,
        charts: {
          inspectionsByStatus,
          inspectionsByType,
          samplesByStatus,
          samplesByResult,
        },
      });
    } catch (error) {
      res.json({
        inspections: [],
        samples: [],
        charts: {
          inspectionsByStatus: [],
          inspectionsByType: [],
          samplesByStatus: [],
          samplesByResult: [],
        },
      });
    }
  });

  app.get("/api/admin/settings", async (_req: Request, res: Response) => {
    try {
      const allSettings = await db.select().from(systemSettings);
      res.json(allSettings);
    } catch (error) {
      res.json([]);
    }
  });

  app.post("/api/admin/settings", async (req: Request, res: Response) => {
    try {
      const { key, value, description, category } = req.body;
      const existing = await db.select().from(systemSettings).where(sql`${systemSettings.key} = ${key}`);
      
      if (existing.length > 0) {
        const [updated] = await db.update(systemSettings)
          .set({ value, description, category, updatedAt: new Date() })
          .where(sql`${systemSettings.key} = ${key}`)
          .returning();
        res.json(updated);
      } else {
        const [newSetting] = await db.insert(systemSettings).values({
          key,
          value,
          description,
          category: category || "general",
        }).returning();
        res.json(newSetting);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to save setting" });
    }
  });

  app.delete("/api/admin/settings/:key", async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      await db.delete(systemSettings).where(sql`${systemSettings.key} = ${key}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete setting" });
    }
  });

  // ========== JURISDICTION MANAGEMENT API ROUTES ==========

  // Administrative Levels CRUD
  app.get("/api/admin/levels", async (_req: Request, res: Response) => {
    try {
      const levels = await db.select().from(administrativeLevels).orderBy(asc(administrativeLevels.displayOrder));
      res.json(levels);
    } catch (error) {
      res.json([]);
    }
  });

  app.post("/api/admin/levels", async (req: Request, res: Response) => {
    try {
      const { levelNumber, levelName, displayOrder, status } = req.body;
      const [newLevel] = await db.insert(administrativeLevels).values({
        levelNumber,
        levelName,
        displayOrder,
        status: status || "active",
      }).returning();
      res.json(newLevel);
    } catch (error) {
      res.status(500).json({ error: "Failed to create level" });
    }
  });

  app.put("/api/admin/levels/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { levelNumber, levelName, displayOrder, status } = req.body;
      const [updated] = await db.update(administrativeLevels)
        .set({ levelNumber, levelName, displayOrder, status, updatedAt: new Date() })
        .where(sql`${administrativeLevels.id} = ${id}`)
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update level" });
    }
  });

  app.delete("/api/admin/levels/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(administrativeLevels).where(sql`${administrativeLevels.id} = ${id}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete level" });
    }
  });

  // Jurisdiction Units CRUD
  app.get("/api/admin/units", async (_req: Request, res: Response) => {
    try {
      const units = await db.select().from(jurisdictionUnits).orderBy(asc(jurisdictionUnits.name));
      res.json(units);
    } catch (error) {
      res.json([]);
    }
  });

  app.post("/api/admin/units", async (req: Request, res: Response) => {
    try {
      const { name, code, levelId, parentId, status } = req.body;
      const [newUnit] = await db.insert(jurisdictionUnits).values({
        name,
        code,
        levelId,
        parentId: parentId || null,
        status: status || "active",
      }).returning();
      res.json(newUnit);
    } catch (error) {
      res.status(500).json({ error: "Failed to create unit" });
    }
  });

  app.put("/api/admin/units/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, code, levelId, parentId, status } = req.body;
      const [updated] = await db.update(jurisdictionUnits)
        .set({ name, code, levelId, parentId: parentId || null, status, updatedAt: new Date() })
        .where(sql`${jurisdictionUnits.id} = ${id}`)
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update unit" });
    }
  });

  app.delete("/api/admin/units/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(jurisdictionUnits).where(sql`${jurisdictionUnits.id} = ${id}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete unit" });
    }
  });

  // Officer Roles CRUD
  app.get("/api/admin/roles", async (_req: Request, res: Response) => {
    try {
      const roles = await db.select().from(officerRoles).orderBy(asc(officerRoles.displayOrder));
      res.json(roles);
    } catch (error) {
      res.json([]);
    }
  });

  app.post("/api/admin/roles", async (req: Request, res: Response) => {
    try {
      const { name, description, displayOrder, status } = req.body;
      const [newRole] = await db.insert(officerRoles).values({
        name,
        description,
        displayOrder: displayOrder || 0,
        status: status || "active",
      }).returning();
      res.json(newRole);
    } catch (error: any) {
      if (error.code === "23505") {
        res.status(400).json({ error: "Role name already exists" });
      } else {
        res.status(500).json({ error: "Failed to create role" });
      }
    }
  });

  app.put("/api/admin/roles/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, displayOrder, status } = req.body;
      const [updated] = await db.update(officerRoles)
        .set({ name, description, displayOrder, status, updatedAt: new Date() })
        .where(sql`${officerRoles.id} = ${id}`)
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  app.delete("/api/admin/roles/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(officerRoles).where(sql`${officerRoles.id} = ${id}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete role" });
    }
  });

  // Officer Capacities CRUD
  app.get("/api/admin/capacities", async (_req: Request, res: Response) => {
    try {
      const capacities = await db.select().from(officerCapacities).orderBy(asc(officerCapacities.displayOrder));
      res.json(capacities);
    } catch (error) {
      res.json([]);
    }
  });

  app.post("/api/admin/capacities", async (req: Request, res: Response) => {
    try {
      const { name, description, displayOrder, status } = req.body;
      const [newCapacity] = await db.insert(officerCapacities).values({
        name,
        description,
        displayOrder: displayOrder || 0,
        status: status || "active",
      }).returning();
      res.json(newCapacity);
    } catch (error: any) {
      if (error.code === "23505") {
        res.status(400).json({ error: "Capacity name already exists" });
      } else {
        res.status(500).json({ error: "Failed to create capacity" });
      }
    }
  });

  app.put("/api/admin/capacities/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, displayOrder, status } = req.body;
      const [updated] = await db.update(officerCapacities)
        .set({ name, description, displayOrder, status, updatedAt: new Date() })
        .where(sql`${officerCapacities.id} = ${id}`)
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update capacity" });
    }
  });

  app.delete("/api/admin/capacities/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(officerCapacities).where(sql`${officerCapacities.id} = ${id}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete capacity" });
    }
  });

  // Officer Assignments CRUD
  app.get("/api/admin/assignments", async (_req: Request, res: Response) => {
    try {
      const assignments = await db.select().from(officerAssignments).orderBy(desc(officerAssignments.createdAt));
      res.json(assignments);
    } catch (error) {
      res.json([]);
    }
  });

  app.post("/api/admin/assignments", async (req: Request, res: Response) => {
    try {
      const { officerId, jurisdictionId, roleId, capacityId, startDate, endDate, isPrimary, status } = req.body;
      const [newAssignment] = await db.insert(officerAssignments).values({
        officerId,
        jurisdictionId,
        roleId,
        capacityId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isPrimary: isPrimary || false,
        status: status || "active",
      }).returning();
      res.json(newAssignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create assignment" });
    }
  });

  app.put("/api/admin/assignments/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { officerId, jurisdictionId, roleId, capacityId, startDate, endDate, isPrimary, status } = req.body;
      const [updated] = await db.update(officerAssignments)
        .set({
          officerId,
          jurisdictionId,
          roleId,
          capacityId,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          isPrimary: isPrimary || false,
          status,
          updatedAt: new Date(),
        })
        .where(sql`${officerAssignments.id} = ${id}`)
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update assignment" });
    }
  });

  app.delete("/api/admin/assignments/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(officerAssignments).where(sql`${officerAssignments.id} = ${id}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete assignment" });
    }
  });

  // Get jurisdiction hierarchy tree
  app.get("/api/admin/jurisdiction-tree", async (_req: Request, res: Response) => {
    try {
      const levels = await db.select().from(administrativeLevels).orderBy(asc(administrativeLevels.displayOrder));
      const units = await db.select().from(jurisdictionUnits);
      res.json({ levels, units });
    } catch (error) {
      res.json({ levels: [], units: [] });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
