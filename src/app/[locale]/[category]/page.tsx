import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { eq, asc } from "drizzle-orm";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { db } from "@/db";
import { categories, products, productSeries } from "@/db/schema";
import { localized } from "@/lib/localized";
import { CategoryBrowser } from "./category-browser";
import { SaunaBanner } from "@/components/category/sauna-banner";

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: categorySlug } = await params;
  setRequestLocale(locale as Locale);
  const tc = await getTranslations("common");

  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  });
  if (!category) notFound();

  // The whole category's products load once and are filtered/sorted live
  // in the browser (small catalog sizes make this simpler and snappier
  // than a server round-trip per filter change).
  const [productList, seriesList] = await Promise.all([
    db.query.products.findMany({
      where: eq(products.categoryId, category.id),
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

  return (
    <main>
      <div className="px-16 pt-10 max-lg:px-6">
        <div className="text-[13px] text-muted/80">
          <Link href="/" className="hover:text-accent">
            {tc("home")}
          </Link>{" "}
          / {tc("products")} / <span className="font-semibold text-ink">{name}</span>
        </div>
      </div>

      <CategoryBrowser
        name={name}
        description={description}
        products={productList}
        seriesList={seriesList}
        banner={categorySlug === "szaunak" ? <SaunaBanner /> : null}
      />
    </main>
  );
}
