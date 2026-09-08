import { describe, expect, it, vi, beforeEach } from "vitest";

// The shipping quote is the one piece of order maths that reads from the
// database, so the rate table is stubbed rather than stood up.
const rates = vi.hoisted(() => ({ value: [] as unknown[] }));

vi.mock("@/db", () => ({
  db: { query: { shippingRates: { findMany: async () => rates.value } } },
}));

const { getShippingQuote, zoneFromCountryCode } = await import("./shipping");

const DOMESTIC_BANDS = [
  { zone: "domestic", minKg: "0", maxKg: "10", priceHuf: "2990", requiresQuote: false },
  { zone: "domestic", minKg: "10", maxKg: "20", priceHuf: "4490", requiresQuote: false },
  { zone: "domestic", minKg: "20", maxKg: "40", priceHuf: "7990", requiresQuote: false },
  // Open-ended top band: over 40 kg is always an individual quote.
  { zone: "domestic", minKg: "40", maxKg: null, priceHuf: null, requiresQuote: true },
];

beforeEach(() => {
  rates.value = DOMESTIC_BANDS;
});

describe("zoneFromCountryCode", () => {
  it("treats only HU as domestic", () => {
    expect(zoneFromCountryCode("HU")).toBe("domestic");
    expect(zoneFromCountryCode("AT")).toBe("international");
    expect(zoneFromCountryCode("")).toBe("international");
  });
});

describe("getShippingQuote", () => {
  it("picks the band the weight falls into", async () => {
    expect(await getShippingQuote("domestic", 5)).toEqual({
      requiresQuote: false,
      priceHuf: 2990,
    });
    expect(await getShippingQuote("domestic", 15)).toEqual({
      requiresQuote: false,
      priceHuf: 4490,
    });
    expect(await getShippingQuote("domestic", 35)).toEqual({
      requiresQuote: false,
      priceHuf: 7990,
    });
  });

  it("requires a quote above the last closed band", async () => {
    expect(await getShippingQuote("domestic", 45)).toEqual({
      requiresQuote: true,
      priceHuf: null,
    });
  });

  it("never guesses when a product has no weight", async () => {
    expect(await getShippingQuote("domestic", null)).toEqual({
      requiresQuote: true,
      priceHuf: null,
    });
  });

  it("requires a quote when no band matches at all", async () => {
    rates.value = [];
    expect(await getShippingQuote("domestic", 5)).toEqual({
      requiresQuote: true,
      priceHuf: null,
    });
  });

  it("resolves a boundary weight to the first matching band", async () => {
    // 10 kg sits in both the 0–10 and 10–20 bands; the earlier one wins,
    // which is the cheaper of the two.
    expect(await getShippingQuote("domestic", 10)).toEqual({
      requiresQuote: false,
      priceHuf: 2990,
    });
  });

  it("handles a zero-weight cart", async () => {
    expect(await getShippingQuote("domestic", 0)).toEqual({
      requiresQuote: false,
      priceHuf: 2990,
    });
  });
});
