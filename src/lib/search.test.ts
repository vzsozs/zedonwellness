import { describe, expect, it } from "vitest";
import { scoreProduct } from "./search";

const product = {
  nameHu: "Hőszivattyú 9 kW",
  nameEn: "Heat pump 9 kW",
  shortDescriptionHu: "Energiatakarékos vízmelegítés jakuzzihoz",
  shortDescriptionEn: "Energy-saving water heating for hot tubs",
  sku: "HP-9000",
  seriesName: "Aqua Excellent",
};

describe("scoreProduct", () => {
  it("returns 0 for an empty query", () => {
    expect(scoreProduct(product, "   ", "hu")).toBe(0);
  });

  it("matches without diacritics — how people actually type", () => {
    expect(scoreProduct(product, "hoszivattyu", "hu")).toBeGreaterThan(0);
  });

  it("ranks a name match above a description-only match", () => {
    const nameHit = scoreProduct(product, "hőszivattyú", "hu");
    const descHit = scoreProduct(product, "energiatakarékos", "hu");
    expect(nameHit).toBeGreaterThan(descHit);
  });

  it("finds a product by its SKU", () => {
    expect(scoreProduct(product, "HP-9000", "hu")).toBeGreaterThan(0);
  });

  it("finds a product by its series", () => {
    expect(scoreProduct(product, "aqua", "hu")).toBeGreaterThan(0);
  });

  it("finds a Hungarian-only product from the English site", () => {
    const huOnly = { ...product, nameEn: null, shortDescriptionEn: null };
    expect(scoreProduct(huOnly, "hőszivattyú", "en")).toBeGreaterThan(0);
  });

  it("returns 0 for an unrelated query", () => {
    expect(scoreProduct(product, "kerékpár", "hu")).toBe(0);
  });
});
