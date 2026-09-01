import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { categories, getCategory, getProductsByCategory } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: categorySlug } = await params;
  setRequestLocale(locale as Locale);

  const category = getCategory(categorySlug);
  if (!category) notFound();

  const productList = getProductsByCategory(categorySlug);
  const nav = await getTranslations("nav");

  return (
    <main>
      <div className="px-16 pt-10 max-lg:px-6">
        <div className="text-[13px] text-muted/80">
          <Link href="/" className="hover:text-accent">
            Főoldal
          </Link>{" "}
          / Termékek /{" "}
          <span className="font-semibold text-ink">{nav(category.navKey)}</span>
        </div>
        <div className="mt-5 flex items-end justify-between max-sm:flex-col max-sm:items-start max-sm:gap-3">
          <div>
            <h1 className="text-4xl font-semibold max-lg:text-3xl">
              {nav(category.navKey)}
            </h1>
            <p className="mt-2.5 max-w-xl text-sm text-muted">
              {category.subtitleHu}
            </p>
          </div>
          <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
            {productList.length} termék
          </div>
        </div>
      </div>

      <div className="px-16 pt-9 pb-25 max-lg:px-6">
        {/* Filters — visual only for now; wired up once the catalog is backed by real data. */}
        {[...new Set(productList.map((p) => p.series))].length > 0 ? (
          <div className="mb-8 flex flex-wrap gap-2.5">
            {[...new Set(productList.map((p) => p.series))].map((series) => (
              <button
                key={series}
                type="button"
                className="flex h-10 min-w-35 flex-1 items-center justify-center border border-line px-4.5 text-sm font-semibold whitespace-nowrap text-ink hover:border-ink"
              >
                {series}
              </button>
            ))}
          </div>
        ) : null}

        {productList.length === 0 ? (
          <p className="text-sm text-muted">
            Ebben a kategóriában hamarosan elérhetők lesznek termékek.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-x-6 gap-y-6.5 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {productList.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
