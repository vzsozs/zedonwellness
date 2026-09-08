import { describe, expect, it } from "vitest";
import { alternatesFor, localeUrl, toMetaDescription, jsonLdScript } from "./seo";

describe("localeUrl", () => {
  it("leaves the default locale unprefixed and prefixes the other", () => {
    expect(localeUrl("/termek/hc-1", "hu")).toMatch(/\/termek\/hc-1$/);
    expect(localeUrl("/termek/hc-1", "en")).toMatch(/\/en\/termek\/hc-1$/);
  });

  it("never produces a bare origin without a trailing slash", () => {
    expect(localeUrl("/", "hu")).toMatch(/\/$/);
  });
});

describe("alternatesFor", () => {
  it("emits both languages plus x-default", () => {
    const alt = alternatesFor("/szaunak", "en");
    expect(alt?.canonical).toMatch(/\/en\/szaunak$/);
    const langs = alt?.languages as Record<string, string>;
    expect(Object.keys(langs).sort()).toEqual(["en", "hu", "x-default"]);
    // x-default points at the Hungarian version, the site's default.
    expect(langs["x-default"]).toBe(langs.hu);
  });
});

describe("toMetaDescription", () => {
  it("strips markup and collapses whitespace", () => {
    expect(toMetaDescription("<p>Egy   <strong>jó</strong>\nleírás.</p>")).toBe(
      "Egy jó leírás.",
    );
  });

  it("truncates on a word boundary", () => {
    const out = toMetaDescription("szó ".repeat(100));
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith("…")).toBe(true);
  });

  it("returns an empty string for missing copy", () => {
    expect(toMetaDescription(null)).toBe("");
  });
});

describe("jsonLdScript", () => {
  it("escapes < so the payload cannot close its own script tag", () => {
    const out = jsonLdScript({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out.replace(/\\u003c/g, "<")).name).toContain("</script>");
  });
});
