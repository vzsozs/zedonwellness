import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const categories = [
  {
    slug: "jakuzzik",
    key: "jacuzzis",
    gradient: "from-[#CDEDEF] to-[#9FD9DC]",
    iconColor: "#0A6B76",
    subtitle: "HC Design, Celtic, OKA — 25+ modell",
    icon: (
      <path d="M4 14c1.5 1.5 2.5 1.5 4 0s2.5-1.5 4 0 2.5 1.5 4 0 2.5-1.5 4 0M4 18c1.5 1.5 2.5 1.5 4 0s2.5-1.5 4 0 2.5 1.5 4 0 2.5-1.5 4 0" />
    ),
  },
  {
    slug: "szaunak",
    key: "saunas",
    gradient: "from-[#E9E2D3] to-[#D3C4A3]",
    iconColor: "#7A5C2E",
    subtitle: "Hordó, hagyományos, infra — 15+ modell",
    icon: <path d="M3 21h18M5 21V9l7-6 7 6v12M9 21v-6h6v6" />,
  },
  {
    slug: "grillek",
    key: "grills",
    gradient: "from-[#EFD9C9] to-[#DFAE8B]",
    iconColor: "#8A4A22",
    subtitle: "Beépíthető, kocsi, kemence",
    icon: <path d="M7 10V7a5 5 0 0 1 10 0v3M3 19h18M3 10h18v9H3z" />,
  },
  {
    slug: "kiegeszitok",
    key: "accessories",
    gradient: "from-[#D7E4E0] to-[#AFC7C0]",
    iconColor: "#3E5F55",
    subtitle: "Vegyszerek, takarók, szűrők",
    icon: <path d="M12 3a9 9 0 1 0 9 9M12 7v5l4 2" />,
  },
] as const;

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
                {cat.icon}
              </svg>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold">{nav(cat.key)}</h3>
              <p className="mt-2 text-sm text-muted">{cat.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
