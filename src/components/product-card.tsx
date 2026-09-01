import { Link } from "@/i18n/navigation";
import { formatHuf } from "@/lib/config";
import { getProductGradient } from "@/lib/visuals";
import type { Product, ProductSeries } from "@/db/schema";

type ProductWithSeries = Product & { series?: ProductSeries | null };

export function ProductCard({ product }: { product: ProductWithSeries }) {
  const image = product.mainImage ?? product.images[0];
  const badge = product.isNew
    ? { label: "ÚJDONSÁG", tone: "ink" as const }
    : product.isOnSale
      ? { label: "AKCIÓ", tone: "accent" as const }
      : null;

  return (
    <Link href={`/termek/${product.slug}`} className="group block">
      <div
        className={
          image
            ? "relative h-58 bg-cover bg-center"
            : `relative h-58 bg-gradient-to-br ${getProductGradient(product.id)}`
        }
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      >
        {badge ? (
          <span
            className={`absolute top-3 left-3 ${
              badge.tone === "ink" ? "bg-ink" : "bg-accent"
            } px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-white`}
          >
            {badge.label}
          </span>
        ) : null}
      </div>
      <div className="py-4">
        {product.series ? (
          <div className="text-[11.5px] font-semibold tracking-wide text-muted uppercase">
            {product.series.name}
          </div>
        ) : null}
        <h3 className="mt-1.5 text-lg font-bold group-hover:text-accent">
          {product.nameHu}
        </h3>
        {product.subtitleHu ? (
          <div className="mt-1 text-[12.5px] text-muted">{product.subtitleHu}</div>
        ) : null}
        <div className="mt-3 text-xl font-extrabold text-accent">
          {formatHuf(product.priceHuf)}
        </div>
      </div>
    </Link>
  );
}
