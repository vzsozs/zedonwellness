import { getTranslations, getLocale } from "next-intl/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { extras } from "@/db/schema";
import { formatHuf } from "@/lib/config";
import { localized } from "@/lib/localized";

export async function ExtrasSection() {
  const locale = await getLocale();
  const t = await getTranslations("home");
  const items = await db.query.extras.findMany({
    orderBy: [asc(extras.sortOrder), asc(extras.nameHu)],
  });

  if (items.length === 0) return null;

  return (
    <section className="bg-white px-16 py-22 max-lg:px-6">
      <div className="mb-11 text-center">
        <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
          {t("extrasEyebrow")}
        </div>
        <h2 className="mt-3.5 text-3xl font-semibold">{t("extrasTitle")}</h2>
      </div>
      <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2">
        {items.map((extra) => {
          const name = localized(locale, extra.nameHu, extra.nameEn);
          return (
            <div key={extra.id} className="border border-line">
              {extra.imageUrl ? (
                <img
                  src={extra.imageUrl}
                  alt={name}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="h-40 w-full bg-paper-muted" />
              )}
              <div className="p-5">
                <h3 className="text-base font-bold">{name}</h3>
                <div className="mt-2 text-lg font-extrabold text-accent">
                  {formatHuf(extra.priceHuf)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
