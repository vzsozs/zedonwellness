import { useTranslations } from "next-intl";
import { Price } from "@/lib/currency-context";

export function FeatureBadgeCard({
  name,
  iconUrl,
  priceHuf,
}: {
  name: string;
  iconUrl: string | null;
  priceHuf?: number | null;
}) {
  const t = useTranslations("product");

  return (
    <div className="overflow-hidden border-2 border-coprBlue">
      <div className="flex h-[166px] w-full items-center justify-center overflow-hidden p-6">
        {iconUrl ? (
          <img src={iconUrl} alt={name} className="h-full w-full object-contain" />
        ) : null}
      </div>
      <div className="p-5 text-center">
        <h3 className="text-base font-bold">{name}</h3>
        {priceHuf !== undefined ? (
          priceHuf === null ? (
            <div className="mt-2 text-sm font-extrabold text-accent">{t("includedLabel")}</div>
          ) : (
            <div className="mt-2 text-lg font-extrabold text-accent">
              <Price hufAmount={priceHuf} />
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
