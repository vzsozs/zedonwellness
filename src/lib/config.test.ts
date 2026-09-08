import { describe, expect, it } from "vitest";
import { formatHuf, isOrderOnly, ORDER_ONLY_THRESHOLD_HUF } from "./config";

describe("isOrderOnly", () => {
  it("is false below the threshold and true above it", () => {
    expect(isOrderOnly(ORDER_ONLY_THRESHOLD_HUF - 1)).toBe(false);
    expect(isOrderOnly(ORDER_ONLY_THRESHOLD_HUF + 1)).toBe(true);
  });

  it("treats exactly the threshold as still orderable online", () => {
    expect(isOrderOnly(ORDER_ONLY_THRESHOLD_HUF)).toBe(false);
  });

  it("honours the per-product flag regardless of price", () => {
    expect(isOrderOnly(1, true)).toBe(true);
  });
});

describe("formatHuf", () => {
  it("accepts the string form numeric columns come back as", () => {
    expect(formatHuf("1000")).toBe(formatHuf(1000));
  });
});
