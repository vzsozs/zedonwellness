import { getTranslations, getLocale } from "next-intl/server";
import { asc, desc } from "drizzle-orm";
import { ArrowUpRight } from "lucide-react";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { Link } from "@/i18n/navigation";
import { getCategoryVisual } from "@/lib/visuals";
import { localized } from "@/lib/localized";

export async function CategoryGrid() {
  const t = await getTranslations("home");
  const locale = await getLocale();
  const items = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.nameHu)],
    with: {
      // One representative photo per category card — highest-priced item
      // tends to be the flagship model, a reasonable stand-in until these
      // get dedicated category hero shots.
      products: {
        limit: 1,
        orderBy: [desc(products.priceHuf)],
        columns: { mainImage: true },
      },
    },
  });

  if (items.length === 0) return null;

  return (
    <section className="px-16 pt-24 pb-10 max-lg:px-6">
      <div className="mb-14 text-center">
        <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
          {t("categoriesEyebrow")}
        </div>
        <h2 className="mt-3.5 text-4xl font-bold max-lg:text-3xl">
          {t("categoriesTitle")}
        </h2>
      </div>
      <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2">
        {items.map((cat) => {
          const visual = getCategoryVisual(cat.slug);
          const image = cat.products[0]?.mainImage ?? null;
          const name = localized(locale, cat.nameHu, cat.nameEn);
          const description = localized(
            locale,
            cat.descriptionHu ?? "",
            cat.descriptionEn,
          );
          return (
            <Link
              href={`/${cat.slug}`}
              key={cat.slug}
              className="group relative isolate flex h-80 flex-col justify-end overflow-hidden max-lg:h-64"
            >
              {image ? (
                <img
                  src={image}
                  alt=""
                  className="absolute inset-0 -z-10 h-full w-full scale-105 object-cover transition-transform duration-500 ease-out group-hover:scale-115"
                />
              ) : (
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${visual.gradient} transition-transform duration-500 ease-out group-hover:scale-110`}
                />
              )}
              <div className="absolute inset-0 -z-[5] bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
              {!image ? (
                <svg
                  className="absolute top-6 right-6 -z-[5] opacity-70"
                  width={44}
                  height={44}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={visual.iconColor}
                  strokeWidth={1.3}
                >
                  <path d={visual.icon} />
                </svg>
              ) : null}
              <div className="relative p-6">
                <h3 className="text-xl font-bold text-white">{name}</h3>
                {description ? (
                  <p className="mt-1.5 line-clamp-2 text-sm text-white/80">
                    {description}
                  </p>
                ) : null}
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 transition-transform group-hover:translate-x-1">
                  {t("categoriesCta")}
                  <ArrowUpRight className="size-4" strokeWidth={2.2} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
