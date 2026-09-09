import { describe, expect, it } from "vitest";
import { resolvePriceWithRate } from "./pricing";

const RATE = 398.5;

describe("resolvePriceWithRate", () => {
  it("computes HUF from EUR when the field is locked", () => {
    expect(resolvePriceWithRate(1000, 0, false, RATE)).toEqual({
      priceHuf: 398_500,
      priceHufManual: false,
    });
  });

  it("ignores the client's submitted HUF while locked", () => {
    // The browser sends a computed preview alongside the form; trusting it
    // would let a tampered request set any price it liked.
    expect(resolvePriceWithRate(1000, 1, false, RATE).priceHuf).toBe(398_500);
  });

  it("keeps the typed HUF when the field is unlocked", () => {
    expect(resolvePriceWithRate(1000, 350_000, true, RATE)).toEqual({
      priceHuf: 350_000,
      priceHufManual: true,
    });
  });

  it("falls back to the submitted HUF for a product with no EUR price", () => {
    expect(resolvePriceWithRate(null, 250_000, false, RATE)).toEqual({
      priceHuf: 250_000,
      priceHufManual: false,
    });
  });

  it("treats an empty EUR field as 'no price', not as zero", () => {
    // Regression guard: a zod union ordering bug once coerced a blank EUR
    // field to 0 and wrote 0 Ft onto a real product
    // (FEJLESZTESINAPLO 2026-09-02).
    expect(resolvePriceWithRate(null, 189_900, false, RATE).priceHuf).toBe(189_900);
  });

  it("keeps a genuine zero EUR price at zero", () => {
    expect(resolvePriceWithRate(0, 999, false, RATE).priceHuf).toBe(0);
  });
});
