import sanitizeHtml from "sanitize-html";

export function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

/** Converts legacy plain-text descriptions (pre rich-text editor) into HTML paragraphs. */
export function plainTextToHtml(value: string): string {
  return value
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function sanitizeDescription(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "strong", "em", "u", "a", "br"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
  }).trim();
}
