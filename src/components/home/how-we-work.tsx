import { useTranslations } from "next-intl";

const STEPS = [
  { key: "hiTech", image: "/home/howwework-hitech.png" },
  { key: "physio", image: "/home/howwework-physio.png" },
  { key: "architect", image: "/home/howwework-architect.png" },
  { key: "ecological", image: "/home/howwework-ecological.png" },
] as const;

export function HowWeWork() {
  const t = useTranslations("home.howWeWork");

  return (
    <section className="bg-[#17201f] px-16 py-22 max-lg:px-6">
      <div className="mb-14 text-center">
        <h2 className="text-4xl font-bold text-white max-lg:text-3xl">
          {t("title")}
        </h2>
      </div>
      <div className="grid grid-cols-4 gap-8 max-lg:grid-cols-2 max-lg:gap-y-12">
        {STEPS.map((step) => (
          <div key={step.key} className="flex flex-col items-center text-center">
            <div className="flex size-[240px] items-center justify-center max-lg:size-[185px]">
              <img
                src={step.image}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
            <h3 className="mt-6 text-lg font-bold text-white">
              {t(`${step.key}.title`)}
            </h3>
            <p className="mt-2 max-w-56 text-sm leading-relaxed text-white/65">
              {t(`${step.key}.description`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
