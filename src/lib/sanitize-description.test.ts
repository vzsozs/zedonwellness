import { describe, expect, it } from "vitest";
import {
  looksLikeHtml,
  plainTextToHtml,
  sanitizeArticleHtml,
  sanitizeDescription,
} from "./sanitize-description";

describe("sanitizeDescription", () => {
  it("keeps the allowed formatting tags", () => {
    expect(sanitizeDescription("<p>Egy <strong>fontos</strong> mondat.</p>")).toBe(
      "<p>Egy <strong>fontos</strong> mondat.</p>",
    );
  });

  it("strips scripts and event handlers", () => {
    expect(sanitizeDescription('<p onclick="steal()">x</p><script>steal()</script>')).toBe(
      "<p>x</p>",
    );
  });

  it("rejects javascript: links", () => {
    expect(sanitizeDescription('<a href="javascript:alert(1)">x</a>')).not.toContain(
      "javascript:",
    );
  });

  it("forces external links to open safely", () => {
    const out = sanitizeDescription('<a href="https://example.com">x</a>');
    expect(out).toContain('rel="noopener noreferrer"');
  });
});

describe("sanitizeArticleHtml", () => {
  it("keeps the richer markup a CMS article needs", () => {
    const html = "<h2>Cím</h2><ul><li>egy</li></ul><img src=\"https://cdn/x.jpg\" alt=\"x\">";
    const out = sanitizeArticleHtml(html);
    expect(out).toContain("<h2>Cím</h2>");
    expect(out).toContain("<li>egy</li>");
    expect(out).toContain("<img");
  });

  it("still strips scripts, iframes and styles from third-party HTML", () => {
    const out = sanitizeArticleHtml(
      '<p>ok</p><script>x()</script><iframe src="//evil"></iframe><style>*{}</style>',
    );
    expect(out).toBe("<p>ok</p>");
  });

  it("removes inline event handlers on allowed tags", () => {
    expect(sanitizeArticleHtml('<p onmouseover="x()">hi</p>')).toBe("<p>hi</p>");
  });
});

describe("plainTextToHtml", () => {
  it("turns blank-line-separated blocks into paragraphs", () => {
    expect(plainTextToHtml("egy\nkettő\n\nhárom")).toBe("<p>egy<br>kettő</p><p>három</p>");
  });
});

describe("looksLikeHtml", () => {
  it("distinguishes markup from plain text", () => {
    expect(looksLikeHtml("<p>x</p>")).toBe(true);
    expect(looksLikeHtml("sima szöveg")).toBe(false);
  });
});
