import { describe, expect, it } from "vitest";
import { normalizeArUrl } from "./ar-url";

describe("normalizeArUrl", () => {
  it("leaves a well-formed URL alone", () => {
    expect(normalizeArUrl("https://archevio.com/view?id=1&lang=en")).toBe(
      "https://archevio.com/view?id=1&lang=en",
    );
  });

  it("repairs a first parameter written with & instead of ?", () => {
    expect(normalizeArUrl("https://archevio.com/view&lang=en")).toBe(
      "https://archevio.com/view?lang=en",
    );
  });

  it("leaves a URL with no parameters alone", () => {
    expect(normalizeArUrl("https://archevio.com/view")).toBe("https://archevio.com/view");
  });
});
