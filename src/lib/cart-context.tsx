"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: number;
  // Set when the product has SKU-level variants (e.g. a fragrance) — null
  // for plain products. Distinguishes cart lines for the same product.
  variantId: number | null;
  variantLabel: string | null;
  slug: string;
  nameHu: string;
  image: string | null;
  priceHuf: number;
  // null means "unknown" — no weight set on the product/variant in the
  // admin yet. A cart containing any such item can't get an automatic
  // shipping quote.
  weightKg: number | null;
  orderOnly: boolean;
  quantity: number;
};

function lineKey(item: { productId: number; variantId: number | null }) {
  return `${item.productId}:${item.variantId ?? ""}`;
}

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number, variantId: number | null) => void;
  setQuantity: (productId: number, variantId: number | null, quantity: number) => void;
  clear: () => void;
  itemCount: number;
  subtotalHuf: number;
  totalWeightKg: number | null;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "zw-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Corrupt or inaccessible storage — start with an empty cart.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable (private mode, quota) — cart just won't persist.
    }
  }, [items, hydrated]);

  function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
    setItems((prev) => {
      const key = lineKey(item);
      const existing = prev.find((i) => lineKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          lineKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }

  function removeItem(productId: number, variantId: number | null) {
    const key = lineKey({ productId, variantId });
    setItems((prev) => prev.filter((i) => lineKey(i) !== key));
  }

  function setQuantity(productId: number, variantId: number | null, quantity: number) {
    const key = lineKey({ productId, variantId });
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => lineKey(i) !== key)
        : prev.map((i) => (lineKey(i) === key ? { ...i, quantity } : i)),
    );
  }

  function clear() {
    setItems([]);
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalHuf = items.reduce((sum, i) => sum + i.priceHuf * i.quantity, 0);
  const totalWeightKg = items.some((i) => i.weightKg === null)
    ? null
    : items.reduce((sum, i) => sum + (i.weightKg ?? 0) * i.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      setQuantity,
      clear,
      itemCount,
      subtotalHuf,
      totalWeightKg,
    }),
    [items, itemCount, subtotalHuf, totalWeightKg],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
