import { getTranslations, getLocale } from "next-intl/server";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { Link } from "@/i18n/navigation";
import { localized } from "@/lib/localized";
import { FeaturedProductsTabs } from "@/components/home/featured-products-tabs";

const MAX_PER_TAB = 6;

export async function FeaturedProducts() {
  const t = await getTranslations("home");
  const locale = await getLocale();

  const featured = await db.query.products.findMany({
    where: eq(products.isFeatured, true),
    orderBy: [desc(products.createdAt)],
    with: { series: true, category: true },
  });

  if (featured.length === 0) return null;

  const cats = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.nameHu)],
  });

  const tabs = cats
    .map((cat) => ({
      slug: cat.slug,
      name: localized(locale, cat.nameHu, cat.nameEn),
      products: featured
        .filter((p) => p.categoryId === cat.id)
        .slice(0, MAX_PER_TAB),
    }))
    .filter((tab) => tab.products.length > 0);

  if (tabs.length === 0) return null;

  return (
    <section className="px-16 py-22 max-lg:px-6">
      <div className="mb-11 flex flex-col items-center gap-3 text-center">
        <div>
          <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
            {t("featuredEyebrow")}
          </div>
          <h2 className="mt-3.5 text-4xl font-bold">{t("featuredTitle")}</h2>
        </div>
        <Link href="/jakuzzik" className="text-sm font-bold hover:text-accent">
          {t("viewAll")} →
        </Link>
      </div>
      <FeaturedProductsTabs tabs={tabs} />
    </section>
  );
}
