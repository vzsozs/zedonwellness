"use client";

import { useTranslations, useLocale } from "next-intl";
import { SafeImage } from "@/components/safe-image";
import { Link } from "@/i18n/navigation";
import { Price } from "@/lib/currency-context";
import { localized } from "@/lib/localized";
import { getProductGradient } from "@/lib/visuals";
import type { ProductSeries } from "@/db/schema";

/**
 * Exactly the fields a listing card renders.
 *
 * Listings used to select whole product rows and hand them to a client
 * component, which serialised every long description, spec table and
 * variant blob into the page payload for nothing. Queries project to this
 * shape instead.
 */
export type ProductCardData = {
  id: number;
  slug: string;
  nameHu: string;
  nameEn: string | null;
  shortDescriptionHu: string | null;
  shortDescriptionEn: string | null;
  priceHuf: string;
  priceEur: string | null;
  priceOnRequest: boolean;
  capacity: number | null;
  seriesId: number | null;
  cardImage: string | null;
  mainImage: string | null;
  images: string[];
  inStock: boolean;
  isNew: boolean;
  isOnSale: boolean;
  series?: ProductSeries | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const image = product.cardImage ?? product.mainImage ?? product.images[0];
  const name = localized(locale, product.nameHu, product.nameEn);
  const shortDescription = localized(
    locale,
    product.shortDescriptionHu ?? "",
    product.shortDescriptionEn,
  );
  const badge = !product.inStock
    ? { label: t("badgeOutOfStock"), tone: "muted" as const }
    : product.isNew
      ? { label: t("badgeNew"), tone: "ink" as const }
      : product.isOnSale
        ? { label: t("badgeSale"), tone: "accent" as const }
        : null;

  return (
    <Link
      href={`/termek/${product.slug}`}
      className="rounded-card group block overflow-hidden bg-white transition-shadow hover:shadow-[0_8px_28px_rgba(15,45,80,0.12)]"
    >
      <div className="relative aspect-square overflow-hidden">
        {image ? (
          <SafeImage
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 300px"
            className="object-contain p-5"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${getProductGradient(product.id)}`} />
        )}
        {badge ? (
          <span
            className={`absolute top-3 left-3 z-10 ${
              badge.tone === "ink"
                ? "bg-ink"
                : badge.tone === "muted"
                  ? "bg-muted"
                  : "bg-accent"
            } px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-white`}
          >
            {badge.label}
          </span>
        ) : null}
      </div>
      <div className="px-5 py-6">
        <div className="text-xl font-extrabold text-coprBlue">
          {product.priceOnRequest ? t("priceOnRequestLabel") : <Price hufAmount={product.priceHuf} eurAmount={product.priceEur} />}
        </div>
        <h3 className="mt-1.5 text-lg font-bold group-hover:text-accent">{name}</h3>
        {shortDescription ? (
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{shortDescription}</p>
        ) : null}
      </div>
    </Link>
  );
}
