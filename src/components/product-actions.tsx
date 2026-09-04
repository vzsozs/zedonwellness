"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import { ContactButton } from "@/components/contact-button";
import { useCart } from "@/lib/cart-context";
import { Price } from "@/lib/currency-context";
import { localized } from "@/lib/localized";
import { useProductMedia } from "@/lib/product-media-context";

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
  priceOnRequest = false,
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
  priceOnRequest?: boolean;
  weightKg: number | null;
  orderOnly: boolean;
  inStock: boolean;
  variants?: ProductSkuVariant[];
}) {
  const t = useTranslations("product");
  const locale = useLocale();
  const { addItem } = useCart();
  const { setVariantImage } = useProductMedia();
  const [added, setAdded] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(
    () => variants.find((v) => v.isDefault)?.id ?? variants[0]?.id ?? null,
  );

  const selected = variants.find((v) => v.id === selectedId) ?? null;
  const effectivePrice = selected?.priceHuf ?? priceHuf;
  const effectiveWeight = selected ? (selected.weightKg ?? weightKg) : weightKg;
  const effectiveImage = selected?.imageUrl ?? image;
  const canOrder = inStock && (selected ? selected.inStock : true);

  // Swap the main gallery photo when a variant with its own image is picked.
  useEffect(() => {
    setVariantImage(selected?.imageUrl ?? null);
  }, [selected, setVariantImage]);
  useEffect(() => () => setVariantImage(null), [setVariantImage]);

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

  if (priceOnRequest) {
    return (
      <div>
        <div className="mt-6 text-2xl font-extrabold text-accent">
          {t("priceOnRequestLabel")}
        </div>
        <p className="mt-2 text-sm text-muted">{t("priceOnRequestNote")}</p>
        <ContactButton className="mt-5 inline-block border-[1.5px] border-ink px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-white">
          {t("contactCta")}
        </ContactButton>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-6 text-[32px] font-extrabold text-accent">
        <Price hufAmount={effectivePrice} />
      </div>

      {variants.length > 0 ? (
        <div className="mt-5.5">
          <label className="mb-3 block text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
            {t("chooseVariant")}
          </label>
          <div className="relative">
            <select
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="w-full appearance-none border-[1.5px] border-line bg-white px-4 py-3 pr-10 text-sm font-semibold text-ink outline-none focus:border-coprBlue"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id} disabled={!v.inStock}>
                  {localized(locale, v.nameHu, v.nameEn)}
                  {!v.inStock ? t("outOfStockSuffix") : ""}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted"
              strokeWidth={1.8}
            />
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
      </div>
    </div>
  );
}
