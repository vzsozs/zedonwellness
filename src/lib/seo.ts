import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/**
 * Canonical origin for every absolute URL the site emits (metadataBase,
 * sitemap, JSON-LD). Falls back to localhost so builds work without env.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const IS_STAGING = process.env.NEXT_PUBLIC_STAGING_NOINDEX === "true";

/**
 * Builds the absolute URL for a path in a given locale, matching the
 * `localePrefix: "as-needed"` routing: Hungarian is unprefixed, English
 * lives under /en.
 */
export function localeUrl(path: string, locale: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  if (path === "/" || path === "") {
    // The canonical for a site root is "https://host/" — without the
    // trailing slash it and "https://host" read as two URLs.
    return `${SITE_URL}${prefix}/`;
  }
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${prefix}${clean}`;
}

/**
 * Canonical + hreflang alternates for one page.
 *
 * Both are required for an HU/EN site: without a canonical, the same content
 * reachable at several URLs competes with itself; without hreflang, Google
 * can't tell the two language versions are a pair.
 */
export function alternatesFor(path: string, locale: string): Metadata["alternates"] {
  return {
    canonical: localeUrl(path, locale),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, localeUrl(path, l)])),
      "x-default": localeUrl(path, routing.defaultLocale),
    },
  };
}

/** Shared page metadata: title/description, canonical + hreflang, Open Graph. */
export function pageMetadata({
  title,
  description,
  path,
  locale,
  images,
  type = "website",
}: {
  title: string;
  description?: string;
  path: string;
  locale: string;
  images?: string[];
  type?: "website" | "article";
}): Metadata {
  const url = localeUrl(path, locale);
  return {
    title,
    description,
    alternates: alternatesFor(path, locale),
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: "Zedonwellness",
      locale: locale === "en" ? "en_US" : "hu_HU",
      ...(images && images.length > 0 ? { images } : {}),
    },
    twitter: {
      card: images && images.length > 0 ? "summary_large_image" : "summary",
      title,
      description,
      ...(images && images.length > 0 ? { images } : {}),
    },
  };
}

/** Trims HTML and collapses whitespace into a meta-description-sized string. */
export function toMetaDescription(html: string | null | undefined, max = 160): string {
  if (!html) return "";
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

/** Renders a JSON-LD blob. Kept as a helper so every caller escapes the
 * same way — `<` inside a script tag would otherwise end it early. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
