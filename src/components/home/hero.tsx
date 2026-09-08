import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ContactButton } from "@/components/contact-button";
import { Container } from "@/components/layout/container";
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

      {/* Same Container as the trust cards below, so the copy starts and
          the badge ends on exactly the same vertical lines as that row —
          a plain `px-[5%]` would drift apart from it past 1480px. */}
      <Container className="relative">
        {/* `items-end` puts the badge on the same horizontal line as the
            CTA buttons, which sit at the bottom of the text column. */}
        <div className="flex items-end justify-between gap-10 py-32 max-lg:flex-col max-lg:items-center max-lg:py-20">
          <div className="max-w-[680px] max-lg:w-full">
            {/* Pill-shaped eyebrow, from the redesign mockup — same copy
                as before, just framed so it reads as a label. */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-coprBlue/30 bg-coprBlue/10 px-4 py-1.5 text-[11.5px] font-bold tracking-[0.14em] text-coprBlue uppercase">
              <span aria-hidden="true">✦</span>
              {t("eyebrow")}
            </div>
            <h1 className="text-[56px] leading-[1.08] font-bold tracking-tight text-ink max-lg:text-4xl">
              <span className="text-coprBlue">{t("titleHighlight")}</span>{" "}
              {t("titleRest")}
            </h1>
            <p className="my-6 max-w-xl text-lg leading-relaxed text-muted">
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

          {/* Certification badge. Right edge lines up with the trust cards
              below; centred under the copy on narrow screens. */}
          <div className="rounded-card flex w-fit shrink-0 items-center gap-3 border border-line/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm max-lg:mt-10">
            <Image
              src="/tuv_certified.webp"
              alt="TÜV Rheinland Certified"
              width={110}
              height={66}
              className="h-[52px] w-auto shrink-0"
            />
            {/* Width tuned so the wrapped lines nearly fill the column in
                both languages. A wrapped paragraph's box is as wide as its
                max-width, not as its longest line, so a too-generous value
                leaves dead space that reads as an uneven right margin. */}
            <div className="max-w-[118px]">
              <div className="text-[13px] font-bold text-ink">{t("tuvTitle")}</div>
              {/* `text-balance` evens out the two lines, so the wrapped text
                  reaches closer to the edge and the right inner margin reads
                  the same as the left. */}
              <p className="mt-0.5 text-[11px] leading-snug text-balance text-muted">
                {t("tuvSubtitle")}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
