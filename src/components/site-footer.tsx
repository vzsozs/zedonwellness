import { useTranslations } from "next-intl";
import { Mail, Phone, Wrench } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";
import Image from "next/image";

export function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto max-w-[1480px] px-[5%] pb-10 pt-16 max-lg:px-6">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 border-b border-line pb-12 max-lg:grid-cols-2 max-lg:gap-8 max-sm:grid-cols-2 max-sm:gap-y-8 max-sm:text-center">
        <div className="max-sm:col-span-2 max-sm:flex max-sm:flex-col max-sm:items-center">
          <Image
            src="/brand/zedonwellness-logo.png"
            alt="Zedonwellness"
            width={191}
            height={28}
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
          <div className="flex min-w-0 flex-col gap-2.5 text-sm text-muted max-sm:items-center">
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
          <div className="flex min-w-0 flex-col gap-2.5 text-sm text-muted max-sm:items-center">
            <Link href="/a-ceg" className="text-muted hover:text-accent">
              {t("about")}
            </Link>
            <Link href="/a-ceg#gyar" className="text-muted hover:text-accent">
              {t("factory")}
            </Link>
            <Link href="/a-ceg#szerviz" className="text-muted hover:text-accent">
              {t("service")}
            </Link>
            <Link href="/blog" className="text-muted hover:text-accent">
              {nav("blog")}
            </Link>
          </div>
        </div>
        <div className="max-sm:col-span-2">
          <div className="mb-4 text-xs font-bold tracking-wide text-ink uppercase">
            {t("contactSection")}
          </div>
          <div className="flex min-w-0 flex-col gap-2.5 text-sm text-muted max-sm:items-center">
            <a
              href={`tel:${COMPANY.phoneHref}`}
              className="inline-flex items-start gap-2.5 break-words hover:text-accent max-sm:justify-center"
            >
              <Phone className="mt-0.5 size-[18px] shrink-0 text-accent" strokeWidth={1.8} />
              {COMPANY.phone}
            </a>
            <a
              href={`mailto:${COMPANY.email}`}
              className="inline-flex items-start gap-2.5 break-words hover:text-accent max-sm:justify-center"
            >
              <Mail className="mt-0.5 size-[18px] shrink-0 text-accent" strokeWidth={1.8} />
              {COMPANY.email}
            </a>
          </div>

          {/* The service line is a separate contact with its own inbox and
              named colleague — it was only reachable from the contact
              modal before, which is easy to miss. */}
          <div className="mt-6 mb-4 text-xs font-bold tracking-wide text-ink uppercase">
            {t("serviceSection")}
          </div>
          <div className="flex min-w-0 flex-col gap-2.5 text-sm text-muted max-sm:items-center">
            <a
              href={`tel:${COMPANY.service.phoneHref}`}
              className="inline-flex items-start gap-2.5 break-words hover:text-accent max-sm:justify-center"
            >
              <Wrench className="mt-0.5 size-[18px] shrink-0 text-accent" strokeWidth={1.8} />
              {COMPANY.service.contactName} — {COMPANY.service.phone}
            </a>
            <a
              href={`mailto:${COMPANY.service.email}`}
              className="inline-flex items-start gap-2.5 break-words hover:text-accent max-sm:justify-center"
            >
              <Mail className="mt-0.5 size-[18px] shrink-0 text-accent" strokeWidth={1.8} />
              {COMPANY.service.email}
            </a>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-6 text-xs text-muted/70 max-md:flex-col max-md:items-center max-md:gap-3 max-md:text-center">
        <span>
          © {year} Zedonwellness. {t("rights")}
        </span>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/impresszum" className="text-muted/70 hover:text-accent">
            {t("imprint")}
          </Link>
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
