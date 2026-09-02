import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

const EUR_HUF_RATE_KEY = "eur_huf_rate";
// Placeholder until set in /admin/settings — not a live rate.
const DEFAULT_EUR_HUF_RATE = 400;

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

export async function getEurHufRate(): Promise<number> {
  const raw = await getSetting(EUR_HUF_RATE_KEY);
  const rate = raw ? Number(raw) : NaN;
  return Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_EUR_HUF_RATE;
}

export async function setEurHufRate(rate: number): Promise<void> {
  await setSetting(EUR_HUF_RATE_KEY, String(rate));
}
