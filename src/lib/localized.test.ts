import { describe, expect, it } from "vitest";
import { localized } from "./localized";

describe("localized", () => {
  it("uses Hungarian on the Hungarian site", () => {
    expect(localized("hu", "Szauna", "Sauna")).toBe("Szauna");
  });

  it("uses English on the English site", () => {
    expect(localized("en", "Szauna", "Sauna")).toBe("Sauna");
  });

  it("falls back to Hungarian when the translation is missing or blank", () => {
    // Most catalogue content is only entered in Hungarian, so this is the
    // common path, not an edge case.
    expect(localized("en", "Szauna", null)).toBe("Szauna");
    expect(localized("en", "Szauna", "")).toBe("Szauna");
  });
});
