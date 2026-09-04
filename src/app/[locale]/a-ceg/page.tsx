import { ChevronDown } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

const PILLARS = [
  { key: "hiTech", image: "/home/howwework-hitech.png" },
  { key: "physio", image: "/home/howwework-physio.png" },
  { key: "architect", image: "/home/howwework-architect.png" },
  { key: "ecological", image: "/home/howwework-ecological.png" },
] as const;

const PRICING_ROWS = [
  "callout",
  "hourly",
  "maintenance",
  "commissioning",
  "assessment",
] as const;

const WEEKLY_ROWS = ["hardness", "ph", "disinfection", "foam", "filter"] as const;

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("company");
  const winterizingSteps = t.raw("maintenance.winterizing.steps") as string[];
  const springPrepSteps = t.raw("maintenance.springPrep.steps") as string[];

  return (
    <main>
      {/* Hero */}
      <div className="px-16 pt-16 pb-14 text-center max-lg:px-6">
        <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
          {t("eyebrow")}
        </div>
        <h1 className="mx-auto mt-3.5 max-w-4xl text-4xl font-bold max-lg:text-3xl">
          {t("heroTitleStart")} <span className="text-accent">{t("heroTitleHighlight")}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-4xl text-muted">{t("heroSubtitle")}</p>
      </div>

      {/* Why us — 4 pillars */}
      <div id="gyar" className="bg-white px-16 py-20 max-lg:px-6">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="text-center text-4xl font-bold max-lg:text-3xl">
            {t("pillarsTitle")}
          </h2>
          <div className="mt-12 grid grid-cols-4 gap-7 max-lg:grid-cols-2">
            {PILLARS.map((pillar) => (
              <div key={pillar.key} className="border border-line">
                <div className="flex h-40 items-center justify-center bg-paper-muted p-6">
                  <img src={pillar.image} alt="" className="h-full w-full object-contain" />
                </div>
                <div className="p-6">
                  <h3 className="text-base font-bold">{t(`pillars.${pillar.key}.title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {t(`pillars.${pillar.key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service */}
      <div id="szerviz" className="bg-[#ebf6fe] px-16 py-20 max-lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold max-lg:text-3xl">{t("serviceTitle")}</h2>
          <p className="mt-4 text-muted">{t("serviceDescription0")}</p>
          <p className="mt-4 text-muted">{t("serviceDescription1")}</p>
          <p className="mt-4 text-muted">{t("serviceDescription2")}</p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl bg-white p-8 max-lg:p-6">
          <h3 className="text-center text-lg font-bold">{t("pricingTitle")}</h3>
          <div className="mt-6">
            {PRICING_ROWS.map((row) => (
              <div
                key={row}
                className="flex items-baseline justify-between gap-4 border-b border-line py-3.5 last:border-b-0"
              >
                <span className="text-sm">{t(`pricing.${row}.label`)}</span>
                <span className="shrink-0 text-sm font-bold text-coprBlue">
                  {t(`pricing.${row}.price`)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-muted">{t("pricingNote")}</p>
          <p className="mt-1 text-xs text-muted">{t("pricingFootnote")}</p>
        </div>

        {/* Maintenance guide — collapsed by default */}
        <details className="group mx-auto mt-6 max-w-4xl">
          <summary className="flex cursor-pointer list-none items-center justify-between border border-line px-6 py-4 text-sm font-semibold marker:content-none">
            {t("maintenance.toggleLabel")}
            <ChevronDown
              className="size-4 shrink-0 transition-transform group-open:rotate-180"
              strokeWidth={2}
            />
          </summary>

          <div className="border border-t-0 border-line p-8 max-lg:p-6">
            <p className="text-sm leading-relaxed text-muted">{t("maintenance.intro")}</p>

            <h4 className="mt-8 text-base font-bold">{t("maintenance.daily.title")}</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {t("maintenance.daily.text")}
            </p>

            <h4 className="mt-8 text-base font-bold">{t("maintenance.weekly.title")}</h4>
            <div className="mt-2 space-y-4">
              {WEEKLY_ROWS.map((row) => (
                <div key={row} className="flex gap-4 max-sm:flex-col">
                  <div className="flex-1">
                    <h5 className="text-sm font-bold text-ink">
                      {t(`maintenance.weekly.${row}.title`)}
                    </h5>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {t(`maintenance.weekly.${row}.text`)}
                    </p>
                  </div>
                  {row === "filter" ? (
                    <img
                      src="/company/maintenance/filter-cartridge.jpg"
                      alt=""
                      className="h-24 w-32 shrink-0 border border-line object-cover"
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <h4 className="mt-8 text-base font-bold">{t("maintenance.quarterly.title")}</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {t("maintenance.quarterly.text")}
            </p>
            <div className="mt-4 grid grid-cols-4 gap-3 max-sm:grid-cols-2">
              {[
                "drain-pipe-1.jpg",
                "drain-pipe-2.jpg",
                "drain-cleaning.jpg",
                "refill-cleaning.jpg",
              ].map((file) => (
                <img
                  key={file}
                  src={`/company/maintenance/${file}`}
                  alt=""
                  className="aspect-square w-full border border-line object-cover"
                />
              ))}
            </div>

            <h4 className="mt-8 text-base font-bold">{t("maintenance.yearly.title")}</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {t("maintenance.yearly.text")}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-8 max-lg:grid-cols-1">
              <div>
                <h4 className="text-base font-bold">{t("maintenance.winterizing.title")}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t("maintenance.winterizing.intro")}
                </p>
                <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                  {winterizingSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h4 className="text-base font-bold">{t("maintenance.springPrep.title")}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t("maintenance.springPrep.intro")}
                </p>
                <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                  {springPrepSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Exclusive distributor */}
      <div className="bg-white px-16 py-20 max-lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <img
            src="/company/logo-hanscraft.png"
            alt="Hanscraft"
            className="mx-auto h-10 w-auto object-contain"
          />
          <h2 className="mt-6 text-4xl font-bold max-lg:text-3xl">{t("distributorTitle")}</h2>
          <p className="mt-4 text-muted">{t("distributorDescription")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="border border-line bg-paper-muted px-4 py-2 text-xs font-semibold">
              {t("distributorBadge1")}
            </span>
            <span className="border border-line bg-paper-muted px-4 py-2 text-xs font-semibold">
              {t("distributorBadge2")}
            </span>
            <span className="border border-line bg-paper-muted px-4 py-2 text-xs font-semibold">
              {t("distributorBadge3")}
            </span>
          </div>
        </div>
        <div className="mx-auto mt-14 max-w-4xl">
          <img
            src="/company/hanscraft-tech-partners.jpg"
            alt=""
            className="w-full object-contain"
          />
          <p className="mt-4 text-center text-xs text-muted">{t("partnersCaption")}</p>
        </div>
      </div>

      {/* Water treatment / full builds */}
      <div className="bg-white px-16 py-20 max-lg:px-6">
        <div className="mx-auto flex max-w-4xl items-center gap-14 max-lg:flex-col max-lg:gap-8 max-lg:text-center">
          <img
            src="/company/logo-aqua-excellent.jpg"
            alt="Aqua Excellent"
            className="h-20 w-auto shrink-0 border border-line object-contain p-3"
          />
          <div>
            <h2 className="text-4xl font-bold max-lg:text-3xl">{t("waterTitle")}</h2>
            <p className="mt-4 text-muted">{t("waterDescription")}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
