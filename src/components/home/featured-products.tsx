import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getProduct, formatHuf } from "@/lib/catalog";

const featuredSlugs = ["hc-design-5", "hanscraft-s2", "gazgrill-4egos"];

export function FeaturedProducts() {
  const t = useTranslations("home");
  const featured = featuredSlugs.map((slug) => getProduct(slug)!);

  return (
    <section className="px-16 py-22 max-lg:px-6">
      <div className="mb-11 flex items-end justify-between max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
            {t("featuredEyebrow")}
          </div>
          <h2 className="mt-3.5 text-3xl font-semibold">{t("featuredTitle")}</h2>
        </div>
        <Link href="/jakuzzik" className="text-sm font-bold hover:text-accent">
          {t("viewAll")} →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-7 max-lg:grid-cols-1">
        {featured.map((p) => (
          <Link href={`/termek/${p.slug}`} key={p.slug} className="group">
            <div className={`relative h-70 bg-gradient-to-br ${p.gradient}`}>
              {p.badge ? (
                <span
                  className={`absolute top-3.5 left-3.5 ${
                    p.badge.tone === "ink" ? "bg-ink" : "bg-accent"
                  } px-2.5 py-1 text-[11px] font-bold tracking-wide text-white`}
                >
                  {p.badge.label}
                </span>
              ) : null}
            </div>
            <div className="py-4.5">
              <div className="text-xs font-semibold tracking-wide text-muted uppercase">
                {p.series}
              </div>
              <h3 className="mt-1.5 text-lg font-bold group-hover:text-accent">
                {p.nameHu}
              </h3>
              <div className="mt-2.5 text-lg font-bold text-accent">
                {formatHuf(p.priceHuf)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
