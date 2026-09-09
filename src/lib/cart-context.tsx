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
  variantLabelEn: string | null;
  slug: string;
  nameHu: string;
  // Kept alongside the Hungarian name so the cart and checkout can show the
  // product in the visitor's language, like every other storefront screen.
  nameEn: string | null;
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

/** Mirrors MAX_QUANTITY_PER_LINE on the server — the checkout rejects more,
 * so the cart shouldn't let it be typed in the first place. */
export const MAX_QUANTITY = 99;

type CartContextValue = {
  items: CartItem[];
  /** False until localStorage has been read. Screens must not decide "the
   * cart is empty" before this flips, or they flash an empty state on every
   * load (the server render always starts with no items). */
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number, variantId: number | null) => void;
  setQuantity: (productId: number, variantId: number | null, quantity: number) => void;
  clear: () => void;
  /** Replaces the stored lines with server-resolved ones (price/name/stock
   * refreshed) — see revalidateCart. */
  replaceAll: (items: CartItem[]) => void;
  itemCount: number;
  subtotalHuf: number;
  totalWeightKg: number | null;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "zw-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Reading localStorage has to happen after mount: the server render has
  // no access to it, so seeding state from it during render would produce a
  // hydration mismatch. This is the sanctioned "sync from an external store"
  // effect, not a cascading-render bug.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- external store, see above
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
          lineKey(i) === key
            ? { ...i, quantity: Math.min(i.quantity + quantity, MAX_QUANTITY) }
            : i,
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }];
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
        : prev.map((i) =>
            lineKey(i) === key ? { ...i, quantity: Math.min(quantity, MAX_QUANTITY) } : i,
          ),
    );
  }

  function clear() {
    setItems([]);
  }

  function replaceAll(next: CartItem[]) {
    setItems(next);
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalHuf = items.reduce((sum, i) => sum + i.priceHuf * i.quantity, 0);
  const totalWeightKg = items.some((i) => i.weightKg === null)
    ? null
    : items.reduce((sum, i) => sum + (i.weightKg ?? 0) * i.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      hydrated,
      addItem,
      removeItem,
      setQuantity,
      clear,
      replaceAll,
      itemCount,
      subtotalHuf,
      totalWeightKg,
    }),
    [items, hydrated, itemCount, subtotalHuf, totalWeightKg],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
