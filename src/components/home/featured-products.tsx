import { getTranslations, getLocale } from "next-intl/server";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { ArrowRight } from "lucide-react";
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
    columns: {
      id: true,
      slug: true,
      nameHu: true,
      nameEn: true,
      shortDescriptionHu: true,
      shortDescriptionEn: true,
      priceHuf: true,
      priceEur: true,
      priceOnRequest: true,
      capacity: true,
      seriesId: true,
      categoryId: true,
      cardImage: true,
      mainImage: true,
      images: true,
      inStock: true,
      isNew: true,
      isOnSale: true,
      specs: true,
    },
    with: { series: true },
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
    <section className="mx-auto max-w-[1480px] px-[5%] py-22 max-lg:px-6">
      <div className="mb-11 flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-start">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-coprBlue/30 bg-coprBlue/10 px-4 py-1.5 text-[11.5px] font-bold tracking-[0.1em] text-coprBlue uppercase">
            {t("featuredEyebrow")}
          </div>
          <h2 className="text-[42px] leading-tight font-bold tracking-[-0.01em] text-ink max-lg:text-3xl">
            {t("featuredTitle")}
          </h2>
        </div>
        <Link
          href="/jakuzzik"
          className="rounded-control inline-flex shrink-0 items-center gap-2 border-[1.5px] border-ink px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
        >
          {t("viewAll")}
          <ArrowRight className="size-4" strokeWidth={2.5} />
        </Link>
      </div>
      <FeaturedProductsTabs tabs={tabs} />
    </section>
  );
}
