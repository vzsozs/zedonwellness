import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { eq, and, asc, inArray, gte, lte } from "drizzle-orm";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { db } from "@/db";
import { categories, products, productSeries } from "@/db/schema";
import { localized } from "@/lib/localized";
import { ProductCard } from "@/components/product-card";
import { PriceRangeSlider } from "./price-range-slider";

export const revalidate = 60;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{
    seriesId?: string | string[];
    capacity?: string | string[];
    priceMin?: string;
    priceMax?: string;
  }>;
}) {
  const { locale, category: categorySlug } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("category");
  const tc = await getTranslations("common");

  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  });
  if (!category) notFound();

  const sp = await searchParams;
  const toIntArray = (v: string | string[] | undefined) =>
    (v ? (Array.isArray(v) ? v : [v]) : []).map(Number).filter(Number.isFinite);
  const selectedSeriesIds = toIntArray(sp.seriesId);
  const selectedCapacities = toIntArray(sp.capacity);
  const priceMinParam =
    sp.priceMin && Number.isFinite(Number(sp.priceMin)) ? Number(sp.priceMin) : null;
  const priceMaxParam =
    sp.priceMax && Number.isFinite(Number(sp.priceMax)) ? Number(sp.priceMax) : null;

  // Unfiltered snapshot of the category's products — drives the filter
  // options (available capacities, price bounds) so they stay stable as
  // the user narrows the list.
  const categoryProducts = await db
    .select({ priceHuf: products.priceHuf, capacity: products.capacity })
    .from(products)
    .where(eq(products.categoryId, category.id));

  const capacityOptions = [
    ...new Set(
      categoryProducts.map((p) => p.capacity).filter((c): c is number => c !== null),
    ),
  ].sort((a, b) => a - b);

  const prices = categoryProducts.map((p) => Number(p.priceHuf));
  const priceBoundsMin = prices.length > 0 ? Math.min(...prices) : 0;
  const priceBoundsMax = prices.length > 0 ? Math.max(...prices) : 0;
  const priceMin = priceMinParam ?? priceBoundsMin;
  const priceMax = priceMaxParam ?? priceBoundsMax;

  const conditions = [eq(products.categoryId, category.id)];
  if (selectedSeriesIds.length > 0) {
    conditions.push(inArray(products.seriesId, selectedSeriesIds));
  }
  if (selectedCapacities.length > 0) {
    conditions.push(inArray(products.capacity, selectedCapacities));
  }
  if (priceMinParam !== null) conditions.push(gte(products.priceHuf, String(priceMinParam)));
  if (priceMaxParam !== null) conditions.push(lte(products.priceHuf, String(priceMaxParam)));

  const [productList, seriesList] = await Promise.all([
    db.query.products.findMany({
      where: and(...conditions),
      orderBy: [asc(products.nameHu)],
      with: { series: true },
    }),
    db.query.productSeries.findMany({
      where: eq(productSeries.categoryId, category.id),
      orderBy: [asc(productSeries.sortOrder), asc(productSeries.name)],
    }),
  ]);

  const name = localized(locale, category.nameHu, category.nameEn);
  const description = localized(locale, category.descriptionHu ?? "", category.descriptionEn);

  const hasActiveFilters =
    selectedSeriesIds.length > 0 || selectedCapacities.length > 0 || priceMinParam !== null || priceMaxParam !== null;
  const basePath = `/${categorySlug}`;

  const filterFieldset = (
    <>
      {seriesList.length > 0 ? (
        <div className="mb-5.5 border-b border-line pb-5.5">
          <div className="mb-4 text-[13px] font-bold tracking-wide text-ink uppercase">
            {t("series")}
          </div>
          <div className="flex flex-col gap-3 text-sm text-muted">
            {seriesList.map((series) => (
              <label key={series.id} className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  name="seriesId"
                  value={series.id}
                  defaultChecked={selectedSeriesIds.includes(series.id)}
                  className="accent-accent"
                />
                {series.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {capacityOptions.length > 0 ? (
        <div className="mb-5.5 border-b border-line pb-5.5">
          <div className="mb-4 text-[13px] font-bold tracking-wide text-ink uppercase">
            {t("capacity")}
          </div>
          <div className="flex flex-col gap-3 text-sm text-muted">
            {capacityOptions.map((capacity) => (
              <label key={capacity} className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  name="capacity"
                  value={capacity}
                  defaultChecked={selectedCapacities.includes(capacity)}
                  className="accent-accent"
                />
                {t("capacityUnit", { capacity })}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {priceBoundsMax > priceBoundsMin ? (
        <div className="mb-5.5">
          <div className="mb-4 text-[13px] font-bold tracking-wide text-ink uppercase">
            {t("price")}
          </div>
          <PriceRangeSlider
            min={priceBoundsMin}
            max={priceBoundsMax}
            defaultMin={priceMin}
            defaultMax={priceMax}
          />
        </div>
      ) : null}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="h-10 flex-1 bg-ink text-sm font-semibold text-white hover:bg-accent-dark"
        >
          {t("filterSubmit")}
        </button>
        {hasActiveFilters ? (
          <Link href={basePath} className="text-sm text-muted underline hover:text-ink">
            {t("filterClear")}
          </Link>
        ) : null}
      </div>
    </>
  );

  return (
    <main>
      <div className="px-16 pt-10 max-lg:px-6">
        <div className="text-[13px] text-muted/80">
          <Link href="/" className="hover:text-accent">
            {tc("home")}
          </Link>{" "}
          / {tc("products")} / <span className="font-semibold text-ink">{name}</span>
        </div>
        <div className="mt-5 flex items-end justify-between max-sm:flex-col max-sm:items-start max-sm:gap-3">
          <div>
            <h1 className="text-4xl font-semibold max-lg:text-3xl">{name}</h1>
            {description ? (
              <p className="mt-2.5 max-w-xl text-sm text-muted">{description}</p>
            ) : null}
          </div>
          <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
            {t("productCount", { count: productList.length })}
          </div>
        </div>
      </div>

      <div className="flex gap-10 px-16 pt-9 pb-25 max-lg:px-6 max-lg:flex-col">
        {/* Desktop filters */}
        <aside className="w-64 shrink-0 max-lg:hidden">
          <form method="get" className="bg-[#f2f8fd] p-6">
            {filterFieldset}
          </form>
        </aside>

        <div className="flex-1">
          {/* Mobile filters */}
          <form
            method="get"
            className="mb-8 hidden bg-[#f2f8fd] p-5 max-lg:block"
          >
            {filterFieldset}
          </form>

          {productList.length === 0 ? (
            <p className="text-sm text-muted">
              {hasActiveFilters ? t("noResults") : t("comingSoon")}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-x-6 gap-y-6.5 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {productList.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
