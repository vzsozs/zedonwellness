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
        {/* Pill-shaped eyebrow, from the redesign mockup — same copy as
            before, just given a frame so it reads as a label rather than
            as a stray line of small caps. */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-coprBlue/30 bg-coprBlue/10 px-4 py-1.5 text-[11.5px] font-bold tracking-[0.14em] text-coprBlue uppercase">
          <span aria-hidden="true">✦</span>
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

      {/* Certification badge. Absolutely placed on desktop; on narrow
          screens it drops into normal flow below the CTAs instead, where
          it doesn't cover the headline. */}
      <div className="relative flex w-fit items-center gap-3 rounded-card border border-line/70 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-sm max-lg:mx-6 max-lg:mb-10 lg:absolute lg:right-[5%] lg:bottom-[60px]">
        <Image
          src="/tuv_certified.webp"
          alt="TÜV Rheinland Certified"
          width={110}
          height={66}
          className="h-[52px] w-auto shrink-0"
        />
        <div className="max-w-[150px]">
          <div className="text-[13px] font-bold text-ink">{t("tuvTitle")}</div>
          <p className="mt-0.5 text-[11px] leading-snug text-muted">{t("tuvSubtitle")}</p>
        </div>
      </div>
    </section>
  );
}
