import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function VirtualTourSection() {
  const t = useTranslations("home.virtualTour");

  return (
    <section className="px-16 py-22 max-lg:px-6">
      <div className="mx-auto flex max-w-[1000px] items-center gap-24 overflow-hidden px-12 py-16 text-left max-lg:max-w-2xl max-lg:flex-col max-lg:gap-0 max-lg:bg-accent-soft max-lg:px-6 max-lg:py-10 max-lg:text-center">
        <img
          src="/home/virtual-tour-icon.svg"
          alt=""
          className="h-64 w-64 shrink-0 max-lg:h-24 max-lg:w-24"
        />
        <div className="flex flex-col items-start max-lg:items-center">
          <h2 className="text-5xl font-bold max-lg:mt-6 max-lg:text-3xl">
            {t("titleStart")}{" "}
            <span className="text-coprBlue">{t("titleHighlight")}</span>
          </h2>
          <p className="mt-4 text-muted">{t("description")}</p>
          <Link
            href="/a-ceg"
            className="mt-8 inline-flex shrink-0 items-center gap-2.5 bg-coprBlue px-7 py-4 text-sm font-semibold whitespace-nowrap text-white hover:opacity-90"
          >
            {t("cta")}
            <ArrowRight className="size-4" strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
