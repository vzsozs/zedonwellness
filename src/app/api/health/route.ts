import { sql } from "drizzle-orm";
import { db } from "@/db";

/** Liveness/readiness probe for the container healthcheck. Touches the DB,
 * so a running-but-disconnected app reports unhealthy instead of "up". */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "degraded", database: "unreachable" }, { status: 503 });
  }
}
