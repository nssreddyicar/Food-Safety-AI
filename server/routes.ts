import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import * as fs from "fs";
import * as path from "path";

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

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/admin", (_req: Request, res: Response) => {
    const templatePath = path.resolve(
      process.cwd(),
      "server",
      "templates",
      "admin-login.html"
    );
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  app.get("/admin/dashboard", (req: Request, res: Response) => {
    const sessionToken = req.headers.cookie
      ?.split(";")
      .find((c) => c.trim().startsWith("admin_session="))
      ?.split("=")[1];

    if (!sessionToken || !isValidSession(sessionToken)) {
      return res.redirect("/admin");
    }

    const templatePath = path.resolve(
      process.cwd(),
      "server",
      "templates",
      "admin-dashboard.html"
    );
    const html = fs.readFileSync(templatePath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  app.post("/api/admin/login", (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
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
    const sessionToken = req.headers.cookie
      ?.split(";")
      .find((c) => c.trim().startsWith("admin_session="))
      ?.split("=")[1];

    if (sessionToken) {
      adminSessions.delete(sessionToken);
    }

    res.clearCookie("admin_session");
    return res.json({ success: true });
  });

  app.get("/api/admin/check", (req: Request, res: Response) => {
    const sessionToken = req.headers.cookie
      ?.split(";")
      .find((c) => c.trim().startsWith("admin_session="))
      ?.split("=")[1];

    if (sessionToken && isValidSession(sessionToken)) {
      return res.json({ authenticated: true });
    }

    return res.status(401).json({ authenticated: false });
  });

  const httpServer = createServer(app);

  return httpServer;
}
