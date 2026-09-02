"use client";

import { useState } from "react";
import type { Category, ProductSeries } from "@/db/schema";

export function CategorySeriesFields({
  categories,
  seriesList,
  defaultCategoryId,
  defaultSeriesId,
}: {
  categories: Category[];
  seriesList: ProductSeries[];
  defaultCategoryId?: number;
  defaultSeriesId?: number | null;
}) {
  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? "");
  const availableSeries = seriesList.filter(
    (s) => String(s.categoryId) === String(categoryId),
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-muted">
          Kategória
        </label>
        <select
          name="categoryId"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        >
          <option value="" disabled>
            Válassz…
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameHu}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-muted">
          Sorozat
        </label>
        <select
          name="seriesId"
          defaultValue={defaultSeriesId ?? ""}
          disabled={availableSeries.length === 0}
          className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent disabled:bg-paper-muted disabled:text-muted"
        >
          <option value="">
            {availableSeries.length === 0 ? "Nincs sorozat ebben a kategóriában" : "Nincs (opcionális)"}
          </option>
          {availableSeries.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
