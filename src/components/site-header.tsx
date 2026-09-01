"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Search, ShoppingBag, Menu, X } from "lucide-react";

const links = [
  { href: "/jakuzzik", key: "jacuzzis" as const },
  { href: "/szaunak", key: "saunas" as const },
  { href: "/grillek", key: "grills" as const },
  { href: "/kiegeszitok", key: "accessories" as const },
  { href: "/blog", key: "blog" as const },
  { href: "/a-ceg", key: "company" as const },
  { href: "/kapcsolat", key: "contact" as const },
];

export function SiteHeader() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const tb = useTranslations("topbar");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header>
      <div className="flex items-center justify-between gap-6 bg-ink px-16 py-2.5 text-xs tracking-wide text-line max-lg:px-6">
        <div className="flex gap-7 max-md:hidden">
          <span>{tb("phone")}</span>
          <span>{tb("shipping")}</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/"
            locale="hu"
            className={locale === "hu" ? "font-bold text-white" : "text-line/60"}
          >
            HU
          </Link>
          <Link
            href="/"
            locale="en"
            className={locale === "en" ? "font-bold text-white" : "text-line/60"}
          >
            EN
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-line bg-white px-16 py-5 max-lg:px-6">
        <Link href="/" className="shrink-0" onClick={() => setMenuOpen(false)}>
          <img
            src="/brand/zedonwellness-logo.png"
            alt="Zedonwellness"
            className="h-8 w-auto"
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
          <Search className="size-5 text-ink max-lg:hidden" strokeWidth={1.8} />
          <ShoppingBag className="size-5 text-ink" strokeWidth={1.8} />
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
        </nav>
      ) : null}
    </header>
  );
}
