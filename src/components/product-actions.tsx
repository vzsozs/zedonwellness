"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Heart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatHuf } from "@/lib/config";
import { localized } from "@/lib/localized";

export type ProductSkuVariant = {
  id: number;
  nameHu: string;
  nameEn: string | null;
  sku: string | null;
  priceHuf: number | null;
  weightKg: number | null;
  imageUrl: string | null;
  isDefault: boolean;
  inStock: boolean;
};

export function ProductActions({
  productId,
  slug,
  nameHu,
  image,
  priceHuf,
  weightKg,
  orderOnly,
  inStock,
  variants = [],
}: {
  productId: number;
  slug: string;
  nameHu: string;
  image: string | null;
  priceHuf: number;
  weightKg: number | null;
  orderOnly: boolean;
  inStock: boolean;
  variants?: ProductSkuVariant[];
}) {
  const t = useTranslations("product");
  const locale = useLocale();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(
    () => variants.find((v) => v.isDefault)?.id ?? variants[0]?.id ?? null,
  );

  const selected = variants.find((v) => v.id === selectedId) ?? null;
  const effectivePrice = selected?.priceHuf ?? priceHuf;
  const effectiveWeight = selected ? (selected.weightKg ?? weightKg) : weightKg;
  const effectiveImage = selected?.imageUrl ?? image;
  const canOrder = inStock && (selected ? selected.inStock : true);

  function handleAdd() {
    addItem({
      productId,
      variantId: selected?.id ?? null,
      variantLabel: selected ? localized(locale, selected.nameHu, selected.nameEn) : null,
      slug,
      nameHu,
      image: effectiveImage,
      priceHuf: effectivePrice,
      weightKg: effectiveWeight,
      orderOnly,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div>
      <div className="mt-6 text-[32px] font-extrabold text-accent">
        {formatHuf(effectivePrice)}
      </div>

      {variants.length > 0 ? (
        <div className="mt-5.5">
          <h2 className="mb-3 text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
            {t("chooseVariant")}
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={!v.inStock}
                onClick={() => setSelectedId(v.id)}
                className={`flex items-center gap-2 border-[1.5px] py-2 pr-3.5 pl-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  v.id === selectedId
                    ? "border-coprBlue text-coprBlue"
                    : "border-line text-ink hover:border-ink"
                }`}
              >
                {v.imageUrl ? (
                  <img src={v.imageUrl} alt="" className="size-8 object-cover" />
                ) : null}
                {localized(locale, v.nameHu, v.nameEn)}
                {!v.inStock ? t("outOfStockSuffix") : ""}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!canOrder ? (
        <div className="mt-5.5 border-l-[3px] border-muted bg-paper-muted px-4.5 py-3.5 text-[13.5px] text-muted">
          {!inStock ? t("productOutOfStock") : t("variantOutOfStock")}
        </div>
      ) : null}

      <div className="mt-6.5 flex gap-3.5 max-sm:flex-col">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canOrder}
          className="flex-1 bg-coprBlue bg-[length:auto_140%] bg-left-bottom bg-no-repeat py-4.5 text-[15px] font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-muted disabled:bg-none"
          style={canOrder ? { backgroundImage: "url(/brand/button-wave.svg)" } : undefined}
        >
          {added ? t("addedToCart") : orderOnly ? t("orderNow") : t("addToCart")}
        </button>
        <button
          type="button"
          aria-label={t("favoriteAria")}
          className="flex w-14 items-center justify-center border-[1.5px] border-line bg-white transition-colors hover:border-ink hover:bg-ink hover:text-white"
        >
          <Heart className="size-5" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
