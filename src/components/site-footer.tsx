import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="px-16 pb-10 pt-16 max-lg:px-6">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 border-b border-line pb-12 max-lg:grid-cols-2 max-lg:gap-8">
        <div>
          <img
            src="/brand/zedonwellness-logo.png"
            alt="Zedonwellness"
            className="mb-4 h-7 w-auto"
          />
          <p className="max-w-64 text-sm leading-relaxed text-muted">
            {t("tagline")}
          </p>
        </div>
        <div>
          <div className="mb-4 text-xs font-bold tracking-wide text-ink uppercase">
            {t("products")}
          </div>
          <div className="flex flex-col gap-2.5 text-sm text-muted">
            <Link href="/jakuzzik" className="text-muted hover:text-accent">
              {nav("jacuzzis")}
            </Link>
            <Link href="/szaunak" className="text-muted hover:text-accent">
              {nav("saunas")}
            </Link>
            <Link href="/kiegeszitok" className="text-muted hover:text-accent">
              {nav("accessories")}
            </Link>
            <Link href="/grillek" className="text-muted hover:text-accent">
              {nav("grills")}
            </Link>
          </div>
        </div>
        <div>
          <div className="mb-4 text-xs font-bold tracking-wide text-ink uppercase">
            {t("company")}
          </div>
          <div className="flex flex-col gap-2.5 text-sm text-muted">
            <Link href="/rolunk" className="text-muted hover:text-accent">
              {t("about")}
            </Link>
            <Link href="/gyar" className="text-muted hover:text-accent">
              {t("factory")}
            </Link>
            <Link href="/szerviz" className="text-muted hover:text-accent">
              {t("service")}
            </Link>
            <Link href="/blog" className="text-muted hover:text-accent">
              {nav("blog")}
            </Link>
          </div>
        </div>
        <div>
          <div className="mb-4 text-xs font-bold tracking-wide text-ink uppercase">
            {t("contactSection")}
          </div>
          <div className="flex flex-col gap-2.5 text-sm text-muted">
            <span>+36 1 234 5678</span>
            <span>info@zedonwellness.com</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-6 text-xs text-muted/70 max-md:flex-col max-md:items-start max-md:gap-3">
        <span>
          © {year} Zedonwellness. {t("rights")}
        </span>
        <div className="flex gap-6">
          <Link href="/adatvedelem" className="text-muted/70 hover:text-accent">
            {t("privacy")}
          </Link>
          <Link href="/aszf" className="text-muted/70 hover:text-accent">
            {t("terms")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
