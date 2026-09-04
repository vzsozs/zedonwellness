"use client";

import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product, ProductSeries } from "@/db/schema";

type ProductWithSeries = Product & { series?: ProductSeries | null };

export function FeaturedProductsTabs({
  tabs,
}: {
  tabs: { slug: string; name: string; products: ProductWithSeries[] }[];
}) {
  const [active, setActive] = useState(tabs[0]?.slug);
  const current = tabs.find((tab) => tab.slug === active) ?? tabs[0];

  return (
    <div>
      {tabs.length > 1 ? (
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              onClick={() => setActive(tab.slug)}
              className={`px-6 py-2.5 text-sm font-semibold transition-colors ${
                tab.slug === current.slug
                  ? "bg-accent text-white"
                  : "bg-white text-ink hover:bg-accent-soft"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      ) : null}
      <div className="grid grid-cols-3 gap-7 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {current.products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
