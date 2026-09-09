"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Trash2, Minus, Plus } from "lucide-react";
import { MAX_QUANTITY, useCart } from "@/lib/cart-context";
import { useCurrency } from "@/lib/currency-context";
import { useCartSync } from "@/lib/use-cart-sync";
import { localized } from "@/lib/localized";
import { getProductGradient } from "@/lib/visuals";
import { CartLineNotices, CartRemovedNotice } from "@/components/cart-notices";
import { SafeImage } from "@/components/safe-image";

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { items, hydrated, removeItem, setQuantity, subtotalHuf } = useCart();
  const { format } = useCurrency();
  const sync = useCartSync();

  // The server render always starts with an empty cart (localStorage is
  // client-only), so deciding "empty" before hydration flashes the empty
  // state on every load.
  if (!hydrated) {
    return (
      <main className="mx-auto max-w-4xl px-[5%] pt-10 pb-25 max-lg:px-6">
        <h1 className="text-[42px] leading-tight font-bold tracking-[-0.01em] text-ink max-lg:text-3xl">{t("title")}</h1>
        <div className="mt-10 h-24 animate-pulse bg-line/60" aria-hidden />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-[5%] pt-10 pb-25 max-lg:px-6">
      <h1 className="text-[42px] leading-tight font-bold tracking-[-0.01em] text-ink max-lg:text-3xl">{t("title")}</h1>

      <CartRemovedNotice names={sync.removed} />

      {items.length === 0 ? (
        <div className="mt-10">
          <p className="text-sm text-muted">{t("empty")}</p>
          <Link
            href="/"
            className="rounded-control mt-5 inline-block border-[1.5px] border-ink px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-white"
          >
            {t("backToProducts")}
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex flex-col gap-5">
            {items.map((item) => {
              const key = `${item.productId}:${item.variantId ?? ""}`;
              const name = localized(locale, item.nameHu, item.nameEn);
              const variantLabel = item.variantLabel
                ? localized(locale, item.variantLabel, item.variantLabelEn)
                : null;
              return (
                <div
                  key={key}
                  className="flex items-center gap-5 border-b border-line pb-5 max-sm:flex-wrap"
                >
                  <div className="rounded-control size-24 shrink-0 overflow-hidden border border-line bg-white">
                    {item.image ? (
                      <SafeImage
                        src={item.image}
                        alt=""
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className={`h-full w-full bg-gradient-to-br ${getProductGradient(item.productId)}`}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/termek/${item.slug}`}
                      className="font-bold text-ink hover:text-accent"
                    >
                      {name}
                    </Link>
                    {variantLabel ? (
                      <div className="text-sm text-muted">{variantLabel}</div>
                    ) : null}
                    <div className="mt-1 text-sm text-muted">{format(item.priceHuf)}</div>
                    {item.orderOnly ? (
                      <div className="mt-1 text-xs text-accent">{t("orderOnlyNote")}</div>
                    ) : null}
                    {item.weightKg === null ? (
                      <div className="mt-1 text-xs text-muted">{t("missingWeight")}</div>
                    ) : null}
                    <CartLineNotices issues={sync.issues.get(key)} />
                  </div>

                  <div className="rounded-control flex items-center gap-2.5 border border-line bg-white">
                    <button
                      type="button"
                      aria-label={t("decreaseQty")}
                      onClick={() => setQuantity(item.productId, item.variantId, item.quantity - 1)}
                      className="flex size-9 items-center justify-center text-muted hover:text-ink"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={t("increaseQty")}
                      disabled={item.quantity >= MAX_QUANTITY}
                      onClick={() => setQuantity(item.productId, item.variantId, item.quantity + 1)}
                      className="flex size-9 items-center justify-center text-muted hover:text-ink disabled:opacity-40"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <div className="w-32 text-right font-extrabold text-coprBlue">
                    {format(item.priceHuf * item.quantity)}
                  </div>

                  <button
                    type="button"
                    aria-label={t("removeItem")}
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-muted hover:text-red-600"
                  >
                    <Trash2 className="size-4.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-4">
            <div className="text-sm text-muted">{t("shippingNote")}</div>
            <div className="text-right max-sm:w-full max-sm:text-left">
              <div className="text-xs font-bold tracking-wide text-muted uppercase">
                {t("subtotal")}
              </div>
              <div className="text-2xl font-extrabold text-coprBlue">
                {format(subtotalHuf)}
              </div>
            </div>
          </div>

          {sync.blocked ? (
            <p className="mt-6 border-l-[3px] border-red-600 bg-red-50 px-4.5 py-3.5 text-[13.5px] text-red-800">
              {t("blockedNote")}
            </p>
          ) : (
            <Link
              href="/penztar"
              className="rounded-control mt-6 block bg-ink py-4 text-center text-sm font-semibold text-white hover:bg-accent-dark"
            >
              {t("continue")}
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
