import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { eq, asc } from "drizzle-orm";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { localized } from "@/lib/localized";
import { ProductCard } from "@/components/product-card";

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: categorySlug } = await params;
  setRequestLocale(locale as Locale);

  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  });
  if (!category) notFound();

  const productList = await db.query.products.findMany({
    where: eq(products.categoryId, category.id),
    orderBy: [asc(products.nameHu)],
  });
  const seriesList = [
    ...new Set(productList.map((p) => p.series).filter((s): s is string => Boolean(s))),
  ];

  const name = localized(locale, category.nameHu, category.nameEn);
  const description = localized(locale, category.descriptionHu ?? "", category.descriptionEn);

  return (
    <main>
      <div className="px-16 pt-10 max-lg:px-6">
        <div className="text-[13px] text-muted/80">
          <Link href="/" className="hover:text-accent">
            Főoldal
          </Link>{" "}
          / Termékek / <span className="font-semibold text-ink">{name}</span>
        </div>
        <div className="mt-5 flex items-end justify-between max-sm:flex-col max-sm:items-start max-sm:gap-3">
          <div>
            <h1 className="text-4xl font-semibold max-lg:text-3xl">{name}</h1>
            {description ? (
              <p className="mt-2.5 max-w-xl text-sm text-muted">{description}</p>
            ) : null}
          </div>
          <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
            {productList.length} termék
          </div>
        </div>
      </div>

      <div className="flex gap-10 px-16 pt-9 pb-25 max-lg:px-6 max-lg:flex-col">
        {/* Desktop filters — visual only for now; wired up once there's enough
            catalog volume to make filtering worthwhile. */}
        {seriesList.length > 0 ? (
          <aside className="w-59 shrink-0 max-lg:hidden">
            <div className="mb-5.5 border-b border-line pb-5.5">
              <div className="mb-4 text-[13px] font-bold tracking-wide text-ink uppercase">
                Sorozat
              </div>
              <div className="flex flex-col gap-3 text-sm text-muted">
                {seriesList.map((series) => (
                  <label key={series} className="flex items-center gap-2.5">
                    <input type="checkbox" className="accent-accent" />
                    {series}
                  </label>
                ))}
              </div>
            </div>
          </aside>
        ) : null}

        <div className="flex-1">
          {/* Mobile filters — horizontal chips */}
          {seriesList.length > 0 ? (
            <div className="mb-8 hidden flex-wrap gap-2.5 max-lg:flex">
              {seriesList.map((series) => (
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
      </div>
    </main>
  );
}
