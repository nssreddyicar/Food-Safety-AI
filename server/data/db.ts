/**
 * =============================================================================
 * FILE: server/data/db.ts
 * LAYER: DATA ACCESS (Layer 4)
 * =============================================================================
 * 
 * PURPOSE:
 * Establishes and exports the PostgreSQL database connection using Drizzle ORM.
 * This is the single point of database connection for the entire application.
 * 
 * WHAT THIS FILE MUST DO:
 * - Create and configure the database connection pool
 * - Export the Drizzle database instance
 * - Handle connection errors gracefully
 * 
 * WHAT THIS FILE MUST NOT DO:
 * - Contain any business logic
 * - Define table schemas (those are in shared/schema.ts)
 * - Execute queries directly (that's the repositories' job)
 * - Handle HTTP requests
 * 
 * DEPENDENT SYSTEMS:
 * - server/data/repositories/* use this connection for all database operations
 * - Connection string comes from DATABASE_URL environment variable
 * 
 * CONFIGURATION:
 * - DATABASE_URL: PostgreSQL connection string (required)
 * - Connection pool is managed by the pg library
 * =============================================================================
 */

import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "../../shared/schema";

const { Pool } = pkg;

/**
 * PostgreSQL connection pool configuration.
 * 
 * WHY: Connection pooling improves performance and resource management.
 * RULES: Pool size should be appropriate for expected concurrent connections.
 * NEVER: Create multiple pools - use this single instance.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Drizzle ORM database instance.
 * 
 * WHY: Provides type-safe database operations using the schema.
 * WHO: All repositories import this instance for database access.
 * RULES: Always use this instance, never create additional connections.
 * 
 * USAGE:
 * - Import { db } from "./db" in repository files
 * - Use db.select(), db.insert(), db.update(), db.delete() for operations
 */
export const db = drizzle(pool, { schema });
