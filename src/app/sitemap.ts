import type { MetadataRoute } from "next";
import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { routing } from "@/i18n/routing";
import { IS_STAGING, localeUrl } from "@/lib/seo";
import { getSoroArticles } from "@/lib/soro";

/**
 * Generated per request rather than at build time.
 *
 * The Docker build runs before the database container is reachable (see
 * FEJLESZTESINAPLO 2026-09-01 on why generateStaticParams was removed for
 * the same reason), so prerendering this would fail the image build. It is
 * one small query and crawlers fetch it rarely.
 */
export const dynamic = "force-dynamic";

/** Every static storefront route, with how important/fresh it is. */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/a-ceg", priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/impresszum", priority: 0.2, changeFrequency: "yearly" },
  { path: "/aszf", priority: 0.2, changeFrequency: "yearly" },
  { path: "/adatvedelem", priority: 0.2, changeFrequency: "yearly" },
];

/** One sitemap entry per locale, cross-linked with hreflang alternates. */
function entriesForPath(
  path: string,
  options: {
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    lastModified?: Date;
  },
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, localeUrl(path, l)]),
  );

  return routing.locales.map((locale) => ({
    url: localeUrl(path, locale),
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // The staging domain is fully disallowed in robots.txt — publishing a
  // sitemap there would only invite crawling it anyway.
  if (IS_STAGING) return [];

  const [categoryRows, productRows, articles] = await Promise.all([
    db.query.categories.findMany({
      columns: { slug: true },
      orderBy: [asc(categories.sortOrder)],
    }),
    db.query.products.findMany({
      columns: { slug: true, updatedAt: true },
      orderBy: [desc(products.updatedAt)],
    }),
    getSoroArticles().catch(() => []),
  ]);

  return [
    ...STATIC_ROUTES.flatMap((r) =>
      entriesForPath(r.path, { priority: r.priority, changeFrequency: r.changeFrequency }),
    ),
    ...categoryRows.flatMap((c) =>
      entriesForPath(`/${c.slug}`, { priority: 0.9, changeFrequency: "weekly" }),
    ),
    ...productRows.flatMap((p) =>
      entriesForPath(`/termek/${p.slug}`, {
        priority: 0.8,
        changeFrequency: "weekly",
        lastModified: p.updatedAt,
      }),
    ),
    ...articles.flatMap((a) =>
      entriesForPath(`/blog/${a.slug}`, {
        priority: 0.6,
        changeFrequency: "monthly",
        lastModified: a.isoDate ? new Date(a.isoDate) : undefined,
      }),
    ),
  ];
}
