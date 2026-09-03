import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const { db } = await import("../../src/db");
  const { extras } = await import("../../src/db/schema");
  const { isNull, eq, and, ne } = await import("drizzle-orm");
  const { getEurHufRate } = await import("../../src/lib/settings");
  const { hufToEur, eurToHuf } = await import("../../src/lib/currency");

  const rate = await getEurHufRate();
  const candidates = await db.query.extras.findMany({
    where: and(isNull(extras.priceEur), ne(extras.priceHuf, "0")),
  });
  console.log(`Using rate ${rate}. ${candidates.length} extras with priceHuf but no priceEur.`);

  for (const e of candidates) {
    const priceEur = Math.round(hufToEur(Number(e.priceHuf), rate) * 100) / 100;
    const newPriceHuf = eurToHuf(priceEur, rate);
    await db.update(extras).set({ priceEur: String(priceEur), priceHuf: String(newPriceHuf) }).where(eq(extras.id, e.id));
    console.log(`  ${e.nameHu}: ${e.priceHuf} Ft -> ${priceEur} EUR (~${newPriceHuf} Ft)`);
  }
  console.log("Done.");
}
main();
