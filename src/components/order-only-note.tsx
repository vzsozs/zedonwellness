"use client";

import { useTranslations } from "next-intl";
import { useCurrency } from "@/lib/currency-context";

export function OrderOnlyNote({ thresholdHuf }: { thresholdHuf: number }) {
  const t = useTranslations("product");
  const { format } = useCurrency();
  return (
    <div className="mt-6 border-l-[3px] border-accent bg-paper-muted px-4.5 py-3.5 text-[13.5px] text-muted">
      {t("orderOnlyNote", { threshold: format(thresholdHuf) })}
    </div>
  );
}
