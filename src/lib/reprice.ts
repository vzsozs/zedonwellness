import { and, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, extras, productFeatures } from "@/db/schema";

/**
 * Recomputes every stored HUF price from its EUR source at a new rate.
 *
 * EUR is what the admin types; HUF is a cache of it, written at save time.
 * Without this, changing the rate left the whole catalogue on prices
 * computed at the *old* rate, while the storefront's EUR display divided
 * those stale forints by the *new* rate — so the euro price drifted further
 * from the entered one after every update.
 *
 * Rows with `priceHufManual` set are skipped: the admin unlocked the field
 * and typed a specific forint amount, which must not be overwritten.
 *
 * Done as three set-based UPDATEs rather than a read-modify-write loop —
 * `roundToTen` is just ROUND(x/10)*10, which Postgres can do itself.
 */
export type RepriceResult = { products: number; extras: number; features: number };

/** SQL mirror of roundToTen(eur * rate) in src/lib/currency.ts. */
function repricedHuf(column: string, rate: number) {
  return sql.raw(`ROUND(${column} * ${rate} / 10) * 10`);
}

export async function repriceCatalog(rate: number): Promise<RepriceResult> {
  return db.transaction(async (tx) => {
    const productRows = await tx
      .update(products)
      .set({ priceHuf: repricedHuf('"price_eur"', rate), updatedAt: new Date() })
      .where(and(isNotNull(products.priceEur), eq(products.priceHufManual, false)))
      .returning({ id: products.id });

    const extraRows = await tx
      .update(extras)
      .set({ priceHuf: repricedHuf('"price_eur"', rate) })
      .where(isNotNull(extras.priceEur))
      .returning({ id: extras.id });

    const featureRows = await tx
      .update(productFeatures)
      .set({ priceHuf: repricedHuf('"price_eur"', rate) })
      .where(isNotNull(productFeatures.priceEur))
      .returning({ id: productFeatures.id });

    return {
      products: productRows.length,
      extras: extraRows.length,
      features: featureRows.length,
    };
  });
}
