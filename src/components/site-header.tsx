import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Search, ShoppingBag } from "lucide-react";

export function SiteHeader() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const tb = useTranslations("topbar");

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
        <Link href="/" className="shrink-0">
          <img
            src="/brand/zedonwellness-logo.png"
            alt="Zedonwellness"
            className="h-8 w-auto"
          />
        </Link>

        <nav className="flex gap-10 text-sm font-semibold max-lg:hidden">
          <Link href="/jakuzzik" className="text-ink hover:text-accent">
            {t("jacuzzis")}
          </Link>
          <Link href="/szaunak" className="text-ink hover:text-accent">
            {t("saunas")}
          </Link>
          <Link href="/grillek" className="text-ink hover:text-accent">
            {t("grills")}
          </Link>
          <Link href="/kiegeszitok" className="text-ink hover:text-accent">
            {t("accessories")}
          </Link>
          <Link href="/blog" className="text-ink hover:text-accent">
            {t("blog")}
          </Link>
          <Link href="/a-ceg" className="text-ink hover:text-accent">
            {t("company")}
          </Link>
          <Link href="/kapcsolat" className="text-ink hover:text-accent">
            {t("contact")}
          </Link>
        </nav>

        <div className="flex items-center gap-5">
          <Search className="size-5 text-ink" strokeWidth={1.8} />
          <ShoppingBag className="size-5 text-ink" strokeWidth={1.8} />
        </div>
      </div>
    </header>
  );
}
