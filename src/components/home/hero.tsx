import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ContactButton } from "@/components/contact-button";
import Image from "next/image";

export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden">
      {/* The LCP element on the homepage — `priority` preloads it instead
          of letting it queue behind the rest of the page. */}
      <Image
        src="/Jacuzzi-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-paper)_0%,var(--color-paper)_28%,rgba(235,246,255,0.55)_52%,rgba(235,246,255,0)_72%)]" />

      <div className="relative max-w-xl px-[5%] py-32 max-lg:px-6 max-lg:py-20">
        <div className="mb-4 text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
          {t("eyebrow")}
        </div>
        <h1 className="text-[56px] leading-[1.08] font-bold tracking-tight text-ink max-lg:text-4xl">
          <span className="text-coprBlue">{t("titleHighlight")}</span>{" "}
          {t("titleRest")}
        </h1>
        <p className="my-6 max-w-md text-lg leading-relaxed text-muted">
          {t("subtitle")}
        </p>
        <div className="flex gap-4 max-sm:flex-col">
          <Link
            href="/jakuzzik"
            className="rounded-control inline-flex items-center gap-2.5 bg-accent px-8 py-4 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            {t("ctaPrimary")}
            <ArrowRight className="size-4" strokeWidth={2.2} />
          </Link>
          <ContactButton className="inline-flex items-center justify-center border-[1.5px] border-ink px-7 py-4 text-sm font-semibold text-ink">
            {t("ctaSecondary")}
          </ContactButton>
        </div>
      </div>

      <Image
        src="/tuv_certified.webp"
        alt="TÜV Rheinland Certified"
        width={160}
        height={96}
        className="absolute right-10 bottom-8 h-24 w-auto drop-shadow-md max-lg:top-4 max-lg:right-auto max-lg:bottom-auto max-lg:left-4 max-lg:h-12"
      />
    </section>
  );
}
