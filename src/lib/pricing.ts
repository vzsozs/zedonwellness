import { getEurHufRate } from "@/lib/settings";
import { eurToHuf } from "@/lib/currency";

/**
 * Decides the HUF price to store for a product.
 *
 * EUR is the value the admin actually types; HUF is a derived, stored cache
 * of it (so every HUF-based query — filters, sorting, order totals — keeps
 * working unchanged). When the HUF field is unlocked (`manual`), the admin's
 * typed HUF wins and is never recomputed.
 *
 * The client sends a computed HUF preview alongside the form, but it is only
 * trusted in the `manual` branch — otherwise the value is recomputed here
 * from the current rate.
 *
 * Deliberately lives outside any "use server" module: it's a pure-ish helper,
 * and exporting it from an actions file would publish it as its own callable
 * Server Action endpoint.
 */
export async function resolvePrice(
  priceEur: number | null,
  submittedHuf: number,
  manual: boolean,
) {
  if (manual || priceEur === null) {
    return { priceHuf: submittedHuf, priceHufManual: manual };
  }
  return resolvePriceWithRate(priceEur, submittedHuf, manual, await getEurHufRate());
}

/** Same decision, with the rate passed in — for callers that resolve many
 * prices at once (CSV import) and shouldn't re-query the rate per row. */
export function resolvePriceWithRate(
  priceEur: number | null,
  submittedHuf: number,
  manual: boolean,
  rate: number,
) {
  if (manual || priceEur === null) {
    return { priceHuf: submittedHuf, priceHufManual: manual };
  }
  return { priceHuf: eurToHuf(priceEur, rate), priceHufManual: false };
}
