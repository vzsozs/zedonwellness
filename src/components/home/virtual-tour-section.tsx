import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Container } from "@/components/layout/container";

export function VirtualTourSection() {
  const t = useTranslations("home.virtualTour");

  return (
    <Container as="section" className="py-22">
      {/* The mockup puts this on a near-black gradient panel; here it's a
          white card instead, so the section stays in the light palette the
          rest of the homepage uses. */}
      <div className="rounded-card grid grid-cols-[1.2fr_0.8fr] items-center gap-12 border border-line bg-white p-16 shadow-[0_16px_40px_-6px_rgba(15,45,80,0.10)] max-lg:grid-cols-1 max-lg:gap-8 max-lg:p-8 max-lg:text-center">
        <div className="max-lg:flex max-lg:flex-col max-lg:items-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-coprBlue/30 bg-coprBlue/10 px-4 py-1.5 text-[11.5px] font-bold tracking-[0.1em] text-coprBlue uppercase">
            {t("eyebrow")}
          </div>
          <h2 className="text-[42px] leading-tight font-bold tracking-[-0.01em] text-ink max-lg:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-xl text-[17px] leading-[1.7] text-muted">
            {t("description")}
          </p>
          <Link
            href="/a-ceg"
            className="rounded-control mt-8 inline-flex w-fit items-center gap-2.5 bg-accent px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            {t("cta")}
            <Play className="size-4 fill-current" strokeWidth={0} />
          </Link>
        </div>

        {/* Kept as the flat illustration rather than the mockup's photo
            preview — the icon is what makes this block recognisable. */}
        <div className="flex justify-center">
          <Image
            src="/home/virtual-tour-icon.svg"
            alt=""
            width={280}
            height={280}
            className="h-64 w-64 max-lg:h-40 max-lg:w-40"
          />
        </div>
      </div>
    </Container>
  );
}
