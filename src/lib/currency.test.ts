import { describe, expect, it } from "vitest";
import { eurToHuf, formatEur, hufToEur, roundToTen } from "./currency";

describe("roundToTen", () => {
  it("rounds to the nearest ten, not always up", () => {
    // The example the rounding rule was specified from (FEJLESZTESINAPLO 2026-09-02).
    expect(roundToTen(189_432.21)).toBe(189_430);
    expect(roundToTen(189_436)).toBe(189_440);
    expect(roundToTen(5)).toBe(10);
    expect(roundToTen(4)).toBe(0);
    expect(roundToTen(0)).toBe(0);
  });
});

describe("eurToHuf", () => {
  it("converts and rounds in one step", () => {
    expect(eurToHuf(1000, 398.5)).toBe(398_500);
    expect(eurToHuf(1234.56, 397.23)).toBe(490_400);
  });

  it("keeps a zero price at zero", () => {
    expect(eurToHuf(0, 400)).toBe(0);
  });
});

describe("hufToEur", () => {
  it("is the inverse of eurToHuf up to the 10 Ft rounding", () => {
    const rate = 397.23;
    const huf = eurToHuf(1234.56, rate);
    // Round-trip drift is bounded by the rounding step (5 Ft / rate).
    expect(Math.abs(hufToEur(huf, rate) - 1234.56)).toBeLessThan(5 / rate);
  });
});

describe("formatEur", () => {
  it("always shows two decimals", () => {
    expect(formatEur(1000)).toBe("1,000.00 €");
    expect(formatEur(0.5)).toBe("0.50 €");
  });
});
