import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { db } from "@/db";
import { scoreProduct } from "@/lib/search";
import { ProductCard } from "@/components/product-card";

/** Search result pages are thin, endlessly variable duplicates of the
 * catalogue — useful to visitors, actively harmful in an index. */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("search");

  const { q } = await searchParams;
  const query = (q ?? "").trim().slice(0, 100);

  // Small catalogue (a few dozen items), so an in-memory scan beats standing
  // up full-text search — but only the fields the scorer and the cards read
  // are pulled, not the whole row.
  const results = query
    ? (
        await db.query.products.findMany({
          columns: {
            id: true,
            slug: true,
            nameHu: true,
            nameEn: true,
            shortDescriptionHu: true,
            shortDescriptionEn: true,
            sku: true,
            priceHuf: true,
        priceEur: true,
            priceOnRequest: true,
            capacity: true,
            seriesId: true,
            cardImage: true,
            mainImage: true,
            images: true,
            inStock: true,
            isNew: true,
            isOnSale: true,
          },
          with: { series: true },
        })
      )
        .map((product) => ({
          product,
          score: scoreProduct(
            { ...product, seriesName: product.series?.name ?? null },
            query,
            locale,
          ),
        }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.product)
    : [];

  return (
    <main className="px-16 pt-10 pb-25 max-lg:px-6">
      <h1 className="text-3xl font-semibold max-lg:text-2xl">{t("heading")}</h1>
      <p className="mt-2.5 text-sm text-muted">
        {query ? t("resultCount", { count: results.length, query }) : t("prompt")}
      </p>

      {query && results.length === 0 ? (
        <p className="mt-10 text-sm text-muted">{t("noResults")}</p>
      ) : results.length > 0 ? (
        <div className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-x-6 gap-y-6.5 max-sm:grid-cols-1">
          {results.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : null}
    </main>
  );
}
