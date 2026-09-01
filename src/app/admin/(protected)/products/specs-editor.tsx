"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

type Row = { key: string; label: string; value: string };

let keySeq = 0;
const nextKey = () => `spec-${++keySeq}`;

export function SpecsEditor({
  defaultSpecs,
}: {
  defaultSpecs: { label: string; value: string }[];
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    defaultSpecs.map((s) => ({ key: nextKey(), ...s })),
  );

  function update(key: string, field: "label" | "value", val: string) {
    setRows((r) => r.map((row) => (row.key === key ? { ...row, [field]: val } : row)));
  }

  function remove(key: string) {
    setRows((r) => r.filter((row) => row.key !== key));
  }

  function add() {
    setRows((r) => [...r, { key: nextKey(), label: "", value: "" }]);
  }

  const payload = JSON.stringify(
    rows
      .map((r) => ({ label: r.label.trim(), value: r.value.trim() }))
      .filter((r) => r.label && r.value),
  );

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">
        Specifikáció
      </label>
      <input type="hidden" name="specs" value={payload} />

      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.key} className="flex gap-2">
            <input
              value={row.label}
              onChange={(e) => update(row.key, "label", e.target.value)}
              placeholder="Címke — pl. Méret"
              className="w-2/5 border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
            <input
              value={row.value}
              onChange={(e) => update(row.key, "value", e.target.value)}
              placeholder="Érték — pl. 220 × 220 × 90 cm"
              className="flex-1 border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => remove(row.key)}
              aria-label="Sor törlése"
              className="flex w-10 shrink-0 items-center justify-center border border-line text-muted hover:text-red-600"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-2.5 flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-dark"
      >
        <Plus className="size-4" /> Sor hozzáadása
      </button>
    </div>
  );
}
