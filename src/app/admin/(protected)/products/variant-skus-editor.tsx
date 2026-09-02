"use client";

import { useState } from "react";
import { Plus, X, ImagePlus } from "lucide-react";

type Sku = {
  key: string;
  nameHu: string;
  nameEn: string;
  sku: string;
  priceHuf: string;
  weightKg: string;
  imageUrl: string | null;
  previewUrl?: string;
  isDefault: boolean;
  inStock: boolean;
};

let keySeq = 0;
const nextKey = () => `sku-${++keySeq}`;

export function VariantSkusEditor({
  defaultVariants,
}: {
  defaultVariants: {
    nameHu: string;
    nameEn: string | null;
    sku: string | null;
    priceHuf: string | null;
    weightKg: string | null;
    imageUrl: string | null;
    isDefault: boolean;
    inStock: boolean;
  }[];
}) {
  const [skus, setSkus] = useState<Sku[]>(() =>
    defaultVariants.map((v) => ({
      key: nextKey(),
      nameHu: v.nameHu,
      nameEn: v.nameEn ?? "",
      sku: v.sku ?? "",
      priceHuf: v.priceHuf ?? "",
      weightKg: v.weightKg ?? "",
      imageUrl: v.imageUrl,
      isDefault: v.isDefault,
      inStock: v.inStock,
    })),
  );

  function addSku() {
    setSkus((s) => [
      ...s,
      {
        key: nextKey(),
        nameHu: "",
        nameEn: "",
        sku: "",
        priceHuf: "",
        weightKg: "",
        imageUrl: null,
        isDefault: s.length === 0,
        inStock: true,
      },
    ]);
  }

  function removeSku(key: string) {
    setSkus((s) => {
      const rest = s.filter((x) => x.key !== key);
      const removedWasDefault = s.find((x) => x.key === key)?.isDefault;
      if (removedWasDefault && rest.length > 0 && !rest.some((x) => x.isDefault)) {
        rest[0] = { ...rest[0], isDefault: true };
      }
      return rest;
    });
  }

  function update(key: string, patch: Partial<Sku>) {
    setSkus((s) => s.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  }

  function setDefault(key: string) {
    setSkus((s) => s.map((x) => ({ ...x, isDefault: x.key === key })));
  }

  const payload = JSON.stringify(
    skus.map((s) => ({
      key: s.key,
      nameHu: s.nameHu,
      nameEn: s.nameEn,
      sku: s.sku,
      priceHuf: s.priceHuf,
      weightKg: s.weightKg,
      imageUrl: s.imageUrl,
      isDefault: s.isDefault,
      inStock: s.inStock,
    })),
  );

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">
        Termékváltozatok (saját ár/SKU/súly/kép) — pl. illatok, ízek. A leírás
        és a többi mező közös marad az összes változatnál.
      </label>
      <input type="hidden" name="variantSkusData" value={payload} />

      <div className="flex flex-col gap-3">
        {skus.map((sku) => (
          <div key={sku.key} className="flex items-start gap-3 border border-line p-3">
            <label className="relative block size-20 shrink-0 cursor-pointer overflow-hidden border border-line">
              {sku.previewUrl || sku.imageUrl ? (
                <img
                  src={sku.previewUrl ?? sku.imageUrl ?? ""}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted">
                  <ImagePlus className="size-5" strokeWidth={1.6} />
                </div>
              )}
              <input
                type="file"
                name={`variantSkuFile_${sku.key}`}
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) update(sku.key, { previewUrl: URL.createObjectURL(file) });
                }}
              />
            </label>

            <div className="grid flex-1 grid-cols-2 gap-2.5">
              <input
                value={sku.nameHu}
                onChange={(e) => update(sku.key, { nameHu: e.target.value })}
                placeholder="Név (HU) — pl. Levendula"
                className="border border-line px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                value={sku.nameEn}
                onChange={(e) => update(sku.key, { nameEn: e.target.value })}
                placeholder="Név (EN)"
                className="border border-line px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                value={sku.sku}
                onChange={(e) => update(sku.key, { sku: e.target.value })}
                placeholder="SKU / cikkszám"
                className="border border-line px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                type="number"
                value={sku.priceHuf}
                onChange={(e) => update(sku.key, { priceHuf: e.target.value })}
                placeholder="Ár (Ft) — üres = alapár"
                className="border border-line px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                type="number"
                step="0.1"
                value={sku.weightKg}
                onChange={(e) => update(sku.key, { weightKg: e.target.value })}
                placeholder="Súly (kg) — üres = alapsúly"
                className="border border-line px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <label className="flex items-center gap-2 text-xs text-muted">
                <input
                  type="radio"
                  name="variantSkuDefault"
                  checked={sku.isDefault}
                  onChange={() => setDefault(sku.key)}
                  className="accent-accent"
                />
                Alapértelmezett
              </label>
              <label className="flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={sku.inStock}
                  onChange={(e) => update(sku.key, { inStock: e.target.checked })}
                  className="accent-accent"
                />
                Készleten
              </label>
            </div>

            <button
              type="button"
              onClick={() => removeSku(sku.key)}
              aria-label="Változat törlése"
              className="flex size-8 shrink-0 items-center justify-center text-muted hover:text-red-600"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSku}
        className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-dark"
      >
        <Plus className="size-4" /> Változat hozzáadása
      </button>
    </div>
  );
}
