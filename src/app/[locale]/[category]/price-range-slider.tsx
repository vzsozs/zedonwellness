"use client";

import { formatHuf } from "@/lib/config";
import { formatEur, hufToEur, eurToHuf } from "@/lib/currency";
import { useCurrency } from "@/lib/currency-context";

export function PriceRangeSlider({
  min,
  max,
  loHuf,
  hiHuf,
  onChange,
}: {
  min: number;
  max: number;
  loHuf: number;
  hiHuf: number;
  onChange: (loHuf: number, hiHuf: number) => void;
}) {
  const { currency, eurHufRate } = useCurrency();

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
          onChange={(e) => onChange(Math.min(toHuf(Number(e.target.value)), hiHuf), hiHuf)}
        />
        <input
          type="range"
          min={dMin}
          max={dMax}
          step={step}
          value={dHi}
          onChange={(e) => onChange(loHuf, Math.max(toHuf(Number(e.target.value)), loHuf))}
        />
      </div>
    </div>
  );
}
