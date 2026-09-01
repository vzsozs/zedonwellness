import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const products = [
  {
    slug: "hc-design-5",
    category: "HC Design sorozat",
    name: "HC Design 5 — 6 személyes jakuzzi",
    price: "1 890 000 Ft",
    gradient: "from-[#CFEFF0] to-[#9FD9DC]",
    badge: { label: "ÚJDONSÁG", tone: "bg-ink" },
  },
  {
    slug: "hanscraft-s2",
    category: "Hanscraft",
    name: "Hanscraft S2 hordószauna, 300 cm",
    price: "1 240 000 Ft",
    gradient: "from-[#E9E2D3] to-[#D3C4A3]",
    badge: null,
  },
  {
    slug: "gazgrill-4egos",
    category: "Beépíthető grillek",
    name: "4 égős rozsdamentes gázgrill",
    price: "420 000 Ft",
    gradient: "from-[#EFD9C9] to-[#DFAE8B]",
    badge: { label: "AKCIÓ", tone: "bg-accent" },
  },
] as const;

export function FeaturedProducts() {
  const t = useTranslations("home");

  return (
    <section className="px-16 py-22 max-lg:px-6">
      <div className="mb-11 flex items-end justify-between max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <div className="text-xs font-bold tracking-[0.14em] text-accent uppercase">
            {t("featuredEyebrow")}
          </div>
          <h2 className="mt-3.5 text-3xl font-semibold">{t("featuredTitle")}</h2>
        </div>
        <Link href="/jakuzzik" className="text-sm font-bold hover:text-accent">
          {t("viewAll")} →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-7 max-lg:grid-cols-1">
        {products.map((p) => (
          <Link href={`/termek/${p.slug}`} key={p.slug} className="group">
            <div
              className={`relative h-70 bg-gradient-to-br ${p.gradient}`}
            >
              {p.badge ? (
                <span
                  className={`absolute top-3.5 left-3.5 ${p.badge.tone} px-2.5 py-1 text-[11px] font-bold tracking-wide text-white`}
                >
                  {p.badge.label}
                </span>
              ) : null}
            </div>
            <div className="py-4.5">
              <div className="text-xs font-semibold tracking-wide text-muted uppercase">
                {p.category}
              </div>
              <h3 className="mt-1.5 text-lg font-semibold group-hover:text-accent">
                {p.name}
              </h3>
              <div className="mt-2.5 text-lg font-bold">{p.price}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
