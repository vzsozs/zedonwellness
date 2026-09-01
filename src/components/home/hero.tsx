import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(1100px_640px_at_78%_30%,#CFEFF0_0%,#E4F3EE_42%,#FAFAF8_78%)]">
      <svg
        width="620"
        height="620"
        viewBox="0 0 620 620"
        className="pointer-events-none absolute -right-16 -top-10 max-lg:hidden"
      >
        <circle cx="470" cy="150" r="150" fill="#0E8C9A" opacity="0.14" />
        <circle cx="300" cy="420" r="220" fill="#0E8C9A" opacity="0.1" />
        <circle cx="540" cy="440" r="60" fill="#0E8C9A" opacity="0.22" />
        <circle cx="140" cy="120" r="26" fill="#0E8C9A" opacity="0.25" />
      </svg>

      <div className="relative max-w-xl px-16 py-32 max-lg:px-6 max-lg:py-20">
        <div className="mb-4 text-xs font-bold tracking-[0.14em] text-accent uppercase">
          {t("eyebrow")}
        </div>
        <h1 className="text-[56px] leading-[1.08] font-semibold tracking-tight text-ink max-lg:text-4xl">
          {t("title")}
        </h1>
        <p className="my-6 max-w-md text-lg leading-relaxed text-muted">
          {t("subtitle")}
        </p>
        <div className="flex gap-4 max-sm:flex-col">
          <Link
            href="/jakuzzik"
            className="inline-flex items-center gap-2.5 bg-accent px-8 py-4 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            {t("ctaPrimary")}
            <ArrowRight className="size-4" strokeWidth={2.2} />
          </Link>
          <Link
            href="/kapcsolat"
            className="inline-flex items-center justify-center border-[1.5px] border-ink px-7 py-4 text-sm font-semibold text-ink"
          >
            {t("ctaSecondary")}
          </Link>
        </div>
      </div>
    </section>
  );
}
