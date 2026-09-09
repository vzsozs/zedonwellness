"use client";

import { useTranslations } from "next-intl";
import type { CartIssue } from "@/lib/cart-validation";

/**
 * Explains, per cart line, what the server found when it re-priced the cart —
 * a stale price, a product switched off, a "Hamarosan" item. Without this the
 * customer only learns something is wrong when the order fails.
 */
export function CartLineNotices({ issues }: { issues: CartIssue[] | undefined }) {
  const t = useTranslations("cart.issues");
  if (!issues || issues.length === 0) return null;

  return (
    <ul className="mt-2 flex flex-col gap-1">
      {issues.map((issue) => (
        <li
          key={issue}
          className={`text-xs ${issue === "priceChanged" ? "text-accent" : "text-red-700"}`}
        >
          {t(issue)}
        </li>
      ))}
    </ul>
  );
}

/** Lines dropped entirely because the product or variant no longer exists. */
export function CartRemovedNotice({ names }: { names: string[] }) {
  const t = useTranslations("cart.issues");
  if (names.length === 0) return null;

  return (
    <p className="mt-6 border-l-[3px] border-accent bg-accent-soft px-4.5 py-3.5 text-[13.5px] text-ink">
      {t("removed", { names: names.join(", ") })}
    </p>
  );
}
