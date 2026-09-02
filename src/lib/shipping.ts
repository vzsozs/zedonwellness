import { db } from "@/db";
import { shippingRates } from "@/db/schema";
import { eq } from "drizzle-orm";

export type ShippingZone = "domestic" | "international";

/** Derives the shipping zone from the selected country's ISO code — no
 * explicit zone picker needed, the address dropdown decides. */
export function zoneFromCountryCode(countryCode: string): ShippingZone {
  return countryCode === "HU" ? "domestic" : "international";
}

export type ShippingQuote =
  | { requiresQuote: false; priceHuf: number }
  | { requiresQuote: true; priceHuf: null };

/**
 * `totalWeightKg` is null when the cart contains a product with no weight
 * set in the admin — in that case we can't pick a band, so it always comes
 * back as requiring a manual quote rather than silently guessing a price.
 */
export async function getShippingQuote(
  zone: ShippingZone,
  totalWeightKg: number | null,
): Promise<ShippingQuote> {
  if (totalWeightKg === null) return { requiresQuote: true, priceHuf: null };

  const rates = await db.query.shippingRates.findMany({
    where: eq(shippingRates.zone, zone),
  });
  const match = rates.find(
    (r) =>
      totalWeightKg >= Number(r.minKg) &&
      (r.maxKg === null || totalWeightKg <= Number(r.maxKg)),
  );

  if (!match || match.requiresQuote || match.priceHuf === null) {
    return { requiresQuote: true, priceHuf: null };
  }
  return { requiresQuote: false, priceHuf: Number(match.priceHuf) };
}
