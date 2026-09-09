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

/**
 * Sanitiser for article bodies coming from the Soro CMS.
 *
 * This HTML is written outside our system and rendered with
 * dangerouslySetInnerHTML on our own origin — the same origin that holds
 * the admin session cookie. It gets a wider allowlist than product
 * descriptions (headings, lists, images, tables) but still no script,
 * style, iframe, or event-handler attributes.
 */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "h2", "h3", "h4", "p", "br", "hr",
      "strong", "b", "em", "i", "u", "s",
      "ul", "ol", "li", "blockquote", "figure", "figcaption",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
      img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }),
    },
  }).trim();
}
