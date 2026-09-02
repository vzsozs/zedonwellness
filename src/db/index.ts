import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// In dev, Next.js Fast Refresh re-evaluates this module on every edit to a file
// that imports it, which would otherwise leak a new Pool (and its DB connections)
// on each save. Caching the pool on `globalThis` makes it survive HMR reloads.
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
