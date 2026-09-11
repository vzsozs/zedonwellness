	import { getTranslations, getLocale } from "next-intl/server";
import { asc, count, desc } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { SafeImage } from "@/components/safe-image";
import { getCategoryVisual } from "@/lib/visuals";
import { localized } from "@/lib/localized";

export async function CategoryGrid() {
  const t = await getTranslations("home");
  const tc = await getTranslations("category");
  const locale = await getLocale();
  // A kártya feliratának darabszáma a katalógusból származik, nem
  // kézzel karbantartott szövegből — így nem tud elcsúszni attól, ami a
  // kategóriára kattintva ténylegesen látszik.
  const productCounts = await db
    .select({ categoryId: products.categoryId, total: count() })
    .from(products)
    .groupBy(products.categoryId);
  const countByCategory = new Map(productCounts.map((r) => [r.categoryId, r.total]));

  const items = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.nameHu)],
    with: {
      // Fallback only: used when the category has no dedicated photo of its
      // own. The highest-priced item tends to be the flagship model, but it
      // also means adding a new expensive product redraws the homepage —
      // hence `categories.imageUrl`, set from the category admin page.
      products: {
        limit: 1,
        orderBy: [desc(products.priceHuf)],
        columns: { mainImage: true },
      },
    },
  });

  if (items.length === 0) return null;

  return (
    <Container as="section" className="pt-10 pb-25">
      <div className="mx-auto mb-14 max-w-[760px] text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-coprBlue/30 bg-coprBlue/10 px-4 py-1.5 text-[11.5px] font-bold tracking-[0.1em] text-coprBlue uppercase">
          {t("categoriesEyebrow")}
        </div>
        <h2 className="text-[42px] leading-tight font-bold tracking-[-0.01em] text-ink max-lg:text-3xl">
          {t("categoriesTitle")}
        </h2>
        <p className="mt-4 text-[17px] leading-[1.7] text-muted">
          {t("categoriesSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {items.map((cat) => {
          const visual = getCategoryVisual(cat.slug);
          const image = cat.imageUrl ?? cat.products[0]?.mainImage ?? null;
          const name = localized(locale, cat.nameHu, cat.nameEn);
          // A szerkeszthető rész (márkák, jelleg) és a származtatott
          // darabszám együtt adja a feliratot.
          const badgePrefix = localized(locale, cat.cardBadgeHu ?? "", cat.cardBadgeEn);
          const total = countByCategory.get(cat.id) ?? 0;
          const badge = [badgePrefix, total > 0 ? tc("productCount", { count: total }) : ""]
            .filter(Boolean)
            .join(" · ");
          const description = localized(
            locale,
            cat.descriptionHu ?? "",
            cat.descriptionEn,
          );
          return (
            <Link
              href={`/${cat.slug}`}
              key={cat.slug}
              className="rounded-card group relative isolate flex h-[400px] flex-col justify-end overflow-hidden border border-white/5 p-[26px] pb-8 shadow-sm transition-all duration-500 hover:-translate-y-[5px] hover:shadow-[0_24px_52px_-10px_rgba(15,45,80,0.28)] max-lg:h-80"
            >
              {image ? (
                <SafeImage
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
                  className="-z-10 object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${visual.gradient} transition-transform duration-700 ease-out group-hover:scale-105`}
                />
              )}
              {/* Dark scrim so the copy stays readable whatever photo sits
                  behind it — fully clear down to the upper two fifths, then
                  darkening over the lower band where the text sits. */}
              <div className="absolute inset-0 -z-[5] bg-[linear-gradient(180deg,rgba(15,32,30,0)_0%,rgba(15,32,30,0.2)_40%,rgba(15,32,30,0.7)_78%,rgba(15,32,30,0.8)_100%)]" />

              <div className="relative text-white">
                {badge ? (
                  <div className="mb-2.5 inline-flex items-center rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-extrabold tracking-[0.08em] text-[#5cd3f5] uppercase backdrop-blur-sm">
                    {badge}
                  </div>
                ) : null}
                <h3 className="text-2xl leading-tight font-bold">{name}</h3>
                {description ? (
                  <p className="mt-2 line-clamp-3 text-[13.5px] leading-[1.55] text-white/75">
                    {description}
                  </p>
                ) : null}
                <span className="mt-[18px] inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-white transition-all group-hover:translate-x-1 group-hover:text-coprBlue">
                  {t("categoriesCta")}
                  <ArrowRight className="size-4" strokeWidth={2.5} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
