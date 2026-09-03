// One-off: the migration scripts wrote priceHuf directly (no priceEur),
// but the admin price editor requires EUR as the primary input — leaving
// priceEur null there shows a blank, required EUR field and a HUF field
// that silently reads as 0. Backfills priceEur from the current priceHuf
// at today's rate, then recomputes priceHuf from that EUR (rounded to the
// nearest 10) so everything is consistent with the normal EUR-primary flow
// going forward. The HUF value is allowed to drift slightly — expected and
// approved by the user.
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const { db } = await import("../../src/db");
  const { products } = await import("../../src/db/schema");
  const { isNull, eq, and, ne } = await import("drizzle-orm");
  const { getEurHufRate } = await import("../../src/lib/settings");
  const { hufToEur, eurToHuf } = await import("../../src/lib/currency");

  const rate = await getEurHufRate();
  console.log(`Using rate: ${rate} Ft/EUR`);

  const candidates = await db.query.products.findMany({
    where: and(isNull(products.priceEur), eq(products.priceOnRequest, false), ne(products.priceHuf, "0")),
  });

  console.log(`${candidates.length} products with priceHuf but no priceEur.`);

  for (const p of candidates) {
    const priceEur = Math.round(hufToEur(Number(p.priceHuf), rate) * 100) / 100;
    const newPriceHuf = eurToHuf(priceEur, rate);
    await db
      .update(products)
      .set({ priceEur: String(priceEur), priceHuf: String(newPriceHuf) })
      .where(eq(products.id, p.id));
  }

  console.log(`Done. Backfilled priceEur on ${candidates.length} products.`);
}

main();
