import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Price } from "@/lib/currency-context";
import { getProductGradient } from "@/lib/visuals";
import type { Product, ProductSeries } from "@/db/schema";

type ProductWithSeries = Product & { series?: ProductSeries | null };

export function ProductCard({ product }: { product: ProductWithSeries }) {
  const t = useTranslations("product");
  const image = product.cardImage ?? product.mainImage ?? product.images[0];
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
      className="group mx-auto block w-[70%] bg-white transition-shadow hover:shadow-[0_8px_28px_rgba(15,45,80,0.12)]"
    >
      <div className="relative aspect-square overflow-hidden">
        {image ? (
          <div className="h-full w-full p-5">
            <img
              src={image}
              alt={product.nameHu}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${getProductGradient(product.id)}`} />
        )}
        {badge ? (
          <span
            className={`absolute top-3 left-3 ${
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
          {product.priceOnRequest ? t("priceOnRequestLabel") : <Price hufAmount={product.priceHuf} />}
        </div>
        <h3 className="mt-1.5 text-lg font-bold group-hover:text-accent">
          {product.nameHu}
        </h3>
        {product.shortDescriptionHu ? (
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
            {product.shortDescriptionHu}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
