import { logger } from "./logger";

// ---------------------------------------------------------------------------
// Lazy-initialised Drizzle database connection.
//
// - If DATABASE_URL is set, returns a real Drizzle db + schema object.
// - If DATABASE_URL is not set (local dev without Postgres), returns null so
//   callers can fall back to the in-memory mock arrays.
// - The connection is created once and reused for the lifetime of the process.
// ---------------------------------------------------------------------------

let cached: { db: any; schema: any } | null | undefined;

/**
 * Returns `{ db, schema }` when a real Postgres connection is available,
 * or `null` when DATABASE_URL is not set / connection fails.
 */
export async function getDatabase(): Promise<{ db: any; schema: any } | null> {
  // Return cached result (including cached null for "no database")
  if (cached !== undefined) return cached;

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    logger.info("No DATABASE_URL set — using in-memory mock data");
    cached = null;
    return null;
  }

  try {
    // Dynamic imports so nothing explodes when DATABASE_URL is absent.
    // @workspace/db throws if DATABASE_URL is unset at import time, so we
    // only import when we know the env var is present.
    const { db } = await import("@workspace/db");
    const dbSchema = await import("@workspace/db/schema");

    // Quick connectivity check
    const { pool } = await import("@workspace/db");
    await pool.query("SELECT 1");

    cached = { db, schema: dbSchema };
    logger.info("Connected to PostgreSQL database");
    return cached;
  } catch (error) {
    logger.warn(
      { error: error instanceof Error ? error.message : error },
      "Failed to connect to database — falling back to mock data",
    );
    cached = null;
    return null;
  }
}
