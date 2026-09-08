import { useTranslations } from "next-intl";
import type { Extra } from "@/db/schema";
import { Price } from "@/lib/currency-context";
import { SafeImage } from "@/components/safe-image";

export function ExtraCard({ name, extra }: { name: string; extra: Extra }) {
  const t = useTranslations("product");
  const included = Number(extra.priceHuf) === 0;

  return (
    <div className="overflow-hidden border-2 border-coprBlue">
      <div className="flex h-32 w-full items-center justify-center overflow-hidden p-6">
        {extra.imageUrl ? (
          <SafeImage
            src={extra.imageUrl}
            alt={name}
            width={200}
            height={128}
            className="h-full w-full object-contain"
          />
        ) : null}
      </div>
      <div className="p-5 text-center">
        <h3 className="text-base font-bold">{name}</h3>
        {included ? (
          <div className="mt-2 text-sm font-extrabold text-accent">{t("includedLabel")}</div>
        ) : (
          <div className="mt-2 text-lg font-extrabold text-accent">
            <Price hufAmount={extra.priceHuf} eurAmount={extra.priceEur} />
          </div>
        )}
      </div>
    </div>
  );
}
