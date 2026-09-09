"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  ArrowRight,
  Droplets,
  Flame,
  Grid3x3,
  Lightbulb,
  Maximize,
  Settings2,
  Thermometer,
  Users,
  Waves,
  Weight,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Price } from "@/lib/currency-context";
import { SafeImage } from "@/components/safe-image";
import { localized } from "@/lib/localized";
import { getProductGradient } from "@/lib/visuals";
import type { ProductSeries } from "@/db/schema";

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
  categoryId: number;
  cardImage: string | null;
  mainImage: string | null;
  images: string[];
  specs: { label: string; value: string; type?: "text" | "boolean" }[];
  inStock: boolean;
  isNew: boolean;
  isOnSale: boolean;
  series?: ProductSeries | null;
};

/**
 * Picks an icon for a spec row from its label.
 *
 * Specs are free-text label/value pairs entered in the admin, so there's no
 * enum to switch on — this matches on the words that actually occur in the
 * catalogue (surveyed with scripts/migrate-webflow/list-spec-labels.mts).
 * Anything unrecognised falls back to a neutral mark rather than a wrong
 * one.
 */
const ICON_RULES: [RegExp, LucideIcon][] = [
  [/fúvóka|befúvó|jet|masszázs/i, Waves],
  [/méret|dimenz|size/i, Maximize],
  [/tömeg|súly|weight/i, Weight],
  [/teljesítmény|watt|power/i, Zap],
  [/hőmérs|hőmérő|temp/i, Thermometer],
  [/világít|lámpa|led|light/i, Lightbulb],
  [/égő|tűz|burner|flame/i, Flame],
  [/vezérlés|control/i, Settings2],
  [/víz|water|szivattyú|pump/i, Droplets],
  [/rács|felület|grid|grill/i, Grid3x3],
];

function iconFor(label: string): LucideIcon {
  return ICON_RULES.find(([re]) => re.test(label))?.[1] ?? Grid3x3;
}

const MAX_SPECS = 3;

export function ProductCard({ product }: { product: ProductCardData }) {
  const t = useTranslations("product");
  const locale = useLocale();

  const image = product.cardImage ?? product.mainImage ?? product.images[0];
  const name = localized(locale, product.nameHu, product.nameEn);
  const description = localized(
    locale,
    product.shortDescriptionHu ?? "",
    product.shortDescriptionEn,
  );

  // Capacity is a structured field, so it leads; the rest come from the
  // admin-ordered spec list. Boolean specs ("has a thermometer": yes/no)
  // are skipped — a check mark with no number says nothing at card size.
  const strip: { icon: LucideIcon; text: string }[] = [];
  if (product.capacity !== null) {
    strip.push({ icon: Users, text: t("capacityValue", { count: product.capacity }) });
  }
  for (const spec of product.specs) {
    if (strip.length >= MAX_SPECS) break;
    if (spec.type === "boolean" || !spec.value.trim()) continue;
    strip.push({ icon: iconFor(spec.label), text: spec.value });
  }

  return (
    <div className="rounded-card group flex flex-col overflow-hidden border border-line bg-white transition-all duration-300 hover:-translate-y-[3px] hover:border-accent hover:shadow-[0_16px_40px_-6px_rgba(15,45,80,0.14)]">
      <Link href={`/termek/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        {image ? (
          <SafeImage
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 420px"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${getProductGradient(product.id)}`} />
        )}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
          {product.isOnSale ? (
            <span className="rounded-control bg-accent px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-white">
              {t("badgeSale")}
            </span>
          ) : null}
          {product.isNew ? (
            <span className="rounded-control bg-ink px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-white">
              {t("badgeNew")}
            </span>
          ) : null}
          {/* Non-token colours on purpose: these badges sit on the photo,
              not on the page surface, so they must stay dark-on-white even
              under the grill dark theme — which flips `text-ink` but leaves
              `bg-white/90` alone. */}
          <span
            className={`rounded-control px-2.5 py-1 text-[10.5px] font-bold tracking-wide ${
              product.inStock ? "bg-white/90 text-neutral-900" : "bg-muted text-white"
            }`}
          >
            {product.inStock ? t("badgeInStock") : t("badgeOutOfStock")}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        {product.series ? (
          <div className="text-[11px] font-bold tracking-[0.08em] text-coprBlue uppercase">
            {product.series.name} {t("seriesSuffix")}
          </div>
        ) : null}
        <h3 className="mt-1.5 text-[19px] leading-snug font-bold text-ink">
          <Link href={`/termek/${product.slug}`} className="group-hover:text-accent">
            {name}
          </Link>
        </h3>
        {description ? (
          <p className="mt-2 line-clamp-3 text-[13.5px] leading-[1.55] text-muted">
            {description}
          </p>
        ) : null}

        {strip.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-4">
            {strip.map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 text-[12.5px] text-muted">
                <Icon className="size-4 shrink-0 text-accent" strokeWidth={1.8} />
                {text}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-3 pt-5">
          <div className="text-xl font-extrabold whitespace-nowrap text-coprBlue">
            {product.priceOnRequest ? (
              t("priceOnRequestLabel")
            ) : (
              <Price hufAmount={product.priceHuf} eurAmount={product.priceEur} />
            )}
          </div>
          <Link
            href={`/termek/${product.slug}`}
            className="rounded-control inline-flex shrink-0 items-center gap-1.5 bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            {t("detailsCta")}
            <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
