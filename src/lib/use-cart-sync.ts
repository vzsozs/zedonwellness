"use client";

import { useEffect, useRef, useState } from "react";
import { useCart, type CartItem } from "@/lib/cart-context";
import { revalidateCart } from "@/app/[locale]/penztar/actions";
import type { CartIssue, ResolvedCartLine } from "@/lib/cart-validation";

export type CartSyncState = {
  /** True until the first server round-trip completes. */
  checking: boolean;
  /** Per-line issues, keyed by `productId:variantId`. */
  issues: Map<string, CartIssue[]>;
  /** Lines dropped because the product or variant no longer exists. */
  removed: string[];
  /** Any line that can't be ordered — the checkout submit stays disabled. */
  blocked: boolean;
};

function lineKey(i: { productId: number; variantId: number | null }) {
  return `${i.productId}:${i.variantId ?? ""}`;
}

/** Everything the cart caches that the server is authoritative about — used
 * to decide whether a refresh actually changed anything (and so avoid
 * re-writing state in a loop). */
function signature(items: CartItem[]) {
  return items
    .map((i) => `${lineKey(i)}|${i.quantity}|${i.priceHuf}|${i.weightKg}|${i.orderOnly}|${i.nameHu}`)
    .join(";");
}

function toCartItem(line: ResolvedCartLine, previous: CartItem | undefined): CartItem {
  return {
    productId: line.productId,
    variantId: line.variantId,
    variantLabel: line.variantNameHu ?? null,
    slug: line.slug,
    nameHu: line.nameHu,
    nameEn: line.nameEn,
    variantLabelEn: line.variantNameEn ?? null,
    image: line.image ?? previous?.image ?? null,
    priceHuf: line.priceHuf,
    weightKg: line.weightKg,
    orderOnly: line.orderOnly,
    quantity: line.quantity,
  };
}

/**
 * Re-prices the localStorage cart against the database whenever a cart or
 * checkout screen mounts.
 *
 * Without this, a cart left open for weeks shows stale prices and keeps
 * products that have since been deleted or gone out of stock — and the
 * customer only finds out when the order fails with a generic error.
 */
export function useCartSync(): CartSyncState {
  const { items, hydrated, replaceAll } = useCart();
  const [state, setState] = useState<CartSyncState>({
    checking: true,
    issues: new Map(),
    removed: [],
    blocked: false,
  });
  const idle: CartSyncState = {
    checking: false,
    issues: new Map(),
    removed: state.removed,
    blocked: false,
  };
  // Guards against re-running for a refresh we just applied ourselves.
  const lastChecked = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    // An empty cart needs no round-trip; the `idle` value returned below
    // covers it, so nothing is written to state here.
    if (items.length === 0) {
      lastChecked.current = "";
      return;
    }

    const current = signature(items);
    if (lastChecked.current === current) return;

    let cancelled = false;
    setState((s) => ({ ...s, checking: true }));

    revalidateCart(
      items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        priceHuf: i.priceHuf,
      })),
    ).then((result) => {
      if (cancelled) return;

      const gone = result.lines.filter(
        (l) => l.issues.includes("unavailable") || l.issues.includes("variantUnavailable"),
      );
      const kept = result.lines.filter((l) => !gone.includes(l));

      const previousByKey = new Map(items.map((i) => [lineKey(i), i]));
      const refreshed = kept.map((l) => toCartItem(l, previousByKey.get(lineKey(l))));

      const issues = new Map<string, CartIssue[]>();
      for (const l of kept) {
        if (l.issues.length > 0) issues.set(lineKey(l), l.issues);
      }

      // Record what we're about to write, so the effect this triggers
      // recognises it as already-checked instead of looping.
      lastChecked.current = signature(refreshed);
      if (signature(refreshed) !== current) replaceAll(refreshed);

      setState({
        checking: false,
        issues,
        removed: gone.map((l) => previousByKey.get(lineKey(l))?.nameHu ?? "").filter(Boolean),
        blocked: kept.some((l) =>
          l.issues.some((i) => i === "outOfStock" || i === "priceOnRequest"),
        ),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [items, hydrated, replaceAll]);

  // Derived rather than stored for the empty case — writing it in the
  // effect would be a synchronous setState during an effect body.
  return items.length === 0 ? idle : state;
}
