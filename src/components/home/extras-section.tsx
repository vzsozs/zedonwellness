import { getTranslations, getLocale } from "next-intl/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { extras } from "@/db/schema";
import { localized } from "@/lib/localized";
import { ExtraCard } from "@/components/extra-card";

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
        {items.map((extra) => (
          <ExtraCard
            key={extra.id}
            extra={extra}
            name={localized(locale, extra.nameHu, extra.nameEn)}
          />
        ))}
      </div>
    </section>
  );
}
