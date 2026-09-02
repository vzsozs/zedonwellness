"use client";

import { useState } from "react";
import { formatHuf } from "@/lib/config";
import { formatEur, hufToEur, eurToHuf } from "@/lib/currency";
import { useCurrency } from "@/lib/currency-context";

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
  const { currency, eurHufRate } = useCurrency();
  // Canonical state stays in HUF (what the filter actually submits) —
  // display values are derived fresh every render so switching currency
  // mid-session doesn't leave stale slider positions.
  const [loHuf, setLoHuf] = useState(defaultMin);
  const [hiHuf, setHiHuf] = useState(defaultMax);

  const toDisplay = (huf: number) => (currency === "EUR" ? hufToEur(huf, eurHufRate) : huf);
  const toHuf = (display: number) => (currency === "EUR" ? eurToHuf(display, eurHufRate) : display);
  const formatDisplay = (huf: number) =>
    currency === "EUR" ? formatEur(toDisplay(huf)) : formatHuf(huf);

  const dMin = toDisplay(min);
  const dMax = toDisplay(max);
  const dLo = toDisplay(loHuf);
  const dHi = toDisplay(hiHuf);

  const step =
    currency === "EUR"
      ? Math.max(1, Math.round((dMax - dMin) / 100))
      : Math.max(1000, Math.round((max - min) / 100 / 1000) * 1000);

  const pct = (v: number) => (dMax === dMin ? 0 : ((v - dMin) / (dMax - dMin)) * 100);

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between text-xs font-semibold text-ink">
        <span>{formatDisplay(loHuf)}</span>
        <span>{formatDisplay(hiHuf)}</span>
      </div>
      <div className="range-slider relative h-1.5">
        <div className="absolute inset-0 top-1/2 h-1 -translate-y-1/2 bg-line" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 bg-coprBlue"
          style={{ left: `${pct(dLo)}%`, right: `${100 - pct(dHi)}%` }}
        />
        <input
          type="range"
          min={dMin}
          max={dMax}
          step={step}
          value={dLo}
          onChange={(e) => setLoHuf(Math.min(toHuf(Number(e.target.value)), hiHuf))}
        />
        <input
          type="range"
          min={dMin}
          max={dMax}
          step={step}
          value={dHi}
          onChange={(e) => setHiHuf(Math.max(toHuf(Number(e.target.value)), loHuf))}
        />
        <input type="hidden" name="priceMin" value={Math.round(loHuf)} />
        <input type="hidden" name="priceMax" value={Math.round(hiHuf)} />
      </div>
    </div>
  );
}
