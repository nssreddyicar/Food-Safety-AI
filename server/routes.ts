import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import * as fs from "fs";
import * as path from "path";
import { db } from "./db";
import { officers, districts, inspections, samples, systemSettings, administrativeLevels, jurisdictionUnits, officerRoles, officerCapacities, officerAssignments, documentTemplates, workflowNodes, workflowTransitions, sampleWorkflowState, sampleCodes, sampleCodeAuditLog } from "../shared/schema";
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
      const { name, description, category, content, placeholders, pageSize, orientation, marginTop, marginBottom, marginLeft, marginRight, fontFamily, fontSize, showPageNumbers, pageNumberPosition, pageNumberOffset, showHeader, showFooter, headerText, footerText, headerAlignment, footerAlignment, status } = req.body;
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
        pageNumberPosition: pageNumberPosition || "center",
        pageNumberOffset: pageNumberOffset || 0,
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
      const { name, description, category, content, placeholders, pageSize, orientation, marginTop, marginBottom, marginLeft, marginRight, fontFamily, fontSize, showPageNumbers, pageNumberPosition, pageNumberOffset, showHeader, showFooter, headerText, footerText, headerAlignment, footerAlignment, status } = req.body;
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
          pageNumberPosition,
          pageNumberOffset,
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

  const httpServer = createServer(app);
  return httpServer;
}
