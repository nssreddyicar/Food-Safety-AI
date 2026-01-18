import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import * as fs from "fs";
import * as path from "path";
import { db } from "./db";
import { officers, districts, inspections, samples, systemSettings } from "../shared/schema";
import { desc, count, sql } from "drizzle-orm";

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
      const { name, email, phone, role, designation, districtId, status } = req.body;
      const [newOfficer] = await db.insert(officers).values({
        name,
        email,
        phone,
        role: role || "fso",
        designation,
        districtId,
        status: status || "active",
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
      const { name, email, phone, role, designation, districtId, status } = req.body;
      const [updated] = await db.update(officers)
        .set({ name, email, phone, role, designation, districtId, status, updatedAt: new Date() })
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

  const httpServer = createServer(app);
  return httpServer;
}
