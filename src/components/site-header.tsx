"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Search, ShoppingBag, Menu, X, Phone, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useCurrency, currencyForLocale } from "@/lib/currency-context";
import { useGrillThemeActive } from "@/lib/grill-theme-context";
import { useContactModal } from "@/lib/contact-modal-context";
import { COMPANY } from "@/lib/company";
import Image from "next/image";

const links = [
  { href: "/jakuzzik", key: "jacuzzis" as const },
  { href: "/szaunak", key: "saunas" as const },
  { href: "/kiegeszitok", key: "accessories" as const },
  { href: "/grillek", key: "grills" as const },
  { href: "/blog", key: "blog" as const },
  { href: "/a-ceg", key: "company" as const },
];

export function SiteHeader() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const tb = useTranslations("topbar");
  const tc = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { itemCount } = useCart();
  const { currency, setCurrency } = useCurrency();
  const isGrillTheme = useGrillThemeActive();
  const { open: openContact } = useContactModal();

  /** Switching language keeps you on the same page. It used to link to "/",
   * so changing language from a product page dumped you on the homepage —
   * and left the hreflang pairs pointing at content nobody could reach by
   * clicking. */
  function switchLocale(next: "hu" | "en") {
    setCurrency(currencyForLocale(next));
    router.replace(pathname, { locale: next });
    setMenuOpen(false);
  }

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
      <div className="flex items-center justify-between gap-6 bg-ink px-[5%] py-2.5 text-xs tracking-wide text-line max-lg:px-6">
        <div className="flex items-center gap-6 max-md:hidden">
          <span className="flex items-center gap-[7px]">
            <Phone className="size-[15px] shrink-0" strokeWidth={2.2} />
            {tb.rich("phone", {
              phone: COMPANY.phone,
              // The number is the actionable part of the sentence, so it
              // gets the emphasis — and is dialable on a phone.
              highlight: (chunks) => (
                <a href={`tel:${COMPANY.phoneHref}`} className="font-semibold text-white hover:underline">
                  {chunks}
                </a>
              ),
            })}
          </span>
          <span className="flex items-center gap-[7px]">
            <Truck className="size-[15px] shrink-0" strokeWidth={2.2} />
            {tb("shipping")}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => switchLocale("hu")}
              aria-current={locale === "hu" ? "true" : undefined}
              className={locale === "hu" ? "font-bold text-white" : "text-line/60"}
            >
              HU
            </button>
            <button
              type="button"
              onClick={() => switchLocale("en")}
              aria-current={locale === "en" ? "true" : undefined}
              className={locale === "en" ? "font-bold text-white" : "text-line/60"}
            >
              EN
            </button>
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

      <div className="flex h-[82px] items-center justify-between border-b border-line bg-white px-[5%] max-lg:h-auto max-lg:px-6 max-lg:py-4">
        <Link
          href="/"
          /* Sized to the taller of the two logos, since they sit stacked
             and cross-fade between the wellness and grill themes. */
          className="relative h-[66px] w-[228px] shrink-0 max-sm:w-[190px]"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/brand/zedonwellness-logo.png"
            alt="Zedonwellness"
            width={228}
            height={38}
            priority
            className={`absolute top-1/2 left-0 h-[38px] w-auto -translate-y-1/2 max-sm:h-8 transition-opacity duration-[2000ms] ease-in-out ${
              isGrillTheme ? "opacity-0" : "opacity-100"
            }`}
          />
          <Image
            src="/ZedonGrill-logo-Eng-update.svg"
            alt="ZedonGrill"
            width={165}
            height={66}
            className={`absolute top-1/2 left-0 h-[66px] w-auto -translate-y-1/2 max-sm:h-14 transition-opacity duration-[2000ms] ease-in-out ${
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
          <button type="button" onClick={openContact} className="text-ink hover:text-accent">
            {t("contact")}
          </button>
        </nav>

        <div className="flex items-center gap-[18px]">
          <div className="relative max-lg:hidden">
            <button
              type="button"
              aria-label={tc("search")}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
              className="flex size-[42px] items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink"
            >
              <Search className="size-[19px]" strokeWidth={2} />
            </button>
            {searchOpen ? (
              <form
                onSubmit={submitSearch}
                className="rounded-card absolute top-full right-0 z-10 mt-3 flex w-72 border border-line bg-white p-1.5 shadow-[0_8px_28px_rgba(15,45,80,0.12)]"
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
          <Link
            href="/kosar"
            aria-label={t("cart")}
            className="relative flex size-[42px] items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink"
          >
            <ShoppingBag className="size-[19px]" strokeWidth={2} />
            {itemCount > 0 ? (
              <span className="absolute -top-[3px] -right-[3px] flex size-[19px] items-center justify-center rounded-full bg-accent text-[10px] font-extrabold text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? tc("closeMenu") : tc("openMenu")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="hidden size-[42px] items-center justify-center rounded-full border border-line bg-white text-ink max-lg:flex"
          >
            {menuOpen ? (
              <X className="size-[19px]" strokeWidth={2} />
            ) : (
              <Menu className="size-[19px]" strokeWidth={2} />
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
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              openContact();
            }}
            className="block w-full border-b border-line py-3.5 text-left text-sm font-semibold text-ink last:border-0"
          >
            {t("contact")}
          </button>
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
