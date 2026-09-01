import { getTranslations, getLocale } from "next-intl/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { Link } from "@/i18n/navigation";
import { getCategoryVisual } from "@/lib/visuals";
import { localized } from "@/lib/localized";

export async function CategoryGrid() {
  const t = await getTranslations("home");
  const locale = await getLocale();
  const items = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.nameHu)],
  });

  if (items.length === 0) return null;

  return (
    <section className="px-16 pt-24 pb-10 max-lg:px-6">
      <div className="mb-14 text-center">
        <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
          {t("categoriesEyebrow")}
        </div>
        <h2 className="mt-3.5 text-4xl font-semibold max-lg:text-3xl">
          {t("categoriesTitle")}
        </h2>
      </div>
      <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2">
        {items.map((cat) => {
          const visual = getCategoryVisual(cat.slug);
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
              className="overflow-hidden border border-line bg-white"
            >
              <div
                className={`flex h-55 items-center justify-center bg-gradient-to-br ${visual.gradient}`}
              >
                <svg
                  width={56}
                  height={56}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={visual.iconColor}
                  strokeWidth={1.3}
                >
                  <path d={visual.icon} />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold">{name}</h3>
                {description ? (
                  <p className="mt-2 text-sm text-muted">{description}</p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
