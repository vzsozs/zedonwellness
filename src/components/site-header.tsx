"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useCurrency, currencyForLocale } from "@/lib/currency-context";
import { useGrillThemeActive } from "@/lib/grill-theme-context";

const links = [
  { href: "/jakuzzik", key: "jacuzzis" as const },
  { href: "/szaunak", key: "saunas" as const },
  { href: "/kiegeszitok", key: "accessories" as const },
  { href: "/grillek", key: "grills" as const },
  { href: "/blog", key: "blog" as const },
  { href: "/a-ceg", key: "company" as const },
  { href: "/kapcsolat", key: "contact" as const },
];

export function SiteHeader() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const tb = useTranslations("topbar");
  const tc = useTranslations("common");
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { itemCount } = useCart();
  const { currency, setCurrency } = useCurrency();
  const isGrillTheme = useGrillThemeActive();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/kereses?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setMenuOpen(false);
  }

  return (
    <header>
      <div className="flex items-center justify-between gap-6 bg-ink px-16 py-2.5 text-xs tracking-wide text-line max-lg:px-6">
        <div className="flex gap-7 max-md:hidden">
          <span>{tb("phone")}</span>
          <span>{tb("shipping")}</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              locale="hu"
              onClick={() => setCurrency(currencyForLocale("hu"))}
              className={locale === "hu" ? "font-bold text-white" : "text-line/60"}
            >
              HU
            </Link>
            <Link
              href="/"
              locale="en"
              onClick={() => setCurrency(currencyForLocale("en"))}
              className={locale === "en" ? "font-bold text-white" : "text-line/60"}
            >
              EN
            </Link>
          </div>
          <span className="text-line/30">|</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrency("HUF")}
              className={currency === "HUF" ? "font-bold text-white" : "text-line/60"}
            >
              HUF
            </button>
            <button
              type="button"
              onClick={() => setCurrency("EUR")}
              className={currency === "EUR" ? "font-bold text-white" : "text-line/60"}
            >
              EUR
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-line bg-white px-16 py-5 max-lg:px-6">
        <Link
          href="/"
          className="relative h-14 w-[191px] shrink-0"
          onClick={() => setMenuOpen(false)}
        >
          <img
            src="/brand/zedonwellness-logo.png"
            alt="Zedonwellness"
            className={`absolute top-1/2 left-0 h-8 w-auto -translate-y-1/2 transition-opacity duration-[2000ms] ease-in-out ${
              isGrillTheme ? "opacity-0" : "opacity-100"
            }`}
          />
          <img
            src="/ZedonGrill-logo-Eng-update.svg"
            alt="ZedonGrill"
            className={`absolute top-1/2 left-0 h-14 w-auto -translate-y-1/2 transition-opacity duration-[2000ms] ease-in-out ${
              isGrillTheme ? "opacity-100" : "opacity-0"
            }`}
          />
        </Link>

        <nav className="flex gap-10 text-sm font-semibold max-lg:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-ink hover:text-accent">
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <div className="relative max-lg:hidden">
            <button
              type="button"
              aria-label={tc("search")}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search className="size-5 text-ink" strokeWidth={1.8} />
            </button>
            {searchOpen ? (
              <form
                onSubmit={submitSearch}
                className="absolute top-full right-0 z-10 mt-3 flex w-72 border border-line bg-white p-1.5 shadow-[0_8px_28px_rgba(15,45,80,0.12)]"
              >
                <input
                  autoFocus
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tc("searchPlaceholder")}
                  className="min-w-0 flex-1 px-2.5 py-2 text-sm outline-none"
                />
                <button
                  type="submit"
                  aria-label={tc("search")}
                  className="flex shrink-0 items-center justify-center px-2 text-accent hover:text-accent-dark"
                >
                  <Search className="size-4" strokeWidth={1.8} />
                </button>
              </form>
            ) : null}
          </div>
          <Link href="/kosar" className="relative" aria-label={t("cart")}>
            <ShoppingBag className="size-5 text-ink" strokeWidth={1.8} />
            {itemCount > 0 ? (
              <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Menü bezárása" : "Menü megnyitása"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="hidden max-lg:block"
          >
            {menuOpen ? (
              <X className="size-6 text-ink" strokeWidth={1.8} />
            ) : (
              <Menu className="size-6 text-ink" strokeWidth={1.8} />
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav className="hidden border-b border-line bg-white px-6 py-2 max-lg:block">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block border-b border-line py-3.5 text-sm font-semibold text-ink last:border-0"
            >
              {t(l.key)}
            </Link>
          ))}
          <form onSubmit={submitSearch} className="relative py-3.5">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
              strokeWidth={1.8}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tc("searchPlaceholder")}
              className="w-full border border-line py-2.5 pr-3.5 pl-9 text-sm outline-none focus:border-accent"
            />
          </form>
        </nav>
      ) : null}
    </header>
  );
}
