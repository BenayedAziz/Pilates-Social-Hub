import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    logger.info("No DATABASE_URL — skipping migrations");
    return;
  }

  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();
  const db = drizzle(client);

  logger.info("Running database migrations...");
  await migrate(db, {
    migrationsFolder: path.resolve(__dirname, "../../drizzle"),
  });
  logger.info("Migrations complete");

  await client.end();
}
