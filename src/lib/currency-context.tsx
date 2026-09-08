"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import { formatHuf } from "./config";
import { formatEur, hufToEur } from "./currency";

export type Currency = "HUF" | "EUR";

const STORAGE_KEY = "zw-currency";

function defaultCurrencyForLocale(locale: string): Currency {
  return locale === "en" ? "EUR" : "HUF";
}

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  eurHufRate: number;
  format: (priceHuf: number, priceEur?: number | null) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  eurHufRate,
  children,
}: {
  eurHufRate: number;
  children: ReactNode;
}) {
  const locale = useLocale();
  const [currency, setCurrencyState] = useState<Currency>(() =>
    defaultCurrencyForLocale(locale),
  );

  // On first mount, an explicit prior choice (from either the currency
  // switcher or a language switch) wins over the locale-based default.
  // Same as the cart: localStorage can only be read after mount, so this is
  // an external-store sync rather than a render cascade.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- external store, see above
      if (stored === "HUF" || stored === "EUR") setCurrencyState(stored);
    } catch {
      // Storage unavailable — keep the locale-based default.
    }
  }, []);

  function setCurrency(next: Currency) {
    setCurrencyState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable — selection just won't persist across reloads.
    }
  }

  const format = useMemo(
    () => (priceHuf: number, priceEur?: number | null) => {
      if (currency !== "EUR") return formatHuf(priceHuf);
      // Prefer the euro price the admin actually entered. Converting the
      // stored forints back would re-divide a value that was rounded to
      // the nearest 10 Ft on the way in, so a 1 234,56 € product showed up
      // as 1 234,55 €.
      return formatEur(priceEur ?? hufToEur(priceHuf, eurHufRate));
    },
    [currency, eurHufRate],
  );

  const value = useMemo(
    () => ({ currency, setCurrency, eurHufRate, format }),
    [currency, eurHufRate, format],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}

/** Sets the currency to match a language's default — call this from the
 * language switcher so switching to EN jumps to EUR and HU jumps to HUF. */
export function currencyForLocale(locale: string): Currency {
  return defaultCurrencyForLocale(locale);
}

/**
 * Renders a price in whichever currency is currently selected.
 *
 * `hufAmount` is the stored source of truth. Pass `eurAmount` too whenever
 * the record has its own EUR price, so euro visitors see the exact figure
 * the admin typed rather than one converted back out of forints.
 */
export function Price({
  hufAmount,
  eurAmount,
}: {
  hufAmount: number | string;
  eurAmount?: number | string | null;
}) {
  const { format } = useCurrency();
  const eur =
    eurAmount === null || eurAmount === undefined ? null : Number(eurAmount);
  return <>{format(Number(hufAmount), eur)}</>;
}
