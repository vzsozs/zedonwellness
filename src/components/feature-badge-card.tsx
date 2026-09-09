import { useTranslations } from "next-intl";
import { Price } from "@/lib/currency-context";
import { SafeImage } from "@/components/safe-image";

export function FeatureBadgeCard({
  name,
  iconUrl,
  priceHuf,
  priceEur,
}: {
  name: string;
  iconUrl: string | null;
  priceHuf?: number | null;
  priceEur?: number | string | null;
}) {
  const t = useTranslations("product");

  return (
    <div className="rounded-card overflow-hidden border-2 border-coprBlue">
      <div className="flex h-[166px] w-full items-center justify-center overflow-hidden p-6">
        {iconUrl ? (
          <SafeImage
            src={iconUrl}
            alt={name}
            width={176}
            height={166}
            className="h-full w-full object-contain"
          />
        ) : null}
      </div>
      <div className="p-5 text-center">
        <h3 className="text-base font-bold">{name}</h3>
        {priceHuf !== undefined ? (
          priceHuf === null ? (
            <div className="mt-2 text-sm font-extrabold text-accent">{t("includedLabel")}</div>
          ) : (
            <div className="mt-2 text-lg font-extrabold text-accent">
              <Price hufAmount={priceHuf} eurAmount={priceEur} />
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
