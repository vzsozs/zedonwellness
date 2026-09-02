"use client";

import { useState } from "react";
import { formatHuf } from "@/lib/config";

export function PriceRangeSlider({
  min,
  max,
  defaultMin,
  defaultMax,
}: {
  min: number;
  max: number;
  defaultMin: number;
  defaultMax: number;
}) {
  const [lo, setLo] = useState(defaultMin);
  const [hi, setHi] = useState(defaultMax);
  const step = Math.max(1000, Math.round((max - min) / 100 / 1000) * 1000);

  const pct = (v: number) => (max === min ? 0 : ((v - min) / (max - min)) * 100);

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between text-xs font-semibold text-ink">
        <span>{formatHuf(lo)}</span>
        <span>{formatHuf(hi)}</span>
      </div>
      <div className="range-slider relative h-1.5">
        <div className="absolute inset-0 top-1/2 h-1 -translate-y-1/2 bg-line" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 bg-coprBlue"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          name="priceMin"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => setLo(Math.min(Number(e.target.value), hi))}
        />
        <input
          type="range"
          name="priceMax"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => setHi(Math.max(Number(e.target.value), lo))}
        />
      </div>
    </div>
  );
}
