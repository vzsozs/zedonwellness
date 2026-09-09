"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductSeries } from "@/db/schema";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { Container } from "@/components/layout/container";
import { PriceRangeSlider } from "./price-range-slider";

type SortOrder = "name-asc" | "price-asc" | "price-desc";

export function CategoryBrowser({
  name,
  description,
  eyebrow,
  products,
  seriesList,
  banner,
  breadcrumb,
}: {
  name: string;
  description: string;
  /** Small label above the title — the category's card badge. */
  eyebrow?: string;
  products: ProductCardData[];
  seriesList: ProductSeries[];
  banner?: ReactNode;
  breadcrumb?: ReactNode;
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
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="rounded-control w-full appearance-none border border-line bg-white px-3 py-2 pr-9 text-sm text-ink outline-none focus:border-accent"
          >
            <option value="name-asc">{t("sortNameAsc")}</option>
            <option value="price-asc">{t("sortPriceAsc")}</option>
            <option value="price-desc">{t("sortPriceDesc")}</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
            strokeWidth={1.8}
          />
        </div>
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

  /** Series shortcuts in the hero. They drive the same state as the
   * sidebar checkboxes rather than a second, parallel filter — two
   * controls for one thing is how filter UIs get out of sync. */
  const seriesCounts = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of products) {
      if (p.seriesId !== null) map.set(p.seriesId, (map.get(p.seriesId) ?? 0) + 1);
    }
    return map;
  }, [products]);

  return (
    <div>
      {/* Dark banner from the redesign mockup, in our palette. */}
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,#111a19_0%,#1b2a28_50%,#111a19_100%)] py-16 text-white max-lg:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[5%] size-[550px] rounded-full bg-[radial-gradient(circle,rgba(4,187,240,0.16)_0%,rgba(14,140,154,0.05)_50%,transparent_70%)]"
        />
        <Container className="relative">
          {eyebrow ? (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-coprBlue/35 bg-coprBlue/15 px-4 py-1.5 text-[11.5px] font-bold tracking-[0.1em] text-coprBlue uppercase">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="max-w-4xl text-[48px] leading-tight font-bold tracking-[-0.01em] max-lg:text-4xl max-sm:text-3xl">
            {name}
          </h1>
          {description ? (
            <p className="mt-3.5 max-w-[720px] text-[16.5px] leading-[1.7] text-white/70">
              {description}
            </p>
          ) : null}

          {seriesList.length > 0 ? (
            <div className="mt-7 flex flex-wrap gap-2.5">
              <ChipButton
                active={selectedSeriesIds.length === 0}
                count={products.length}
                onClick={() => setSelectedSeriesIds([])}
              >
                {t("allModels")}
              </ChipButton>
              {seriesList.map((series) => (
                <ChipButton
                  key={series.id}
                  active={selectedSeriesIds.includes(series.id)}
                  count={seriesCounts.get(series.id) ?? 0}
                  onClick={() => toggle(selectedSeriesIds, series.id, setSelectedSeriesIds)}
                >
                  {series.name}
                </ChipButton>
              ))}
            </div>
          ) : null}
        </Container>
      </section>

      <Container>
      {breadcrumb ? <div className="pt-6">{breadcrumb}</div> : null}
      {banner ? <div className="mt-8">{banner}</div> : null}

      <div className="mt-8 flex items-end justify-between max-sm:flex-col max-sm:items-start max-sm:gap-3">
        <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
          {t("productCount", { count: filtered.length })}
        </div>
      </div>

      <div className="flex gap-10 pt-6 pb-25 max-lg:flex-col">
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
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-6 gap-y-6.5 max-sm:grid-cols-1">
              {filtered.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
      </Container>
    </div>
  );
}

function ChipButton({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-[18px] py-2 text-[13px] font-semibold transition-colors ${
        active
          ? "border-coprBlue bg-coprBlue text-white shadow-[0_0_16px_rgba(4,187,240,0.3)]"
          : "border-white/15 bg-white/[0.06] text-white/85 hover:bg-white/[0.12]"
      }`}
    >
      {children}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[11px] ${
          active ? "bg-black/20" : "bg-black/25 text-white/70"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
