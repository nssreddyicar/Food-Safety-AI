import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import * as fs from "fs";
import * as path from "path";
import { db } from "./db";
import { officers, districts, inspections, samples, systemSettings, administrativeLevels, jurisdictionUnits, officerRoles, officerCapacities, officerAssignments, documentTemplates, workflowNodes, workflowTransitions, sampleWorkflowState, sampleCodes, sampleCodeAuditLog, fboLicenses, fboRegistrations, grievances, fswActivities, adjudicationCases, prosecutionCases, prosecutionHearings, actionCategories, actionItems, actionItemAuditLog, slASettings, specialDrives, vvipDuties, workshops, improvementNotices, seizedArticles, statisticsCards, dashboardSettings, reportSections } from "../shared/schema";
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

  app.post("/api/admin/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    // Check super admin credentials first
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
    
    // Check if it's an officer with admin panel access
    try {
      const [officer] = await db.select().from(officers)
        .where(sql`${officers.email} = ${username} AND ${officers.status} = 'active'`);
      
      if (officer && officer.password === password && officer.showAdminPanel) {
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
    } catch (error) {
      console.error("Officer admin login check failed:", error);
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

  // Public API to get workflow settings for mobile app
  app.get("/api/workflow/settings", async (_req: Request, res: Response) => {
    try {
      const workflowSettings = await db.select().from(systemSettings)
        .where(sql`${systemSettings.category} = 'workflow'`);
      
      // Convert to key-value object with defaults
      const settingsObj: Record<string, any> = {
        nodeEditHours: 48,
        allowNodeEdit: true,
      };
      
      workflowSettings.forEach(s => {
        if (s.key === 'workflow_node_edit_hours') {
          settingsObj.nodeEditHours = parseInt(s.value || '48', 10);
        } else if (s.key === 'workflow_allow_node_edit') {
          settingsObj.allowNodeEdit = s.value === 'true';
        }
      });
      
      res.json(settingsObj);
    } catch (error) {
      // Return defaults on error
      res.json({ nodeEditHours: 48, allowNodeEdit: true });
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

  // Document Templates Admin Page
  app.get("/admin/templates", (req: Request, res: Response) => {
    const sessionToken = getSessionToken(req);
    if (!sessionToken || !isValidSession(sessionToken)) {
      return res.redirect("/admin");
    }
    const templatePath = path.resolve(process.cwd(), "server", "templates", "admin-templates.html");
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  // Action Dashboard Admin Page
  app.get("/admin/action-dashboard", (req: Request, res: Response) => {
    const sessionToken = getSessionToken(req);
    if (!sessionToken || !isValidSession(sessionToken)) {
      return res.redirect("/admin");
    }
    const templatePath = path.resolve(process.cwd(), "server", "templates", "admin-action-dashboard.html");
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  // Sample Workflow Admin Page
  app.get("/admin/workflow", (req: Request, res: Response) => {
    const sessionToken = getSessionToken(req);
    if (!sessionToken || !isValidSession(sessionToken)) {
      return res.redirect("/admin");
    }
    const templatePath = path.resolve(process.cwd(), "server", "templates", "admin-workflow.html");
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  // Document Templates API
  app.get("/api/admin/templates", async (_req: Request, res: Response) => {
    try {
      const allTemplates = await db.select().from(documentTemplates).orderBy(desc(documentTemplates.createdAt));
      res.json(allTemplates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates", async (_req: Request, res: Response) => {
    try {
      const activeTemplates = await db.select().from(documentTemplates)
        .where(sql`${documentTemplates.status} = 'active'`)
        .orderBy(asc(documentTemplates.name));
      res.json(activeTemplates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Dynamic Placeholders API - returns all available placeholders including workflow node fields
  app.get("/api/placeholders", async (_req: Request, res: Response) => {
    try {
      // Static placeholders organized by category
      const staticPlaceholders = {
        officer: [
          { key: 'officer_name', description: 'Officer full name', example: 'John Smith' },
          { key: 'officer_designation', description: 'Officer designation/title', example: 'Food Safety Officer' },
          { key: 'officer_email', description: 'Officer email address', example: 'john@example.com' },
          { key: 'officer_phone', description: 'Officer phone number', example: '+91 9876543210' },
          { key: 'officer_employee_id', description: 'Officer employee ID', example: 'FSO-2024-001' },
        ],
        jurisdiction: [
          { key: 'jurisdiction_name', description: 'Unit/jurisdiction name', example: 'Hyderabad District' },
          { key: 'jurisdiction_type', description: 'Jurisdiction type/role', example: 'District' },
        ],
        datetime: [
          { key: 'current_date', description: 'Current date (full format)', example: '18 January 2026' },
          { key: 'current_time', description: 'Current time', example: '10:30 AM' },
        ],
        fbo: [
          { key: 'fbo_name', description: 'Food Business Operator name', example: 'ABC Foods Pvt Ltd' },
          { key: 'fbo_address', description: 'FBO registered address', example: '123 Main Street, City' },
          { key: 'fbo_license', description: 'FSSAI license number', example: '10012345678901' },
          { key: 'establishment_name', description: 'Establishment/shop name', example: 'Fresh Bakery' },
        ],
        inspection: [
          { key: 'inspection_date', description: 'Date of inspection', example: '15 January 2026' },
          { key: 'inspection_type', description: 'Type of inspection', example: 'Routine' },
        ],
        sample: [
          { key: 'sample_code', description: 'Unique sample code', example: 'SMP-2026-001' },
          { key: 'sample_name', description: 'Name of sample collected', example: 'Milk Powder' },
          { key: 'sample_type', description: 'Enforcement/Surveillance', example: 'Enforcement' },
          { key: 'sample_lifted_date', description: 'Date sample was collected (full)', example: '15 January 2026' },
          { key: 'sample_lifted_date_short', description: 'Date sample was collected (DD-MM-YYYY)', example: '15-01-2026' },
          { key: 'sample_lifted_place', description: 'Place of sample collection', example: 'ABC Store, Main Road' },
          { key: 'sample_cost', description: 'Sample cost with currency', example: 'Rs. 500' },
          { key: 'sample_quantity', description: 'Sample quantity in grams', example: '500 grams' },
          { key: 'sample_packing_type', description: 'PACKED or LOOSE', example: 'PACKED' },
          { key: 'sample_preservative', description: 'Preservative type or NIL', example: 'Formalin' },
          { key: 'sample_dispatch_date', description: 'Date dispatched to lab', example: '16 January 2026' },
          { key: 'sample_dispatch_mode', description: 'Mode of dispatch', example: 'Courier' },
        ],
        manufacturer: [
          { key: 'manufacturer_name', description: 'Manufacturer name', example: 'XYZ Foods Industries' },
          { key: 'manufacturer_address', description: 'Manufacturer address', example: '456 Industrial Area' },
          { key: 'manufacturer_license', description: 'Manufacturer FSSAI license', example: '20012345678901' },
          { key: 'mfg_date', description: 'Manufacturing date', example: '01-12-2025' },
          { key: 'expiry_date', description: 'Expiry/use-by date', example: '01-12-2026' },
          { key: 'lot_batch_number', description: 'Lot or batch number', example: 'BATCH-2025-001' },
        ],
        lab: [
          { key: 'lab_report_date', description: 'Date lab report received', example: '25 January 2026' },
          { key: 'lab_result', description: 'Lab result (SAFE/UNSAFE/SUBSTANDARD)', example: 'SAFE' },
        ],
      };

      // Fetch workflow nodes to get dynamic input fields
      const nodes = await db.select().from(workflowNodes).where(sql`${workflowNodes.status} = 'active'`);
      
      const workflowPlaceholders: Array<{ key: string; description: string; example: string; nodeName: string }> = [];
      
      for (const node of nodes) {
        if (node.inputFields && Array.isArray(node.inputFields)) {
          for (const field of node.inputFields as any[]) {
            if (field.name && field.label) {
              // Convert field name to placeholder key format
              const placeholderKey = `workflow_${node.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${field.name}`;
              workflowPlaceholders.push({
                key: placeholderKey,
                description: `${field.label} (from ${node.name})`,
                example: field.type === 'date' ? '15-01-2026' : field.type === 'select' ? (field.options?.[0] || 'Option') : `[${field.label}]`,
                nodeName: node.name,
              });
            }
          }
        }
      }

      res.json({
        static: staticPlaceholders,
        workflow: workflowPlaceholders,
        usage: 'Use {{placeholder_key}} syntax in template content',
      });
    } catch (error) {
      console.error('Error fetching placeholders:', error);
      res.status(500).json({ error: "Failed to fetch placeholders" });
    }
  });

  app.get("/api/templates/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [template] = await db.select().from(documentTemplates).where(sql`${documentTemplates.id} = ${id}`);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.post("/api/admin/templates", async (req: Request, res: Response) => {
    try {
      const { name, description, category, content, placeholders, pageSize, orientation, marginTop, marginBottom, marginLeft, marginRight, fontFamily, fontSize, showPageNumbers, pageNumberFormat, pageNumberPosition, pageNumberOffset, showContinuationText, continuationFormat, showHeader, showFooter, headerText, footerText, headerAlignment, footerAlignment, status } = req.body;
      const [newTemplate] = await db.insert(documentTemplates).values({
        name,
        description,
        category: category || "general",
        content,
        placeholders: placeholders || [],
        pageSize: pageSize || "A4",
        orientation: orientation || "portrait",
        marginTop: marginTop || 20,
        marginBottom: marginBottom || 20,
        marginLeft: marginLeft || 20,
        marginRight: marginRight || 20,
        fontFamily: fontFamily || "Times New Roman",
        fontSize: fontSize || 12,
        showPageNumbers: showPageNumbers !== false,
        pageNumberFormat: pageNumberFormat || "page_x_of_y",
        pageNumberPosition: pageNumberPosition || "center",
        pageNumberOffset: pageNumberOffset || 0,
        showContinuationText: showContinuationText || false,
        continuationFormat: continuationFormat || "contd_on_page",
        showHeader: showHeader !== false,
        showFooter: showFooter !== false,
        headerText,
        footerText,
        headerAlignment: headerAlignment || "center",
        footerAlignment: footerAlignment || "center",
        status: status || "active",
      }).returning();
      res.json(newTemplate);
    } catch (error) {
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  app.put("/api/admin/templates/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, category, content, placeholders, pageSize, orientation, marginTop, marginBottom, marginLeft, marginRight, fontFamily, fontSize, showPageNumbers, pageNumberFormat, pageNumberPosition, pageNumberOffset, showContinuationText, continuationFormat, showHeader, showFooter, headerText, footerText, headerAlignment, footerAlignment, status } = req.body;
      const [updated] = await db.update(documentTemplates)
        .set({
          name,
          description,
          category,
          content,
          placeholders,
          pageSize,
          orientation,
          marginTop,
          marginBottom,
          marginLeft,
          marginRight,
          fontFamily,
          fontSize,
          showPageNumbers,
          pageNumberFormat,
          pageNumberPosition,
          pageNumberOffset,
          showContinuationText,
          continuationFormat,
          showHeader,
          showFooter,
          headerText,
          footerText,
          headerAlignment,
          footerAlignment,
          status,
          updatedAt: new Date(),
        })
        .where(sql`${documentTemplates.id} = ${id}`)
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  app.delete("/api/admin/templates/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(documentTemplates).where(sql`${documentTemplates.id} = ${id}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  // ==================== WORKFLOW NODES API ====================
  
  app.get("/api/admin/workflow/nodes", async (_req: Request, res: Response) => {
    try {
      const nodes = await db.select().from(workflowNodes).orderBy(asc(workflowNodes.position));
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow nodes" });
    }
  });

  app.get("/api/workflow/nodes", async (_req: Request, res: Response) => {
    try {
      const nodes = await db.select().from(workflowNodes)
        .where(sql`${workflowNodes.status} = 'active'`)
        .orderBy(asc(workflowNodes.position));
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow nodes" });
    }
  });

  app.post("/api/admin/workflow/nodes", async (req: Request, res: Response) => {
    try {
      const { name, description, position, nodeType, icon, color, inputFields, templateIds, isStartNode, isEndNode, autoAdvanceCondition, status } = req.body;
      const [newNode] = await db.insert(workflowNodes).values({
        name,
        description,
        position: position || 0,
        nodeType: nodeType || "action",
        icon: icon || "circle",
        color: color || "#1E40AF",
        inputFields: inputFields || [],
        templateIds: templateIds || [],
        isStartNode: isStartNode || false,
        isEndNode: isEndNode || false,
        autoAdvanceCondition,
        status: status || "active",
      }).returning();
      res.json(newNode);
    } catch (error) {
      res.status(500).json({ error: "Failed to create workflow node" });
    }
  });

  app.put("/api/admin/workflow/nodes/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, position, nodeType, icon, color, inputFields, templateIds, isStartNode, isEndNode, autoAdvanceCondition, status } = req.body;
      const [updated] = await db.update(workflowNodes)
        .set({
          name,
          description,
          position,
          nodeType,
          icon,
          color,
          inputFields,
          templateIds,
          isStartNode,
          isEndNode,
          autoAdvanceCondition,
          status,
          updatedAt: new Date(),
        })
        .where(sql`${workflowNodes.id} = ${id}`)
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update workflow node" });
    }
  });

  app.delete("/api/admin/workflow/nodes/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(workflowTransitions).where(
        sql`${workflowTransitions.fromNodeId} = ${id} OR ${workflowTransitions.toNodeId} = ${id}`
      );
      await db.delete(workflowNodes).where(sql`${workflowNodes.id} = ${id}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete workflow node" });
    }
  });

  // ==================== WORKFLOW TRANSITIONS API ====================
  
  app.get("/api/admin/workflow/transitions", async (_req: Request, res: Response) => {
    try {
      const transitions = await db.select().from(workflowTransitions).orderBy(asc(workflowTransitions.displayOrder));
      res.json(transitions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow transitions" });
    }
  });

  app.get("/api/workflow/transitions", async (_req: Request, res: Response) => {
    try {
      const transitions = await db.select().from(workflowTransitions)
        .where(sql`${workflowTransitions.status} = 'active'`)
        .orderBy(asc(workflowTransitions.displayOrder));
      res.json(transitions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow transitions" });
    }
  });

  app.post("/api/admin/workflow/transitions", async (req: Request, res: Response) => {
    try {
      const { fromNodeId, toNodeId, conditionType, conditionField, conditionOperator, conditionValue, label, displayOrder, status } = req.body;
      const [newTransition] = await db.insert(workflowTransitions).values({
        fromNodeId,
        toNodeId,
        conditionType: conditionType || "always",
        conditionField,
        conditionOperator,
        conditionValue,
        label,
        displayOrder: displayOrder || 0,
        status: status || "active",
      }).returning();
      res.json(newTransition);
    } catch (error) {
      res.status(500).json({ error: "Failed to create workflow transition" });
    }
  });

  app.put("/api/admin/workflow/transitions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { fromNodeId, toNodeId, conditionType, conditionField, conditionOperator, conditionValue, label, displayOrder, status } = req.body;
      const [updated] = await db.update(workflowTransitions)
        .set({
          fromNodeId,
          toNodeId,
          conditionType,
          conditionField,
          conditionOperator,
          conditionValue,
          label,
          displayOrder,
          status,
          updatedAt: new Date(),
        })
        .where(sql`${workflowTransitions.id} = ${id}`)
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update workflow transition" });
    }
  });

  app.delete("/api/admin/workflow/transitions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(workflowTransitions).where(sql`${workflowTransitions.id} = ${id}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete workflow transition" });
    }
  });

  // Get complete workflow configuration (nodes + transitions)
  app.get("/api/workflow/config", async (_req: Request, res: Response) => {
    try {
      const nodes = await db.select().from(workflowNodes)
        .where(sql`${workflowNodes.status} = 'active'`)
        .orderBy(asc(workflowNodes.position));
      const transitions = await db.select().from(workflowTransitions)
        .where(sql`${workflowTransitions.status} = 'active'`)
        .orderBy(asc(workflowTransitions.displayOrder));
      res.json({ nodes, transitions });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow configuration" });
    }
  });

  // Sample Workflow State APIs - For officers to update sample progress
  app.get("/api/samples/:sampleId/workflow-state", async (req: Request, res: Response) => {
    try {
      const { sampleId } = req.params;
      const states = await db.select().from(sampleWorkflowState)
        .where(sql`${sampleWorkflowState.sampleId} = ${sampleId}`)
        .orderBy(asc(sampleWorkflowState.enteredAt));
      res.json(states);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sample workflow state" });
    }
  });

  app.post("/api/samples/:sampleId/workflow-state", async (req: Request, res: Response) => {
    try {
      const { sampleId } = req.params;
      const { nodeId, nodeData } = req.body;
      
      // Check if this node is a decision node (like Lab Report Received)
      // and sync relevant data to the sample record
      const [node] = await db.select().from(workflowNodes)
        .where(sql`${workflowNodes.id} = ${nodeId}`);
      
      if (node?.nodeType === 'decision' && nodeData) {
        // Sync labResult if present in nodeData
        const sampleUpdates: Record<string, any> = {};
        if (nodeData.labResult) {
          sampleUpdates.labResult = nodeData.labResult;
        }
        if (nodeData.labReportDate) {
          // Parse date string (DD-MM-YYYY) to Date object
          const dateParts = nodeData.labReportDate.split('-');
          if (dateParts.length === 3) {
            const parsedDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
            if (!isNaN(parsedDate.getTime())) {
              sampleUpdates.labReportDate = parsedDate;
            }
          }
        }
        
        if (Object.keys(sampleUpdates).length > 0) {
          try {
            await db.update(samples)
              .set(sampleUpdates)
              .where(sql`${samples.id} = ${sampleId}`);
          } catch (syncError) {
            // Sample might not exist in database (stored in AsyncStorage), continue anyway
            console.log('Sample sync skipped (sample may not exist in DB):', syncError);
          }
        }
      }
      
      // Check if there's already an entry for this node
      const [existing] = await db.select().from(sampleWorkflowState)
        .where(sql`${sampleWorkflowState.sampleId} = ${sampleId} AND ${sampleWorkflowState.currentNodeId} = ${nodeId}`);
      
      if (existing) {
        // Update existing entry
        const [updated] = await db.update(sampleWorkflowState)
          .set({
            nodeData: nodeData,
            completedAt: new Date(),
            status: 'completed',
          })
          .where(sql`${sampleWorkflowState.id} = ${existing.id}`)
          .returning();
        return res.json(updated);
      }
      
      // Create new entry
      const [created] = await db.insert(sampleWorkflowState)
        .values({
          sampleId,
          currentNodeId: nodeId,
          nodeData: nodeData,
          enteredAt: new Date(),
          completedAt: new Date(),
          status: 'completed',
        })
        .returning();
      res.json(created);
    } catch (error) {
      console.error('Error saving workflow state:', error);
      res.status(500).json({ error: "Failed to save sample workflow state" });
    }
  });

  app.put("/api/samples/:sampleId/workflow-state/:stateId", async (req: Request, res: Response) => {
    try {
      const { stateId } = req.params;
      const { nodeData, status } = req.body;
      
      const [updated] = await db.update(sampleWorkflowState)
        .set({
          nodeData: nodeData,
          status: status || 'completed',
          completedAt: new Date(),
        })
        .where(sql`${sampleWorkflowState.id} = ${stateId}`)
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update sample workflow state" });
    }
  });

  // ============ SAMPLE CODE BANK APIs ============

  // Get sample codes with optional filters
  app.get("/api/sample-codes", async (req: Request, res: Response) => {
    try {
      const { sampleType, status, jurisdictionId, prefix, middle, suffix, limit = '100', offset = '0' } = req.query;
      
      let query = db.select().from(sampleCodes);
      const conditions: any[] = [];
      
      if (sampleType) {
        conditions.push(sql`${sampleCodes.sampleType} = ${sampleType}`);
      }
      if (status) {
        conditions.push(sql`${sampleCodes.status} = ${status}`);
      }
      if (jurisdictionId) {
        conditions.push(sql`${sampleCodes.jurisdictionId} = ${jurisdictionId}`);
      }
      if (prefix) {
        conditions.push(sql`${sampleCodes.prefix} LIKE ${`%${prefix}%`}`);
      }
      if (middle) {
        conditions.push(sql`${sampleCodes.middle} LIKE ${`%${middle}%`}`);
      }
      if (suffix) {
        conditions.push(sql`${sampleCodes.suffix} LIKE ${`%${suffix}%`}`);
      }
      
      const whereClause = conditions.length > 0 
        ? sql.join(conditions, sql` AND `)
        : sql`1=1`;
      
      const codes = await db.select().from(sampleCodes)
        .where(whereClause)
        .orderBy(desc(sampleCodes.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      // Get counts
      const [availableCount] = await db.select({ count: count() }).from(sampleCodes)
        .where(sql`${sampleCodes.status} = 'available' AND ${conditions.length > 0 ? sql.join(conditions.filter(c => !c.queryChunks?.includes('status')), sql` AND `) : sql`1=1`}`);
      const [usedCount] = await db.select({ count: count() }).from(sampleCodes)
        .where(sql`${sampleCodes.status} = 'used' AND ${conditions.length > 0 ? sql.join(conditions.filter(c => !c.queryChunks?.includes('status')), sql` AND `) : sql`1=1`}`);
      
      res.json({
        codes,
        counts: {
          available: availableCount?.count || 0,
          used: usedCount?.count || 0,
        }
      });
    } catch (error) {
      console.error('Error fetching sample codes:', error);
      res.status(500).json({ error: "Failed to fetch sample codes" });
    }
  });

  // Helper function to increment text values (A -> B, Z -> AA, etc.)
  function incrementText(value: string, incrementBy: number): string {
    const chars = value.toUpperCase().split('');
    let carry = incrementBy;
    
    for (let i = chars.length - 1; i >= 0 && carry > 0; i--) {
      const charCode = chars[i].charCodeAt(0);
      if (charCode >= 65 && charCode <= 90) { // A-Z
        const newCode = charCode - 65 + carry;
        chars[i] = String.fromCharCode((newCode % 26) + 65);
        carry = Math.floor(newCode / 26);
      }
    }
    
    // If there's still carry, prepend new character(s)
    while (carry > 0) {
      chars.unshift(String.fromCharCode(((carry - 1) % 26) + 65));
      carry = Math.floor((carry - 1) / 26);
    }
    
    return chars.join('');
  }

  // Generate new sample codes
  app.post("/api/sample-codes/generate", async (req: Request, res: Response) => {
    try {
      const { 
        sampleType,
        prefixStart,
        middleStart,
        suffixStart,
        prefixFieldType = 'number',
        middleFieldType = 'number',
        suffixFieldType = 'number',
        prefixIncrement,
        middleIncrement,
        suffixIncrement,
        prefixIncrementEnabled,
        middleIncrementEnabled,
        suffixIncrementEnabled,
        quantity,
        officerId,
        officerName,
        jurisdictionId,
      } = req.body;

      if (!sampleType || !prefixStart || !middleStart || !suffixStart || !quantity) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const batchId = `batch_${Date.now()}`;
      const generatedCodes: any[] = [];
      const duplicates: string[] = [];

      // Initialize current values based on field type
      let currentPrefixNum = prefixFieldType === 'number' ? parseInt(prefixStart) || 0 : 0;
      let currentMiddleNum = middleFieldType === 'number' ? parseInt(middleStart) || 0 : 0;
      let currentSuffixNum = suffixFieldType === 'number' ? parseInt(suffixStart) || 0 : 0;
      let currentPrefixText = prefixFieldType === 'text' ? prefixStart : '';
      let currentMiddleText = middleFieldType === 'text' ? middleStart : '';
      let currentSuffixText = suffixFieldType === 'text' ? suffixStart : '';

      for (let i = 0; i < quantity; i++) {
        // Generate values based on field type
        const prefix = prefixFieldType === 'number' 
          ? String(currentPrefixNum).padStart(prefixStart.length, '0')
          : currentPrefixText;
        const middle = middleFieldType === 'number'
          ? String(currentMiddleNum).padStart(middleStart.length, '0')
          : currentMiddleText;
        const suffix = suffixFieldType === 'number'
          ? String(currentSuffixNum).padStart(suffixStart.length, '0')
          : currentSuffixText;
        const fullCode = `${prefix}-${middle}-${suffix}`;

        // Check for duplicates
        const [existing] = await db.select().from(sampleCodes)
          .where(sql`${sampleCodes.fullCode} = ${fullCode}`);

        if (existing) {
          duplicates.push(fullCode);
        } else {
          const [created] = await db.insert(sampleCodes)
            .values({
              prefix,
              middle,
              suffix,
              fullCode,
              sampleType,
              status: 'available',
              generatedByOfficerId: officerId,
              batchId,
              jurisdictionId,
            })
            .returning();
          
          generatedCodes.push(created);

          // Create audit log
          await db.insert(sampleCodeAuditLog)
            .values({
              sampleCodeId: created.id,
              action: 'generated',
              performedByOfficerId: officerId,
              performedByName: officerName,
              details: { batchId, sampleType },
            });
        }

        // Increment values based on field type
        if (prefixIncrementEnabled) {
          const inc = parseInt(prefixIncrement) || 1;
          if (prefixFieldType === 'number') {
            currentPrefixNum += inc;
          } else {
            currentPrefixText = incrementText(currentPrefixText, inc);
          }
        }
        if (middleIncrementEnabled) {
          const inc = parseInt(middleIncrement) || 1;
          if (middleFieldType === 'number') {
            currentMiddleNum += inc;
          } else {
            currentMiddleText = incrementText(currentMiddleText, inc);
          }
        }
        if (suffixIncrementEnabled) {
          const inc = parseInt(suffixIncrement) || 1;
          if (suffixFieldType === 'number') {
            currentSuffixNum += inc;
          } else {
            currentSuffixText = incrementText(currentSuffixText, inc);
          }
        }
      }

      res.json({
        success: true,
        generated: generatedCodes.length,
        duplicatesSkipped: duplicates.length,
        duplicates,
        batchId,
        codes: generatedCodes,
      });
    } catch (error) {
      console.error('Error generating sample codes:', error);
      res.status(500).json({ error: "Failed to generate sample codes" });
    }
  });

  // Get single sample code with audit trail
  app.get("/api/sample-codes/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [code] = await db.select().from(sampleCodes)
        .where(sql`${sampleCodes.id} = ${id}`);
      
      if (!code) {
        return res.status(404).json({ error: "Sample code not found" });
      }

      const auditLog = await db.select().from(sampleCodeAuditLog)
        .where(sql`${sampleCodeAuditLog.sampleCodeId} = ${id}`)
        .orderBy(desc(sampleCodeAuditLog.createdAt));

      res.json({ code, auditLog });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sample code" });
    }
  });

  // Mark sample code as used
  app.post("/api/sample-codes/:id/use", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { officerId, officerName, linkedSampleId, linkedSampleReference, usageLocation } = req.body;

      // Check if code exists and is available
      const [code] = await db.select().from(sampleCodes)
        .where(sql`${sampleCodes.id} = ${id}`);

      if (!code) {
        return res.status(404).json({ error: "Sample code not found" });
      }

      if (code.status === 'used') {
        return res.status(400).json({ error: "Sample code has already been used" });
      }

      // Update code status
      const [updated] = await db.update(sampleCodes)
        .set({
          status: 'used',
          usedByOfficerId: officerId,
          usedAt: new Date(),
          linkedSampleId,
          linkedSampleReference,
          usageLocation,
          updatedAt: new Date(),
        })
        .where(sql`${sampleCodes.id} = ${id}`)
        .returning();

      // Create audit log
      await db.insert(sampleCodeAuditLog)
        .values({
          sampleCodeId: id,
          action: 'used',
          performedByOfficerId: officerId,
          performedByName: officerName,
          details: { linkedSampleId, linkedSampleReference, usageLocation },
        });

      res.json(updated);
    } catch (error) {
      console.error('Error marking sample code as used:', error);
      res.status(500).json({ error: "Failed to mark sample code as used" });
    }
  });

  // Get available codes for a sample type (for picker)
  app.get("/api/sample-codes/available/:sampleType", async (req: Request, res: Response) => {
    try {
      const { sampleType } = req.params;
      const { jurisdictionId, limit = '50' } = req.query;
      
      let whereClause = sql`${sampleCodes.sampleType} = ${sampleType} AND ${sampleCodes.status} = 'available'`;
      
      if (jurisdictionId) {
        whereClause = sql`${whereClause} AND ${sampleCodes.jurisdictionId} = ${jurisdictionId}`;
      }
      
      const codes = await db.select().from(sampleCodes)
        .where(whereClause)
        .orderBy(asc(sampleCodes.fullCode))
        .limit(parseInt(limit as string));
      
      res.json(codes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch available sample codes" });
    }
  });

  // Get sample code statistics
  app.get("/api/sample-codes/stats/:jurisdictionId", async (req: Request, res: Response) => {
    try {
      const { jurisdictionId } = req.params;
      
      const [enforcementAvailable] = await db.select({ count: count() }).from(sampleCodes)
        .where(sql`${sampleCodes.jurisdictionId} = ${jurisdictionId} AND ${sampleCodes.sampleType} = 'enforcement' AND ${sampleCodes.status} = 'available'`);
      
      const [enforcementUsed] = await db.select({ count: count() }).from(sampleCodes)
        .where(sql`${sampleCodes.jurisdictionId} = ${jurisdictionId} AND ${sampleCodes.sampleType} = 'enforcement' AND ${sampleCodes.status} = 'used'`);
      
      const [surveillanceAvailable] = await db.select({ count: count() }).from(sampleCodes)
        .where(sql`${sampleCodes.jurisdictionId} = ${jurisdictionId} AND ${sampleCodes.sampleType} = 'surveillance' AND ${sampleCodes.status} = 'available'`);
      
      const [surveillanceUsed] = await db.select({ count: count() }).from(sampleCodes)
        .where(sql`${sampleCodes.jurisdictionId} = ${jurisdictionId} AND ${sampleCodes.sampleType} = 'surveillance' AND ${sampleCodes.status} = 'used'`);
      
      res.json({
        enforcement: {
          available: enforcementAvailable?.count || 0,
          used: enforcementUsed?.count || 0,
        },
        surveillance: {
          available: surveillanceAvailable?.count || 0,
          used: surveillanceUsed?.count || 0,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sample code statistics" });
    }
  });

  // ==================== DASHBOARD METRICS ====================

  // Get comprehensive dashboard metrics
  app.get("/api/dashboard/metrics", async (req: Request, res: Response) => {
    try {
      const { jurisdictionId } = req.query;
      
      const jurisdictionFilter = jurisdictionId 
        ? sql`jurisdiction_id = ${jurisdictionId}` 
        : sql`1=1`;

      // Licenses counts
      const [licensesTotal] = await db.select({ count: count() }).from(fboLicenses)
        .where(jurisdictionFilter);
      const [licensesActive] = await db.select({ count: count() }).from(fboLicenses)
        .where(sql`${jurisdictionFilter} AND status = 'active'`);
      const [licensesAmount] = await db.select({ 
        total: sql`COALESCE(SUM(fee_amount), 0)` 
      }).from(fboLicenses).where(jurisdictionFilter);

      // Registrations counts
      const [registrationsTotal] = await db.select({ count: count() }).from(fboRegistrations)
        .where(jurisdictionFilter);
      const [registrationsActive] = await db.select({ count: count() }).from(fboRegistrations)
        .where(sql`${jurisdictionFilter} AND status = 'active'`);
      const [registrationsAmount] = await db.select({ 
        total: sql`COALESCE(SUM(fee_amount), 0)` 
      }).from(fboRegistrations).where(jurisdictionFilter);

      // Inspections counts (by license vs registration)
      const [inspectionsTotal] = await db.select({ count: count() }).from(inspections)
        .where(jurisdictionFilter);
      const [inspectionsLicense] = await db.select({ count: count() }).from(inspections)
        .where(sql`${jurisdictionFilter} AND fbo_details->>'licenseType' = 'license'`);
      const [inspectionsRegistration] = await db.select({ count: count() }).from(inspections)
        .where(sql`${jurisdictionFilter} AND fbo_details->>'licenseType' = 'registration'`);

      // Grievances counts
      const [grievancesTotal] = await db.select({ count: count() }).from(grievances)
        .where(jurisdictionFilter);
      const [grievancesOnline] = await db.select({ count: count() }).from(grievances)
        .where(sql`${jurisdictionFilter} AND source = 'online'`);
      const [grievancesOffline] = await db.select({ count: count() }).from(grievances)
        .where(sql`${jurisdictionFilter} AND source = 'offline'`);
      const [grievancesPending] = await db.select({ count: count() }).from(grievances)
        .where(sql`${jurisdictionFilter} AND status = 'pending'`);

      // FSW Activities
      const [fswTesting] = await db.select({ count: count() }).from(fswActivities)
        .where(sql`${jurisdictionFilter} AND activity_type = 'testing'`);
      const [fswTraining] = await db.select({ count: count() }).from(fswActivities)
        .where(sql`${jurisdictionFilter} AND activity_type = 'training'`);
      const [fswAwareness] = await db.select({ count: count() }).from(fswActivities)
        .where(sql`${jurisdictionFilter} AND activity_type = 'awareness'`);

      // Adjudication cases
      const [adjudicationTotal] = await db.select({ count: count() }).from(adjudicationCases)
        .where(jurisdictionFilter);
      const [adjudicationPending] = await db.select({ count: count() }).from(adjudicationCases)
        .where(sql`${jurisdictionFilter} AND status = 'pending'`);

      // Prosecution cases
      const [prosecutionTotal] = await db.select({ count: count() }).from(prosecutionCases)
        .where(jurisdictionFilter);
      const [prosecutionPending] = await db.select({ count: count() }).from(prosecutionCases)
        .where(sql`${jurisdictionFilter} AND status IN ('pending', 'ongoing')`);

      res.json({
        licenses: {
          total: licensesTotal?.count || 0,
          active: licensesActive?.count || 0,
          amount: licensesAmount?.total || 0,
        },
        registrations: {
          total: registrationsTotal?.count || 0,
          active: registrationsActive?.count || 0,
          amount: registrationsAmount?.total || 0,
        },
        inspections: {
          total: inspectionsTotal?.count || 0,
          license: inspectionsLicense?.count || 0,
          registration: inspectionsRegistration?.count || 0,
        },
        grievances: {
          total: grievancesTotal?.count || 0,
          online: grievancesOnline?.count || 0,
          offline: grievancesOffline?.count || 0,
          pending: grievancesPending?.count || 0,
        },
        fsw: {
          testing: fswTesting?.count || 0,
          training: fswTraining?.count || 0,
          awareness: fswAwareness?.count || 0,
        },
        adjudication: {
          total: adjudicationTotal?.count || 0,
          pending: adjudicationPending?.count || 0,
        },
        prosecution: {
          total: prosecutionTotal?.count || 0,
          pending: prosecutionPending?.count || 0,
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  // ==================== PROSECUTION CASES ====================

  // Get all prosecution cases
  app.get("/api/prosecution-cases", async (req: Request, res: Response) => {
    try {
      const { jurisdictionId, status, limit = '50', offset = '0' } = req.query;
      
      const conditions: any[] = [];
      if (jurisdictionId) {
        conditions.push(sql`${prosecutionCases.jurisdictionId} = ${jurisdictionId}`);
      }
      if (status) {
        conditions.push(sql`${prosecutionCases.status} = ${status}`);
      }
      
      const whereClause = conditions.length > 0 
        ? sql.join(conditions, sql` AND `)
        : sql`1=1`;
      
      const cases = await db.select().from(prosecutionCases)
        .where(whereClause)
        .orderBy(desc(prosecutionCases.nextHearingDate))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      res.json(cases);
    } catch (error) {
      console.error('Error fetching prosecution cases:', error);
      res.status(500).json({ error: "Failed to fetch prosecution cases" });
    }
  });

  // Get single prosecution case with hearings
  app.get("/api/prosecution-cases/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [caseData] = await db.select().from(prosecutionCases)
        .where(sql`${prosecutionCases.id} = ${id}`);
      
      if (!caseData) {
        return res.status(404).json({ error: "Case not found" });
      }

      const hearings = await db.select().from(prosecutionHearings)
        .where(sql`${prosecutionHearings.caseId} = ${id}`)
        .orderBy(desc(prosecutionHearings.hearingDate));

      res.json({ case: caseData, hearings });
    } catch (error) {
      console.error('Error fetching prosecution case:', error);
      res.status(500).json({ error: "Failed to fetch prosecution case" });
    }
  });

  // Create prosecution case
  app.post("/api/prosecution-cases", async (req: Request, res: Response) => {
    try {
      const { 
        firstRegistrationDate, 
        firstHearingDate, 
        nextHearingDate,
        lastHearingDate,
        ...rest 
      } = req.body;

      const parseDate = (dateStr?: string) => {
        if (!dateStr || (typeof dateStr === 'string' && !dateStr.trim())) return null;
        return new Date(dateStr);
      };

      const values = {
        ...rest,
        firstRegistrationDate: parseDate(firstRegistrationDate),
        firstHearingDate: parseDate(firstHearingDate),
        nextHearingDate: parseDate(nextHearingDate),
        lastHearingDate: parseDate(lastHearingDate),
      };

      const [created] = await db.insert(prosecutionCases)
        .values(values)
        .returning();
      
      res.json(created);
    } catch (error) {
      console.error('Error creating prosecution case:', error);
      res.status(500).json({ error: "Failed to create prosecution case" });
    }
  });

  // Update prosecution case
  app.put("/api/prosecution-cases/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { 
        firstRegistrationDate, 
        firstHearingDate, 
        nextHearingDate,
        lastHearingDate,
        ...rest 
      } = req.body;

      const parseDate = (dateStr?: string) => {
        if (!dateStr || (typeof dateStr === 'string' && !dateStr.trim())) return null;
        return new Date(dateStr);
      };

      const updateValues: any = { ...rest, updatedAt: new Date() };
      if (firstRegistrationDate !== undefined) updateValues.firstRegistrationDate = parseDate(firstRegistrationDate);
      if (firstHearingDate !== undefined) updateValues.firstHearingDate = parseDate(firstHearingDate);
      if (nextHearingDate !== undefined) updateValues.nextHearingDate = parseDate(nextHearingDate);
      if (lastHearingDate !== undefined) updateValues.lastHearingDate = parseDate(lastHearingDate);
      
      const [updated] = await db.update(prosecutionCases)
        .set(updateValues)
        .where(sql`${prosecutionCases.id} = ${id}`)
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: "Case not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error('Error updating prosecution case:', error);
      res.status(500).json({ error: "Failed to update prosecution case" });
    }
  });

  // ==================== PROSECUTION HEARINGS ====================

  // Get hearings for a case
  app.get("/api/prosecution-cases/:caseId/hearings", async (req: Request, res: Response) => {
    try {
      const { caseId } = req.params;
      
      const hearings = await db.select().from(prosecutionHearings)
        .where(sql`${prosecutionHearings.caseId} = ${caseId}`)
        .orderBy(desc(prosecutionHearings.hearingDate));
      
      res.json(hearings);
    } catch (error) {
      console.error('Error fetching hearings:', error);
      res.status(500).json({ error: "Failed to fetch hearings" });
    }
  });

  // Create hearing
  app.post("/api/prosecution-hearings", async (req: Request, res: Response) => {
    try {
      const { hearingDate, nextDate, ...rest } = req.body;

      const parseDate = (dateStr?: string) => {
        if (!dateStr || (typeof dateStr === 'string' && !dateStr.trim())) return null;
        return new Date(dateStr);
      };

      const values = {
        ...rest,
        hearingDate: parseDate(hearingDate),
        nextDate: parseDate(nextDate),
      };

      const [created] = await db.insert(prosecutionHearings)
        .values(values)
        .returning();
      
      // Update case's next hearing date if this hearing has a next date
      if (nextDate && nextDate.trim()) {
        await db.update(prosecutionCases)
          .set({ 
            nextHearingDate: new Date(nextDate),
            lastHearingDate: hearingDate ? new Date(hearingDate) : new Date(),
            updatedAt: new Date()
          })
          .where(sql`${prosecutionCases.id} = ${req.body.caseId}`);
      }
      
      res.json(created);
    } catch (error) {
      console.error('Error creating hearing:', error);
      res.status(500).json({ error: "Failed to create hearing" });
    }
  });

  // Update hearing
  app.put("/api/prosecution-hearings/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [updated] = await db.update(prosecutionHearings)
        .set({ ...req.body, updatedAt: new Date() })
        .where(sql`${prosecutionHearings.id} = ${id}`)
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: "Hearing not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error('Error updating hearing:', error);
      res.status(500).json({ error: "Failed to update hearing" });
    }
  });

  // Get upcoming court dates across all cases
  app.get("/api/upcoming-hearings", async (req: Request, res: Response) => {
    try {
      const { jurisdictionId, days = '30' } = req.query;
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + parseInt(days as string));
      
      let whereClause = sql`${prosecutionCases.nextHearingDate} IS NOT NULL AND ${prosecutionCases.nextHearingDate} <= ${futureDate} AND ${prosecutionCases.status} IN ('pending', 'ongoing')`;
      
      if (jurisdictionId) {
        whereClause = sql`${whereClause} AND ${prosecutionCases.jurisdictionId} = ${jurisdictionId}`;
      }
      
      const cases = await db.select().from(prosecutionCases)
        .where(whereClause)
        .orderBy(asc(prosecutionCases.nextHearingDate));
      
      res.json(cases);
    } catch (error) {
      console.error('Error fetching upcoming hearings:', error);
      res.status(500).json({ error: "Failed to fetch upcoming hearings" });
    }
  });

  // ============ ACTION DASHBOARD ENDPOINTS ============

  // Get all action categories
  app.get("/api/action-categories", async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(actionCategories)
        .orderBy(asc(actionCategories.displayOrder));
      res.json(categories);
    } catch (error) {
      console.error('Error fetching action categories:', error);
      res.status(500).json({ error: "Failed to fetch action categories" });
    }
  });

  // Seed default action categories
  app.post("/api/action-categories/seed-defaults", requireAuth, async (_req: Request, res: Response) => {
    try {
      const defaultCategories = [
        // Legal & Court
        { name: 'Court Cases', code: 'court_cases', group: 'legal', entityType: 'prosecution_case', icon: 'briefcase', color: '#DC2626', priority: 'critical', displayOrder: 1, dueDateField: 'nextHearingDate', slaDefaultDays: 7 },
        { name: 'Adjudication Files', code: 'adjudication_files', group: 'legal', entityType: 'adjudication_case', icon: 'file-text', color: '#DC2626', priority: 'critical', displayOrder: 2, dueDateField: 'orderDate', slaDefaultDays: 14 },
        { name: 'Penalties Due', code: 'penalties_due', group: 'legal', entityType: 'adjudication_case', icon: 'dollar-sign', color: '#D97706', priority: 'high', displayOrder: 3, slaDefaultDays: 30 },
        // Inspections & Enforcement
        { name: 'Follow-up Inspections', code: 'followup_inspections', group: 'inspection', entityType: 'inspection', icon: 'refresh-cw', color: '#1E40AF', priority: 'high', displayOrder: 10, slaDefaultDays: 14 },
        { name: 'Inspections Pending', code: 'pending_inspections', group: 'inspection', entityType: 'inspection', icon: 'clipboard', color: '#1E40AF', priority: 'normal', displayOrder: 11, slaDefaultDays: 7 },
        { name: 'Improvement Notices', code: 'improvement_notices', group: 'inspection', entityType: 'improvement_notice', icon: 'alert-triangle', color: '#D97706', priority: 'high', displayOrder: 12, dueDateField: 'complianceDeadline', slaDefaultDays: 14 },
        { name: 'Seized Articles', code: 'seized_articles', group: 'inspection', entityType: 'seized_article', icon: 'lock', color: '#DC2626', priority: 'high', displayOrder: 13, slaDefaultDays: 30 },
        { name: 'Destroyed Articles', code: 'destroyed_articles', group: 'inspection', entityType: 'seized_article', icon: 'trash-2', color: '#6B7280', priority: 'normal', displayOrder: 14, slaDefaultDays: 7 },
        // Sampling & Laboratory
        { name: 'Samples Pending', code: 'samples_pending', group: 'sampling', entityType: 'sample', icon: 'package', color: '#0EA5E9', priority: 'normal', displayOrder: 20, slaDefaultDays: 3 },
        { name: 'Lab Reports Awaited', code: 'lab_reports_awaited', group: 'sampling', entityType: 'sample', icon: 'clock', color: '#D97706', priority: 'high', displayOrder: 21, slaDefaultDays: 14 },
        { name: 'Lab Reports Received', code: 'lab_reports_received', group: 'sampling', entityType: 'sample', icon: 'file-plus', color: '#059669', priority: 'normal', displayOrder: 22, slaDefaultDays: 3 },
        { name: 'Unsafe Samples', code: 'unsafe_samples', group: 'sampling', entityType: 'sample', icon: 'alert-octagon', color: '#DC2626', priority: 'critical', displayOrder: 23, slaDefaultDays: 1 },
        { name: 'Sub-standard Samples', code: 'substandard_samples', group: 'sampling', entityType: 'sample', icon: 'alert-circle', color: '#D97706', priority: 'high', displayOrder: 24, slaDefaultDays: 7 },
        { name: 'Misbranded Samples', code: 'misbranded_samples', group: 'sampling', entityType: 'sample', icon: 'tag', color: '#D97706', priority: 'high', displayOrder: 25, slaDefaultDays: 7 },
        { name: 'Schedule IV Cases', code: 'schedule_iv_cases', group: 'sampling', entityType: 'sample', icon: 'shield-off', color: '#DC2626', priority: 'critical', displayOrder: 26, slaDefaultDays: 3 },
        // Administrative & Compliance
        { name: 'Special Drives', code: 'special_drives', group: 'administrative', entityType: 'special_drive', icon: 'target', color: '#8B5CF6', priority: 'high', displayOrder: 30, slaDefaultDays: 7 },
        { name: 'Workshops & Trainings', code: 'workshops_trainings', group: 'administrative', entityType: 'workshop', icon: 'users', color: '#0EA5E9', priority: 'normal', displayOrder: 31, slaDefaultDays: 7 },
        { name: 'DLAC Meetings', code: 'dlac_meetings', group: 'administrative', entityType: 'workshop', icon: 'calendar', color: '#1E40AF', priority: 'normal', displayOrder: 32, slaDefaultDays: 7 },
        { name: 'FSSAI Initiatives', code: 'fssai_initiatives', group: 'administrative', entityType: 'special_drive', icon: 'star', color: '#059669', priority: 'normal', displayOrder: 33, slaDefaultDays: 14 },
        { name: 'Grievances', code: 'grievances', group: 'administrative', entityType: 'grievance', icon: 'message-circle', color: '#D97706', priority: 'high', displayOrder: 34, dueDateField: 'dueDate', slaDefaultDays: 7 },
        // Protocol & Special Duties
        { name: 'VVIP/ASL Duties', code: 'vvip_duties', group: 'protocol', entityType: 'vvip_duty', icon: 'shield', color: '#DC2626', priority: 'critical', displayOrder: 40, dueDateField: 'eventDate', slaDefaultDays: 1 },
      ];

      for (const cat of defaultCategories) {
        await db.insert(actionCategories)
          .values(cat)
          .onConflictDoUpdate({
            target: actionCategories.code,
            set: { ...cat, updatedAt: new Date() }
          });
      }

      const categories = await db.select().from(actionCategories).orderBy(asc(actionCategories.displayOrder));
      res.json({ message: 'Default categories seeded', categories });
    } catch (error) {
      console.error('Error seeding categories:', error);
      res.status(500).json({ error: "Failed to seed categories" });
    }
  });

  // Update action category
  app.put("/api/action-categories/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [updated] = await db.update(actionCategories)
        .set({ ...req.body, updatedAt: new Date() })
        .where(sql`${actionCategories.id} = ${id}`)
        .returning();
      res.json(updated);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  // Get comprehensive action dashboard data
  app.get("/api/action-dashboard", async (req: Request, res: Response) => {
    try {
      const { jurisdictionId, startDate, endDate, forReport } = req.query;
      const today = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(today.getDate() + 7);

      // Parse date range filters
      const filterStartDate = startDate ? new Date(startDate as string) : null;
      const filterEndDate = endDate ? new Date(endDate as string) : null;

      // Get all enabled categories - for report use showInReport, for dashboard use showOnDashboard
      const showFilter = forReport === 'true' 
        ? sql`${actionCategories.isEnabled} = true AND ${actionCategories.showInReport} = true`
        : sql`${actionCategories.isEnabled} = true AND ${actionCategories.showOnDashboard} = true`;
      const orderBy = forReport === 'true' 
        ? asc(actionCategories.reportDisplayOrder) 
        : asc(actionCategories.displayOrder);
      
      const categories = await db.select().from(actionCategories)
        .where(showFilter)
        .orderBy(orderBy);

      const dashboardData: any[] = [];

      for (const category of categories) {
        let counts = { total: 0, pending: 0, overdue: 0, dueThisWeek: 0, dueToday: 0 };
        
        switch (category.code) {
          case 'court_cases': {
            let baseWhere = jurisdictionId 
              ? sql`${prosecutionCases.jurisdictionId} = ${jurisdictionId}`
              : sql`1=1`;
            
            // Apply date filter to first registration date
            if (filterStartDate && filterEndDate) {
              baseWhere = sql`${baseWhere} AND ${prosecutionCases.firstRegistrationDate} >= ${filterStartDate} AND ${prosecutionCases.firstRegistrationDate} <= ${filterEndDate}`;
            }
            
            const allCases = await db.select({ count: count() }).from(prosecutionCases)
              .where(sql`${baseWhere} AND ${prosecutionCases.status} IN ('pending', 'ongoing')`);
            counts.total = allCases[0]?.count || 0;
            
            const pending = await db.select({ count: count() }).from(prosecutionCases)
              .where(sql`${baseWhere} AND ${prosecutionCases.status} = 'pending'`);
            counts.pending = pending[0]?.count || 0;
            
            const overdue = await db.select({ count: count() }).from(prosecutionCases)
              .where(sql`${baseWhere} AND ${prosecutionCases.nextHearingDate} < ${today} AND ${prosecutionCases.status} IN ('pending', 'ongoing')`);
            counts.overdue = overdue[0]?.count || 0;
            
            const thisWeek = await db.select({ count: count() }).from(prosecutionCases)
              .where(sql`${baseWhere} AND ${prosecutionCases.nextHearingDate} >= ${today} AND ${prosecutionCases.nextHearingDate} <= ${weekFromNow} AND ${prosecutionCases.status} IN ('pending', 'ongoing')`);
            counts.dueThisWeek = thisWeek[0]?.count || 0;
            
            const todayDue = await db.select({ count: count() }).from(prosecutionCases)
              .where(sql`${baseWhere} AND DATE(${prosecutionCases.nextHearingDate}) = DATE(${today}) AND ${prosecutionCases.status} IN ('pending', 'ongoing')`);
            counts.dueToday = todayDue[0]?.count || 0;
            break;
          }
          case 'adjudication_files': {
            let baseWhere = jurisdictionId 
              ? sql`${adjudicationCases.jurisdictionId} = ${jurisdictionId}`
              : sql`1=1`;
            
            if (filterStartDate && filterEndDate) {
              baseWhere = sql`${baseWhere} AND ${adjudicationCases.createdAt} >= ${filterStartDate} AND ${adjudicationCases.createdAt} <= ${filterEndDate}`;
            }
            
            const allCases = await db.select({ count: count() }).from(adjudicationCases)
              .where(sql`${baseWhere} AND ${adjudicationCases.status} IN ('pending', 'hearing')`);
            counts.total = allCases[0]?.count || 0;
            counts.pending = counts.total;
            break;
          }
          case 'pending_inspections': {
            let baseWhere = jurisdictionId 
              ? sql`${inspections.jurisdictionId} = ${jurisdictionId}`
              : sql`1=1`;
            
            if (filterStartDate && filterEndDate) {
              baseWhere = sql`${baseWhere} AND ${inspections.createdAt} >= ${filterStartDate} AND ${inspections.createdAt} <= ${filterEndDate}`;
            }
            
            const allInsp = await db.select({ count: count() }).from(inspections)
              .where(sql`${baseWhere} AND ${inspections.status} = 'draft'`);
            counts.total = allInsp[0]?.count || 0;
            counts.pending = counts.total;
            break;
          }
          case 'samples_pending': {
            let baseWhere = jurisdictionId 
              ? sql`${samples.jurisdictionId} = ${jurisdictionId}`
              : sql`1=1`;
            
            if (filterStartDate && filterEndDate) {
              baseWhere = sql`${baseWhere} AND ${samples.liftedDate} >= ${filterStartDate} AND ${samples.liftedDate} <= ${filterEndDate}`;
            }
            
            const allSamples = await db.select({ count: count() }).from(samples)
              .where(sql`${baseWhere} AND ${samples.status} = 'pending'`);
            counts.total = allSamples[0]?.count || 0;
            counts.pending = counts.total;
            break;
          }
          case 'lab_reports_awaited': {
            let baseWhere = jurisdictionId 
              ? sql`${samples.jurisdictionId} = ${jurisdictionId}`
              : sql`1=1`;
            
            if (filterStartDate && filterEndDate) {
              baseWhere = sql`${baseWhere} AND ${samples.liftedDate} >= ${filterStartDate} AND ${samples.liftedDate} <= ${filterEndDate}`;
            }
            
            const awaiting = await db.select({ count: count() }).from(samples)
              .where(sql`${baseWhere} AND ${samples.status} = 'dispatched' AND ${samples.labReportDate} IS NULL`);
            counts.total = awaiting[0]?.count || 0;
            
            // Overdue = dispatched more than 14 days ago with no report
            const fourteenDaysAgo = new Date();
            fourteenDaysAgo.setDate(today.getDate() - 14);
            const overdue = await db.select({ count: count() }).from(samples)
              .where(sql`${baseWhere} AND ${samples.status} = 'dispatched' AND ${samples.labReportDate} IS NULL AND ${samples.dispatchDate} < ${fourteenDaysAgo}`);
            counts.overdue = overdue[0]?.count || 0;
            counts.pending = counts.total - counts.overdue;
            break;
          }
          case 'unsafe_samples': {
            let baseWhere = jurisdictionId 
              ? sql`${samples.jurisdictionId} = ${jurisdictionId}`
              : sql`1=1`;
            
            if (filterStartDate && filterEndDate) {
              baseWhere = sql`${baseWhere} AND ${samples.liftedDate} >= ${filterStartDate} AND ${samples.liftedDate} <= ${filterEndDate}`;
            }
            
            const unsafe = await db.select({ count: count() }).from(samples)
              .where(sql`${baseWhere} AND ${samples.labResult} = 'unsafe'`);
            counts.total = unsafe[0]?.count || 0;
            counts.pending = counts.total;
            break;
          }
          case 'substandard_samples': {
            let baseWhere = jurisdictionId 
              ? sql`${samples.jurisdictionId} = ${jurisdictionId}`
              : sql`1=1`;
            
            if (filterStartDate && filterEndDate) {
              baseWhere = sql`${baseWhere} AND ${samples.liftedDate} >= ${filterStartDate} AND ${samples.liftedDate} <= ${filterEndDate}`;
            }
            
            const substandard = await db.select({ count: count() }).from(samples)
              .where(sql`${baseWhere} AND ${samples.labResult} = 'substandard'`);
            counts.total = substandard[0]?.count || 0;
            counts.pending = counts.total;
            break;
          }
          case 'grievances': {
            let baseWhere = jurisdictionId 
              ? sql`${grievances.jurisdictionId} = ${jurisdictionId}`
              : sql`1=1`;
            
            if (filterStartDate && filterEndDate) {
              baseWhere = sql`${baseWhere} AND ${grievances.createdAt} >= ${filterStartDate} AND ${grievances.createdAt} <= ${filterEndDate}`;
            }
            
            const allGrievances = await db.select({ count: count() }).from(grievances)
              .where(sql`${baseWhere} AND ${grievances.status} IN ('pending', 'investigating')`);
            counts.total = allGrievances[0]?.count || 0;
            
            const pending = await db.select({ count: count() }).from(grievances)
              .where(sql`${baseWhere} AND ${grievances.status} = 'pending'`);
            counts.pending = pending[0]?.count || 0;
            
            const overdue = await db.select({ count: count() }).from(grievances)
              .where(sql`${baseWhere} AND ${grievances.dueDate} < ${today} AND ${grievances.status} IN ('pending', 'investigating')`);
            counts.overdue = overdue[0]?.count || 0;
            break;
          }
          case 'improvement_notices': {
            const baseWhere = jurisdictionId 
              ? sql`${improvementNotices.jurisdictionId} = ${jurisdictionId}`
              : sql`1=1`;
            
            const allNotices = await db.select({ count: count() }).from(improvementNotices)
              .where(sql`${baseWhere} AND ${improvementNotices.status} = 'issued'`);
            counts.total = allNotices[0]?.count || 0;
            
            const overdue = await db.select({ count: count() }).from(improvementNotices)
              .where(sql`${baseWhere} AND ${improvementNotices.complianceDeadline} < ${today} AND ${improvementNotices.status} = 'issued'`);
            counts.overdue = overdue[0]?.count || 0;
            counts.pending = counts.total - counts.overdue;
            break;
          }
          case 'seized_articles': {
            const baseWhere = jurisdictionId 
              ? sql`${seizedArticles.jurisdictionId} = ${jurisdictionId}`
              : sql`1=1`;
            
            const allSeized = await db.select({ count: count() }).from(seizedArticles)
              .where(sql`${baseWhere} AND ${seizedArticles.status} = 'seized'`);
            counts.total = allSeized[0]?.count || 0;
            counts.pending = counts.total;
            break;
          }
          case 'special_drives': {
            const baseWhere = jurisdictionId 
              ? sql`${specialDrives.jurisdictionId} = ${jurisdictionId} OR ${specialDrives.jurisdictionId} IS NULL`
              : sql`1=1`;
            
            const active = await db.select({ count: count() }).from(specialDrives)
              .where(sql`${baseWhere} AND ${specialDrives.status} = 'active'`);
            counts.total = active[0]?.count || 0;
            
            const upcoming = await db.select({ count: count() }).from(specialDrives)
              .where(sql`${baseWhere} AND ${specialDrives.status} = 'upcoming' AND ${specialDrives.startDate} <= ${weekFromNow}`);
            counts.dueThisWeek = upcoming[0]?.count || 0;
            counts.pending = counts.total;
            break;
          }
          case 'vvip_duties': {
            const baseWhere = jurisdictionId 
              ? sql`${vvipDuties.jurisdictionId} = ${jurisdictionId}`
              : sql`1=1`;
            
            const scheduled = await db.select({ count: count() }).from(vvipDuties)
              .where(sql`${baseWhere} AND ${vvipDuties.status} = 'scheduled' AND ${vvipDuties.eventDate} >= ${today}`);
            counts.total = scheduled[0]?.count || 0;
            
            const thisWeek = await db.select({ count: count() }).from(vvipDuties)
              .where(sql`${baseWhere} AND ${vvipDuties.status} = 'scheduled' AND ${vvipDuties.eventDate} >= ${today} AND ${vvipDuties.eventDate} <= ${weekFromNow}`);
            counts.dueThisWeek = thisWeek[0]?.count || 0;
            
            const todayDuty = await db.select({ count: count() }).from(vvipDuties)
              .where(sql`${baseWhere} AND ${vvipDuties.status} = 'scheduled' AND DATE(${vvipDuties.eventDate}) = DATE(${today})`);
            counts.dueToday = todayDuty[0]?.count || 0;
            counts.pending = counts.total;
            break;
          }
          case 'workshops_trainings': {
            const baseWhere = jurisdictionId 
              ? sql`${workshops.jurisdictionId} = ${jurisdictionId} OR ${workshops.jurisdictionId} IS NULL`
              : sql`1=1`;
            
            const scheduled = await db.select({ count: count() }).from(workshops)
              .where(sql`${baseWhere} AND ${workshops.status} = 'scheduled' AND ${workshops.workshopType} IN ('training', 'workshop', 'seminar')`);
            counts.total = scheduled[0]?.count || 0;
            
            const thisWeek = await db.select({ count: count() }).from(workshops)
              .where(sql`${baseWhere} AND ${workshops.status} = 'scheduled' AND ${workshops.eventDate} >= ${today} AND ${workshops.eventDate} <= ${weekFromNow} AND ${workshops.workshopType} IN ('training', 'workshop', 'seminar')`);
            counts.dueThisWeek = thisWeek[0]?.count || 0;
            counts.pending = counts.total;
            break;
          }
          case 'dlac_meetings': {
            const baseWhere = jurisdictionId 
              ? sql`${workshops.jurisdictionId} = ${jurisdictionId} OR ${workshops.jurisdictionId} IS NULL`
              : sql`1=1`;
            
            const scheduled = await db.select({ count: count() }).from(workshops)
              .where(sql`${baseWhere} AND ${workshops.status} = 'scheduled' AND ${workshops.workshopType} = 'dlac_meeting'`);
            counts.total = scheduled[0]?.count || 0;
            counts.pending = counts.total;
            break;
          }
        }

        dashboardData.push({
          ...category,
          counts
        });
      }

      // Group by category group
      const grouped = {
        legal: dashboardData.filter(d => d.group === 'legal'),
        inspection: dashboardData.filter(d => d.group === 'inspection'),
        sampling: dashboardData.filter(d => d.group === 'sampling'),
        administrative: dashboardData.filter(d => d.group === 'administrative'),
        protocol: dashboardData.filter(d => d.group === 'protocol'),
      };

      // Calculate totals
      const totals = {
        totalItems: dashboardData.reduce((sum, d) => sum + d.counts.total, 0),
        pendingItems: dashboardData.reduce((sum, d) => sum + d.counts.pending, 0),
        overdueItems: dashboardData.reduce((sum, d) => sum + d.counts.overdue, 0),
        dueThisWeek: dashboardData.reduce((sum, d) => sum + d.counts.dueThisWeek, 0),
        dueToday: dashboardData.reduce((sum, d) => sum + d.counts.dueToday, 0),
        criticalItems: dashboardData.filter(d => d.priority === 'critical').reduce((sum, d) => sum + d.counts.total, 0),
      };

      res.json({ categories: dashboardData, grouped, totals });
    } catch (error) {
      console.error('Error fetching action dashboard:', error);
      res.status(500).json({ error: "Failed to fetch action dashboard" });
    }
  });

  // ============ SPECIAL DRIVES ENDPOINTS ============
  app.get("/api/special-drives", async (req: Request, res: Response) => {
    try {
      const { jurisdictionId, status } = req.query;
      let whereClause = sql`1=1`;
      
      if (jurisdictionId) {
        whereClause = sql`${whereClause} AND (${specialDrives.jurisdictionId} = ${jurisdictionId} OR ${specialDrives.jurisdictionId} IS NULL)`;
      }
      if (status) {
        whereClause = sql`${whereClause} AND ${specialDrives.status} = ${status}`;
      }
      
      const drives = await db.select().from(specialDrives)
        .where(whereClause)
        .orderBy(desc(specialDrives.startDate));
      res.json(drives);
    } catch (error) {
      console.error('Error fetching special drives:', error);
      res.status(500).json({ error: "Failed to fetch special drives" });
    }
  });

  app.post("/api/special-drives", async (req: Request, res: Response) => {
    try {
      const [created] = await db.insert(specialDrives).values(req.body).returning();
      res.json(created);
    } catch (error) {
      console.error('Error creating special drive:', error);
      res.status(500).json({ error: "Failed to create special drive" });
    }
  });

  // ============ VVIP DUTIES ENDPOINTS ============
  app.get("/api/vvip-duties", async (req: Request, res: Response) => {
    try {
      const { jurisdictionId, status } = req.query;
      let whereClause = sql`1=1`;
      
      if (jurisdictionId) {
        whereClause = sql`${whereClause} AND ${vvipDuties.jurisdictionId} = ${jurisdictionId}`;
      }
      if (status) {
        whereClause = sql`${whereClause} AND ${vvipDuties.status} = ${status}`;
      }
      
      const duties = await db.select().from(vvipDuties)
        .where(whereClause)
        .orderBy(asc(vvipDuties.eventDate));
      res.json(duties);
    } catch (error) {
      console.error('Error fetching VVIP duties:', error);
      res.status(500).json({ error: "Failed to fetch VVIP duties" });
    }
  });

  app.post("/api/vvip-duties", async (req: Request, res: Response) => {
    try {
      const [created] = await db.insert(vvipDuties).values(req.body).returning();
      res.json(created);
    } catch (error) {
      console.error('Error creating VVIP duty:', error);
      res.status(500).json({ error: "Failed to create VVIP duty" });
    }
  });

  // ============ WORKSHOPS ENDPOINTS ============
  app.get("/api/workshops", async (req: Request, res: Response) => {
    try {
      const { jurisdictionId, status, type } = req.query;
      let whereClause = sql`1=1`;
      
      if (jurisdictionId) {
        whereClause = sql`${whereClause} AND (${workshops.jurisdictionId} = ${jurisdictionId} OR ${workshops.jurisdictionId} IS NULL)`;
      }
      if (status) {
        whereClause = sql`${whereClause} AND ${workshops.status} = ${status}`;
      }
      if (type) {
        whereClause = sql`${whereClause} AND ${workshops.workshopType} = ${type}`;
      }
      
      const workshopList = await db.select().from(workshops)
        .where(whereClause)
        .orderBy(asc(workshops.eventDate));
      res.json(workshopList);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      res.status(500).json({ error: "Failed to fetch workshops" });
    }
  });

  app.post("/api/workshops", async (req: Request, res: Response) => {
    try {
      const [created] = await db.insert(workshops).values(req.body).returning();
      res.json(created);
    } catch (error) {
      console.error('Error creating workshop:', error);
      res.status(500).json({ error: "Failed to create workshop" });
    }
  });

  // ============ IMPROVEMENT NOTICES ENDPOINTS ============
  app.get("/api/improvement-notices", async (req: Request, res: Response) => {
    try {
      const { jurisdictionId, status } = req.query;
      let whereClause = sql`1=1`;
      
      if (jurisdictionId) {
        whereClause = sql`${whereClause} AND ${improvementNotices.jurisdictionId} = ${jurisdictionId}`;
      }
      if (status) {
        whereClause = sql`${whereClause} AND ${improvementNotices.status} = ${status}`;
      }
      
      const notices = await db.select().from(improvementNotices)
        .where(whereClause)
        .orderBy(desc(improvementNotices.issueDate));
      res.json(notices);
    } catch (error) {
      console.error('Error fetching improvement notices:', error);
      res.status(500).json({ error: "Failed to fetch improvement notices" });
    }
  });

  app.post("/api/improvement-notices", async (req: Request, res: Response) => {
    try {
      const [created] = await db.insert(improvementNotices).values(req.body).returning();
      res.json(created);
    } catch (error) {
      console.error('Error creating improvement notice:', error);
      res.status(500).json({ error: "Failed to create improvement notice" });
    }
  });

  // ============ SEIZED ARTICLES ENDPOINTS ============
  app.get("/api/seized-articles", async (req: Request, res: Response) => {
    try {
      const { jurisdictionId, status } = req.query;
      let whereClause = sql`1=1`;
      
      if (jurisdictionId) {
        whereClause = sql`${whereClause} AND ${seizedArticles.jurisdictionId} = ${jurisdictionId}`;
      }
      if (status) {
        whereClause = sql`${whereClause} AND ${seizedArticles.status} = ${status}`;
      }
      
      const articles = await db.select().from(seizedArticles)
        .where(whereClause)
        .orderBy(desc(seizedArticles.seizureDate));
      res.json(articles);
    } catch (error) {
      console.error('Error fetching seized articles:', error);
      res.status(500).json({ error: "Failed to fetch seized articles" });
    }
  });

  app.post("/api/seized-articles", async (req: Request, res: Response) => {
    try {
      const [created] = await db.insert(seizedArticles).values(req.body).returning();
      res.json(created);
    } catch (error) {
      console.error('Error creating seized article:', error);
      res.status(500).json({ error: "Failed to create seized article" });
    }
  });

  // ============ DASHBOARD SETTINGS & CONFIGURATION ============

  // Get all statistics cards
  app.get("/api/statistics-cards", async (_req: Request, res: Response) => {
    try {
      const cards = await db.select().from(statisticsCards)
        .orderBy(asc(statisticsCards.displayOrder));
      res.json(cards);
    } catch (error) {
      console.error('Error fetching statistics cards:', error);
      res.status(500).json({ error: "Failed to fetch statistics cards" });
    }
  });

  // Create statistics card
  app.post("/api/statistics-cards", requireAuth, async (req: Request, res: Response) => {
    try {
      const [created] = await db.insert(statisticsCards).values(req.body).returning();
      res.json(created);
    } catch (error) {
      console.error('Error creating statistics card:', error);
      res.status(500).json({ error: "Failed to create statistics card" });
    }
  });

  // Update statistics card
  app.put("/api/statistics-cards/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [updated] = await db.update(statisticsCards)
        .set({ ...req.body, updatedAt: new Date() })
        .where(sql`${statisticsCards.id} = ${id}`)
        .returning();
      res.json(updated);
    } catch (error) {
      console.error('Error updating statistics card:', error);
      res.status(500).json({ error: "Failed to update statistics card" });
    }
  });

  // Delete statistics card
  app.delete("/api/statistics-cards/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(statisticsCards).where(sql`${statisticsCards.id} = ${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting statistics card:', error);
      res.status(500).json({ error: "Failed to delete statistics card" });
    }
  });

  // Seed default statistics cards
  app.post("/api/statistics-cards/seed-defaults", requireAuth, async (_req: Request, res: Response) => {
    try {
      const defaultCards = [
        { name: 'Licenses Issued', code: 'licenses_issued', group: 'license', icon: 'file-text', color: '#059669', valueType: 'count', entityType: 'license', displayOrder: 1 },
        { name: 'Registrations', code: 'registrations', group: 'license', icon: 'clipboard', color: '#0EA5E9', valueType: 'count', entityType: 'registration', displayOrder: 2 },
        { name: 'Inspections', code: 'inspections_count', group: 'inspection', icon: 'search', color: '#1E40AF', valueType: 'count', entityType: 'inspection', displayOrder: 3 },
        { name: 'Samples Collected', code: 'samples_collected', group: 'sample', icon: 'package', color: '#8B5CF6', valueType: 'count', entityType: 'sample', displayOrder: 4 },
        { name: 'FSW Activities', code: 'fsw_activities', group: 'general', icon: 'activity', color: '#D97706', valueType: 'count', entityType: 'fsw', displayOrder: 5 },
        { name: 'Grievances Resolved', code: 'grievances_resolved', group: 'general', icon: 'check-circle', color: '#059669', valueType: 'count', entityType: 'grievance', displayOrder: 6 },
        { name: 'Adjudication Cases', code: 'adjudication_cases', group: 'legal', icon: 'scale', color: '#DC2626', valueType: 'count', entityType: 'adjudication', displayOrder: 7 },
        { name: 'Prosecution Cases', code: 'prosecution_cases', group: 'legal', icon: 'briefcase', color: '#DC2626', valueType: 'count', entityType: 'prosecution', displayOrder: 8 },
        { name: 'Revenue Collected', code: 'revenue_collected', group: 'financial', icon: 'dollar-sign', color: '#059669', valueType: 'currency', entityType: 'financial', displayOrder: 9 },
        { name: 'Penalties Collected', code: 'penalties_collected', group: 'financial', icon: 'credit-card', color: '#D97706', valueType: 'currency', entityType: 'penalty', displayOrder: 10 },
      ];

      for (const card of defaultCards) {
        await db.insert(statisticsCards)
          .values(card)
          .onConflictDoUpdate({
            target: statisticsCards.code,
            set: { ...card, updatedAt: new Date() }
          });
      }

      const cards = await db.select().from(statisticsCards).orderBy(asc(statisticsCards.displayOrder));
      res.json({ message: 'Default statistics cards seeded', cards });
    } catch (error) {
      console.error('Error seeding statistics cards:', error);
      res.status(500).json({ error: "Failed to seed statistics cards" });
    }
  });

  // Get all dashboard settings
  app.get("/api/dashboard-settings", async (_req: Request, res: Response) => {
    try {
      const settings = await db.select().from(dashboardSettings);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching dashboard settings:', error);
      res.status(500).json({ error: "Failed to fetch dashboard settings" });
    }
  });

  // Update dashboard setting
  app.put("/api/dashboard-settings/:key", requireAuth, async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const { value, type, description, category } = req.body;
      
      const [updated] = await db.insert(dashboardSettings)
        .values({ settingKey: key, settingValue: value, settingType: type || 'string', description, category: category || 'general' })
        .onConflictDoUpdate({
          target: dashboardSettings.settingKey,
          set: { settingValue: value, updatedAt: new Date() }
        })
        .returning();
      res.json(updated);
    } catch (error) {
      console.error('Error updating dashboard setting:', error);
      res.status(500).json({ error: "Failed to update dashboard setting" });
    }
  });

  // Get all report sections
  app.get("/api/report-sections", async (_req: Request, res: Response) => {
    try {
      const sections = await db.select().from(reportSections)
        .orderBy(asc(reportSections.displayOrder));
      res.json(sections);
    } catch (error) {
      console.error('Error fetching report sections:', error);
      res.status(500).json({ error: "Failed to fetch report sections" });
    }
  });

  // Create report section
  app.post("/api/report-sections", requireAuth, async (req: Request, res: Response) => {
    try {
      const [created] = await db.insert(reportSections).values(req.body).returning();
      res.json(created);
    } catch (error) {
      console.error('Error creating report section:', error);
      res.status(500).json({ error: "Failed to create report section" });
    }
  });

  // Update report section
  app.put("/api/report-sections/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [updated] = await db.update(reportSections)
        .set({ ...req.body, updatedAt: new Date() })
        .where(sql`${reportSections.id} = ${id}`)
        .returning();
      res.json(updated);
    } catch (error) {
      console.error('Error updating report section:', error);
      res.status(500).json({ error: "Failed to update report section" });
    }
  });

  // Delete report section
  app.delete("/api/report-sections/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(reportSections).where(sql`${reportSections.id} = ${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting report section:', error);
      res.status(500).json({ error: "Failed to delete report section" });
    }
  });

  // Seed default report sections
  app.post("/api/report-sections/seed-defaults", requireAuth, async (_req: Request, res: Response) => {
    try {
      const defaultSections = [
        { name: 'Report Header', code: 'header', sectionType: 'summary', displayOrder: 1, configuration: { showLogo: true, showDate: true, showPeriod: true } },
        { name: 'Action Dashboard Summary', code: 'action_summary', sectionType: 'summary', displayOrder: 2, configuration: { showCards: true } },
        { name: 'Action Categories Breakdown', code: 'category_breakdown', sectionType: 'table', displayOrder: 3, configuration: { groupByCategory: true } },
        { name: 'Statistics Overview', code: 'statistics_overview', sectionType: 'statistics', displayOrder: 4, configuration: { columns: 3 } },
        { name: 'Financial Summary', code: 'financial_summary', sectionType: 'table', displayOrder: 5, configuration: { showRevenue: true, showPenalties: true } },
        { name: 'Report Footer', code: 'footer', sectionType: 'summary', displayOrder: 6, configuration: { showSignature: true, showTimestamp: true } },
      ];

      for (const section of defaultSections) {
        await db.insert(reportSections)
          .values(section)
          .onConflictDoUpdate({
            target: reportSections.code,
            set: { ...section, updatedAt: new Date() }
          });
      }

      const sections = await db.select().from(reportSections).orderBy(asc(reportSections.displayOrder));
      res.json({ message: 'Default report sections seeded', sections });
    } catch (error) {
      console.error('Error seeding report sections:', error);
      res.status(500).json({ error: "Failed to seed report sections" });
    }
  });

  // Delete action category
  app.delete("/api/action-categories/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(actionCategories).where(sql`${actionCategories.id} = ${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting action category:', error);
      res.status(500).json({ error: "Failed to delete action category" });
    }
  });

  // Create action category
  app.post("/api/action-categories", requireAuth, async (req: Request, res: Response) => {
    try {
      const [created] = await db.insert(actionCategories).values(req.body).returning();
      res.json(created);
    } catch (error) {
      console.error('Error creating action category:', error);
      res.status(500).json({ error: "Failed to create action category" });
    }
  });

  // ============ ADMIN DASHBOARD SETTINGS PAGE ============
  app.get("/admin/dashboard-settings", (req: Request, res: Response) => {
    if (!req.session?.authenticated) {
      return res.redirect("/admin/login");
    }
    const templatePath = path.resolve(process.cwd(), "server", "templates", "admin-dashboard-settings.html");
    if (fs.existsSync(templatePath)) {
      return res.sendFile(templatePath);
    }
    res.status(404).send("Admin dashboard settings page not found");
  });

  const httpServer = createServer(app);
  return httpServer;
}
