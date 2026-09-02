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
  format: (priceHuf: number) => string;
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
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "HUF" || stored === "EUR") setCurrencyState(stored);
    } catch {
      // Storage unavailable — keep the locale-based default.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    () => (priceHuf: number) =>
      currency === "EUR" ? formatEur(hufToEur(priceHuf, eurHufRate)) : formatHuf(priceHuf),
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

/** Renders a HUF amount in whichever currency is currently selected. */
export function Price({ hufAmount }: { hufAmount: number | string }) {
  const { format } = useCurrency();
  return <>{format(Number(hufAmount))}</>;
}
