import { Link } from "@/i18n/navigation";
import { formatHuf } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/termek/${product.slug}`} className="group block">
      <div className={`relative h-58 bg-gradient-to-br ${product.gradient}`}>
        {product.badge ? (
          <span
            className={`absolute top-3 left-3 ${
              product.badge.tone === "ink" ? "bg-ink" : "bg-accent"
            } px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-white`}
          >
            {product.badge.label}
          </span>
        ) : null}
      </div>
      <div className="py-4">
        <div className="text-[11.5px] font-semibold tracking-wide text-muted uppercase">
          {product.series}
        </div>
        <h3 className="mt-1.5 text-base font-bold group-hover:text-accent">
          {product.nameHu}
        </h3>
        <div className="mt-1 text-[12.5px] text-muted">{product.capacityHu}</div>
        <div className="mt-3 text-[16.5px] font-bold text-accent">
          {product.customQuote ? "Egyedi ajánlat" : formatHuf(product.priceHuf)}
        </div>
      </div>
    </Link>
  );
}
