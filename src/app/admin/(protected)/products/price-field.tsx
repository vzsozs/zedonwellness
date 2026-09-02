"use client";

import { useState } from "react";
import { Lock, LockOpen } from "lucide-react";
import { roundToTen } from "@/lib/currency";

export function PriceField({
  eurHufRate,
  defaultPriceEur,
  defaultPriceHuf,
  defaultManual,
}: {
  eurHufRate: number;
  defaultPriceEur: string | null;
  defaultPriceHuf: string | number;
  defaultManual: boolean;
}) {
  const [priceEur, setPriceEur] = useState(defaultPriceEur ?? "");
  const [unlocked, setUnlocked] = useState(defaultManual);
  const [manualHuf, setManualHuf] = useState(String(defaultPriceHuf));

  const computedHuf = priceEur ? roundToTen(Number(priceEur) * eurHufRate) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-muted">
          Ár (EUR)
        </label>
        <input
          type="number"
          name="priceEur"
          step="0.01"
          value={priceEur}
          onChange={(e) => setPriceEur(e.target.value)}
          required
          className="w-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label className="text-xs font-semibold text-muted">Ár (HUF, bruttó)</label>
          <button
            type="button"
            onClick={() => setUnlocked((u) => !u)}
            className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent-dark"
          >
            {unlocked ? (
              <>
                <LockOpen className="size-3.5" /> Feloldva
              </>
            ) : (
              <>
                <Lock className="size-3.5" /> Automatikus
              </>
            )}
          </button>
        </div>
        <input
          type="number"
          name="priceHuf"
          value={unlocked ? manualHuf : computedHuf}
          onChange={(e) => setManualHuf(e.target.value)}
          readOnly={!unlocked}
          required
          className={`w-full border px-3.5 py-2.5 text-sm outline-none ${
            unlocked
              ? "border-line focus:border-accent"
              : "border-line bg-paper-muted text-muted"
          }`}
        />
        {unlocked ? <input type="hidden" name="priceHufManual" value="on" /> : null}
        <p className="mt-1 text-[11px] text-muted">
          {unlocked
            ? "Kattints az Automatikusra, hogy visszaálljon az EUR árból számolt értékre."
            : `${eurHufRate} Ft/EUR árfolyamon, legközelebbi 10 Ft-ra kerekítve. Kattints a Feloldásra a kézi beírásához.`}
        </p>
      </div>
    </div>
  );
}
