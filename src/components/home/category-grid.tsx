import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories } from "@/lib/catalog";

export function CategoryGrid() {
  const t = useTranslations("home");
  const nav = useTranslations("nav");

  return (
    <section className="px-16 pt-24 pb-10 max-lg:px-6">
      <div className="mb-14 text-center">
        <div className="text-xs font-bold tracking-[0.14em] text-accent uppercase">
          {t("categoriesEyebrow")}
        </div>
        <h2 className="mt-3.5 text-4xl font-semibold max-lg:text-3xl">
          {t("categoriesTitle")}
        </h2>
      </div>
      <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2">
        {categories.map((cat) => (
          <Link
            href={`/${cat.slug}`}
            key={cat.slug}
            className="overflow-hidden border border-line bg-white"
          >
            <div
              className={`flex h-55 items-center justify-center bg-gradient-to-br ${cat.gradient}`}
            >
              <svg
                width={56}
                height={56}
                viewBox="0 0 24 24"
                fill="none"
                stroke={cat.iconColor}
                strokeWidth={1.3}
              >
                <path d={cat.icon} />
              </svg>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold">{nav(cat.navKey)}</h3>
              <p className="mt-2 text-sm text-muted">{cat.subtitleHu}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
