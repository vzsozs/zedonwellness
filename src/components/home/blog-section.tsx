import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/localized";

// No blog system yet — placeholder cards until real posts exist, so the
// homepage isn't left with an empty section in the meantime.
const POSTS = [
  {
    slug: "elso-jakuzzi",
    titleHu: "Hogyan válaszd ki az első jakuzzidat",
    titleEn: "How to choose your first jacuzzi",
    gradient: "from-[#0e8c9a] to-[#04bbf0]",
  },
  {
    slug: "szauna-teli-karbantartas",
    titleHu: "5 tipp a szauna téli karbantartásához",
    titleEn: "5 tips for winter sauna maintenance",
    gradient: "from-[#17201e] to-[#63706d]",
  },
  {
    slug: "grillezes-profi-modra",
    titleHu: "Grillezés profi módra: mit tud egy BULL grill",
    titleEn: "Grilling like a pro: what a BULL grill can do",
    gradient: "from-[#e0691a] to-[#f9ce67]",
  },
] as const;

export async function BlogSection() {
  const t = await getTranslations("home");
  const locale = await getLocale();

  return (
    <section className="bg-white px-16 py-22 max-lg:px-6">
      <div className="mb-11 text-center">
        <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
          {t("blogEyebrow")}
        </div>
        <h2 className="mt-3.5 text-3xl font-semibold">{t("blogTitle")}</h2>
      </div>

      <div className="relative">
        <div className="flex gap-6 overflow-hidden">
          {POSTS.map((post) => (
            <div
              key={post.slug}
              className="w-[38%] shrink-0 border border-line max-lg:w-[80%]"
            >
              <div className={`h-44 bg-gradient-to-br ${post.gradient}`} />
              <div className="p-6">
                <h3 className="text-base font-bold">
                  {localized(locale, post.titleHu, post.titleEn)}
                </h3>
              </div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-white to-transparent max-lg:w-16" />
      </div>
    </section>
  );
}
