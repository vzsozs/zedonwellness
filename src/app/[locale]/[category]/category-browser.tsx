"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { Product, ProductSeries } from "@/db/schema";
import { ProductCard } from "@/components/product-card";
import { PriceRangeSlider } from "./price-range-slider";

type ProductWithSeries = Product & { series?: ProductSeries | null };
type SortOrder = "name-asc" | "price-asc" | "price-desc";

export function CategoryBrowser({
  name,
  description,
  products,
  seriesList,
  banner,
}: {
  name: string;
  description: string;
  products: ProductWithSeries[];
  seriesList: ProductSeries[];
  banner?: ReactNode;
}) {
  const t = useTranslations("category");

  const capacityOptions = useMemo(
    () => [...new Set(products.map((p) => p.capacity).filter((c): c is number => c !== null))].sort((a, b) => a - b),
    [products],
  );

  const priceBounds = useMemo(() => {
    const prices = products.filter((p) => !p.priceOnRequest).map((p) => Number(p.priceHuf));
    return {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    };
  }, [products]);

  const [selectedSeriesIds, setSelectedSeriesIds] = useState<number[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("name-asc");

  const [loHuf, hiHuf] = priceRange ?? [priceBounds.min, priceBounds.max];

  const hasActiveFilters =
    selectedSeriesIds.length > 0 ||
    selectedCapacities.length > 0 ||
    (priceRange !== null && (priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max));

  function toggle(list: number[], value: number, setList: (v: number[]) => void) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function clearFilters() {
    setSelectedSeriesIds([]);
    setSelectedCapacities([]);
    setPriceRange(null);
  }

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (selectedSeriesIds.length > 0 && (p.seriesId === null || !selectedSeriesIds.includes(p.seriesId))) {
        return false;
      }
      if (selectedCapacities.length > 0 && (p.capacity === null || !selectedCapacities.includes(p.capacity))) {
        return false;
      }
      if (!p.priceOnRequest) {
        const price = Number(p.priceHuf);
        if (price < loHuf || price > hiHuf) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortOrder === "name-asc") return a.nameHu.localeCompare(b.nameHu, "hu");
      const priceA = a.priceOnRequest ? Infinity : Number(a.priceHuf);
      const priceB = b.priceOnRequest ? Infinity : Number(b.priceHuf);
      return sortOrder === "price-asc" ? priceA - priceB : priceB - priceA;
    });

    return list;
  }, [products, selectedSeriesIds, selectedCapacities, loHuf, hiHuf, sortOrder]);

  const filterFieldset = (
    <>
      {seriesList.length > 0 ? (
        <div className="mb-5.5 border-b border-line pb-5.5">
          <div className="mb-4 text-[13px] font-bold tracking-wide text-ink uppercase">
            {t("series")}
          </div>
          <div className="flex flex-col gap-3 text-sm text-muted">
            {seriesList.map((series) => (
              <label key={series.id} className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedSeriesIds.includes(series.id)}
                  onChange={() => toggle(selectedSeriesIds, series.id, setSelectedSeriesIds)}
                  className="accent-accent"
                />
                {series.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {capacityOptions.length > 0 ? (
        <div className="mb-5.5 border-b border-line pb-5.5">
          <div className="mb-4 text-[13px] font-bold tracking-wide text-ink uppercase">
            {t("capacity")}
          </div>
          <div className="flex flex-col gap-3 text-sm text-muted">
            {capacityOptions.map((capacity) => (
              <label key={capacity} className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedCapacities.includes(capacity)}
                  onChange={() => toggle(selectedCapacities, capacity, setSelectedCapacities)}
                  className="accent-accent"
                />
                {t("capacityUnit", { capacity })}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {priceBounds.max > priceBounds.min ? (
        <div className="mb-5.5 border-b border-line pb-5.5">
          <div className="mb-4 text-[13px] font-bold tracking-wide text-ink uppercase">
            {t("price")}
          </div>
          <PriceRangeSlider
            min={priceBounds.min}
            max={priceBounds.max}
            loHuf={loHuf}
            hiHuf={hiHuf}
            onChange={(lo, hi) => setPriceRange([lo, hi])}
          />
        </div>
      ) : null}

      <div className="mb-5.5">
        <label className="mb-4 block text-[13px] font-bold tracking-wide text-ink uppercase">
          {t("sortLabel")}
        </label>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="w-full border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        >
          <option value="name-asc">{t("sortNameAsc")}</option>
          <option value="price-asc">{t("sortPriceAsc")}</option>
          <option value="price-desc">{t("sortPriceDesc")}</option>
        </select>
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-muted underline hover:text-ink"
        >
          {t("filterClear")}
        </button>
      ) : null}
    </>
  );

  return (
    <div className="px-16 max-lg:px-6">
      {banner ? <div className="mt-8">{banner}</div> : null}

      <div className="mt-5 flex items-end justify-between max-sm:flex-col max-sm:items-start max-sm:gap-3">
        <div>
          <h1 className="text-4xl font-semibold max-lg:text-3xl">{name}</h1>
          {description ? (
            <p className="mt-2.5 max-w-xl text-sm text-muted">{description}</p>
          ) : null}
        </div>
        <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
          {t("productCount", { count: filtered.length })}
        </div>
      </div>

      <div className="flex gap-10 pt-9 pb-25 max-lg:flex-col">
        {/* Desktop filters */}
        <aside className="w-64 shrink-0 max-lg:hidden">
          <div className="bg-[#f2f8fd] p-6">{filterFieldset}</div>
        </aside>

        <div className="flex-1">
          {/* Mobile filters */}
          <details className="mb-8 bg-[#f2f8fd] p-5 max-lg:block lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold text-ink">
              {t("series")} / {t("price")}
            </summary>
            <div className="mt-5">{filterFieldset}</div>
          </details>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted">
              {hasActiveFilters ? t("noResults") : t("comingSoon")}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-x-6 gap-y-6.5 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {filtered.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
