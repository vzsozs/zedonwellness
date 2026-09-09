import { describe, expect, it, vi, beforeEach } from "vitest";

const rows = vi.hoisted(() => ({
  products: [] as Record<string, unknown>[],
  variants: [] as Record<string, unknown>[],
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      products: { findMany: async () => rows.products },
      productVariants: { findMany: async () => rows.variants },
    },
  },
}));

const { resolveCart } = await import("./cart-validation");

function product(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    slug: "hc-design-5",
    nameHu: "HC Design 5",
    nameEn: "HC Design 5",
    priceHuf: "2500000",
    weightKg: "480.00",
    inStock: true,
    priceOnRequest: false,
    orderOnly: false,
    mainImage: "/uploads/products/a.webp",
    cardImage: null,
    ...over,
  };
}

function variant(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: 10,
    productId: 1,
    nameHu: "Levendula",
    nameEn: "Lavender",
    priceHuf: "3900",
    weightKg: "0.50",
    imageUrl: null,
    inStock: true,
    ...over,
  };
}

beforeEach(() => {
  rows.products = [product()];
  rows.variants = [];
});

describe("resolveCart", () => {
  it("prices a plain line from the database, not from the client", () => {
    // (the client sends priceHuf only so a change can be reported)
    return resolveCart([{ productId: 1, variantId: null, quantity: 2, priceHuf: 1 }]).then(
      (cart) => {
        expect(cart.lines[0].priceHuf).toBe(2_500_000);
        expect(cart.subtotalHuf).toBe(5_000_000);
        expect(cart.lines[0].issues).toContain("priceChanged");
      },
    );
  });

  it("reports no issue when the cached price still matches", async () => {
    const cart = await resolveCart([
      { productId: 1, variantId: null, quantity: 1, priceHuf: 2_500_000 },
    ]);
    expect(cart.lines[0].issues).toEqual([]);
    expect(cart.blockingIssues).toBe(false);
  });

  it("refuses a variant that belongs to a different product", async () => {
    // The attack this guards against: pair an expensive product with a
    // cheap variant's id and pay the cheap price.
    rows.variants = [variant({ id: 10, productId: 999 })];
    const cart = await resolveCart([{ productId: 1, variantId: 10, quantity: 1 }]);

    expect(cart.lines[0].issues).toContain("variantUnavailable");
    expect(cart.lines[0].priceHuf).toBe(2_500_000);
    expect(cart.blockingIssues).toBe(true);
  });

  it("uses the variant's own price when it does belong to the product", async () => {
    rows.variants = [variant()];
    const cart = await resolveCart([{ productId: 1, variantId: 10, quantity: 3 }]);

    expect(cart.lines[0].priceHuf).toBe(3900);
    expect(cart.lines[0].variantNameHu).toBe("Levendula");
    expect(cart.subtotalHuf).toBe(11_700);
  });

  it("blocks an out-of-stock product", async () => {
    rows.products = [product({ inStock: false })];
    const cart = await resolveCart([{ productId: 1, variantId: null, quantity: 1 }]);
    expect(cart.lines[0].issues).toContain("outOfStock");
    expect(cart.blockingIssues).toBe(true);
  });

  it("blocks an out-of-stock variant of an in-stock product", async () => {
    rows.variants = [variant({ inStock: false })];
    const cart = await resolveCart([{ productId: 1, variantId: 10, quantity: 1 }]);
    expect(cart.lines[0].issues).toContain("outOfStock");
  });

  it("blocks a price-on-request product", async () => {
    // These carry priceHuf "0" only to satisfy NOT NULL — ordering one
    // would create a 0 Ft order.
    rows.products = [product({ priceOnRequest: true, priceHuf: "0" })];
    const cart = await resolveCart([{ productId: 1, variantId: null, quantity: 1 }]);
    expect(cart.lines[0].issues).toContain("priceOnRequest");
    expect(cart.blockingIssues).toBe(true);
  });

  it("blocks a product that no longer exists", async () => {
    rows.products = [];
    const cart = await resolveCart([{ productId: 1, variantId: null, quantity: 1 }]);
    expect(cart.lines[0].issues).toEqual(["unavailable"]);
    expect(cart.blockingIssues).toBe(true);
  });

  it("marks a line order-only when the variant crosses the threshold", async () => {
    // Base price is below the limit, the variant is above it.
    rows.products = [product({ priceHuf: "900000" })];
    rows.variants = [variant({ priceHuf: "1400000" })];
    const cart = await resolveCart([{ productId: 1, variantId: 10, quantity: 1 }]);
    expect(cart.lines[0].orderOnly).toBe(true);
  });

  it("cannot get an automatic shipping quote when any weight is missing", async () => {
    rows.products = [product({ weightKg: null })];
    const cart = await resolveCart([{ productId: 1, variantId: null, quantity: 1 }]);
    expect(cart.totalWeightKg).toBeNull();
  });

  it("sums weights across quantities", async () => {
    rows.variants = [variant()];
    const cart = await resolveCart([{ productId: 1, variantId: 10, quantity: 4 }]);
    expect(cart.totalWeightKg).toBeCloseTo(2);
  });

  it("returns an empty, unblocked cart for no items", async () => {
    const cart = await resolveCart([]);
    expect(cart).toEqual({
      lines: [],
      blockingIssues: false,
      subtotalHuf: 0,
      totalWeightKg: 0,
    });
  });
});
