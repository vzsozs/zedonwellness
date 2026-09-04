"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { SoroArticle } from "@/lib/soro";

const PAGE_SIZE = 20;

// Soro's article feed has no category/tag field (it's an external, always-
// changing content source we don't tag ourselves) — so the filter chips are
// a best-effort keyword match against each post's title/excerpt instead of
// a real taxonomy. A chip only shows up once at least one post matches it,
// so the row adapts as the blog's actual topics change over time.
const CATEGORY_KEYWORDS: { key: string; labelKey: string; keywords: string[] }[] = [
  {
    key: "jakuzzik",
    labelKey: "filterJakuzzik",
    keywords: ["jakuzzi", "pezsgőfürdő", "masszázsmedence", "hidromasszázs"],
  },
  { key: "szaunak", labelKey: "filterSzaunak", keywords: ["szauna"] },
  {
    key: "medence",
    labelKey: "filterMedence",
    keywords: ["medence", "swim spa", "úszómedence"],
  },
  {
    key: "karbantartas",
    labelKey: "filterKarbantartas",
    keywords: [
      "hőszivattyú",
      "szűrő",
      "vízkezelés",
      "fedés",
      "fedő",
      "thermotető",
      "ózon",
      "ph érték",
      "klór",
      "biofilm",
    ],
  },
  { key: "grillek", labelKey: "filterGrillek", keywords: ["grill"] },
];

function matchesKeywords(haystack: string, keywords: string[]) {
  const lower = haystack.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

export function BlogList({ articles }: { articles: SoroArticle[] }) {
  const t = useTranslations("blog");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const availableCategories = useMemo(
    () =>
      CATEGORY_KEYWORDS.filter((cat) =>
        articles.some((a) => matchesKeywords(`${a.title} ${a.excerpt}`, cat.keywords)),
      ),
    [articles],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cat = CATEGORY_KEYWORDS.find((c) => c.key === activeCategory);
    return articles.filter((a) => {
      const haystack = `${a.title} ${a.excerpt}`;
      if (cat && !matchesKeywords(haystack, cat.keywords)) return false;
      if (q && !haystack.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [articles, query, activeCategory]);

  const shown = filtered.slice(0, visible);

  function selectCategory(key: string | null) {
    setActiveCategory(key);
    setVisible(PAGE_SIZE);
  }

  function changeQuery(value: string) {
    setQuery(value);
    setVisible(PAGE_SIZE);
  }

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-center gap-3 max-sm:flex-col max-sm:items-stretch">
        <button
          type="button"
          onClick={() => selectCategory(null)}
          className={`px-5 py-2.5 text-sm font-semibold transition-colors ${
            activeCategory === null
              ? "bg-accent text-white"
              : "bg-white text-ink hover:bg-accent-soft"
          }`}
        >
          {t("filterAll")}
        </button>
        {availableCategories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => selectCategory(cat.key)}
            className={`px-5 py-2.5 text-sm font-semibold transition-colors ${
              activeCategory === cat.key
                ? "bg-accent text-white"
                : "bg-white text-ink hover:bg-accent-soft"
            }`}
          >
            {t(cat.labelKey)}
          </button>
        ))}
        <div className="relative ml-auto w-64 max-sm:ml-0 max-sm:w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full border border-line bg-white py-2.5 pr-4 pl-9 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="text-center text-muted">{t("noResults")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-7 max-sm:grid-cols-1">
          {shown.map((post) => (
            <Link
              key={post.slug}
              href={`/blog?post=${post.slug}`}
              className="group border border-line bg-white"
            >
              <div className="h-44 overflow-hidden bg-paper-muted">
                {post.image ? (
                  <img
                    src={post.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="p-6">
                <h2 className="text-lg font-bold group-hover:text-accent">{post.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
                <time className="mt-3 block text-xs text-muted" dateTime={post.isoDate}>
                  {post.date}
                </time>
              </div>
            </Link>
          ))}
        </div>
      )}

      {visible < filtered.length ? (
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="border-[1.5px] border-ink px-8 py-3.5 text-sm font-semibold hover:bg-ink hover:text-white"
          >
            {t("loadMore")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
