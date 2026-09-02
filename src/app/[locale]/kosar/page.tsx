"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatHuf } from "@/lib/config";
import { getProductGradient } from "@/lib/visuals";

export default function CartPage() {
  const t = useTranslations("cart");
  const { items, removeItem, setQuantity, subtotalHuf } = useCart();

  return (
    <main className="mx-auto max-w-4xl px-16 pt-10 pb-25 max-lg:px-6">
      <h1 className="text-4xl font-semibold max-lg:text-3xl">{t("title")}</h1>

      {items.length === 0 ? (
        <div className="mt-10">
          <p className="text-sm text-muted">{t("empty")}</p>
          <Link
            href="/"
            className="mt-5 inline-block border-[1.5px] border-ink px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-white"
          >
            {t("backToProducts")}
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex flex-col gap-5">
            {items.map((item) => (
              <div
                key={`${item.productId}:${item.variantId ?? ""}`}
                className="flex items-center gap-5 border-b border-line pb-5 max-sm:flex-wrap"
              >
                <div
                  className={
                    item.image
                      ? "size-24 shrink-0 bg-cover bg-center"
                      : `size-24 shrink-0 bg-gradient-to-br ${getProductGradient(item.productId)}`
                  }
                  style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/termek/${item.slug}`}
                    className="font-bold text-ink hover:text-accent"
                  >
                    {item.nameHu}
                  </Link>
                  {item.variantLabel ? (
                    <div className="text-sm text-muted">{item.variantLabel}</div>
                  ) : null}
                  <div className="mt-1 text-sm text-muted">{formatHuf(item.priceHuf)}</div>
                  {item.orderOnly ? (
                    <div className="mt-1 text-xs text-accent">{t("orderOnlyNote")}</div>
                  ) : null}
                  {item.weightKg === null ? (
                    <div className="mt-1 text-xs text-muted">{t("missingWeight")}</div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2.5 border border-line">
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
                    onClick={() => setQuantity(item.productId, item.variantId, item.quantity + 1)}
                    className="flex size-9 items-center justify-center text-muted hover:text-ink"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                <div className="w-32 text-right font-extrabold text-coprBlue">
                  {formatHuf(item.priceHuf * item.quantity)}
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
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-4">
            <div className="text-sm text-muted">{t("shippingNote")}</div>
            <div className="text-right max-sm:w-full max-sm:text-left">
              <div className="text-xs font-bold tracking-wide text-muted uppercase">
                {t("subtotal")}
              </div>
              <div className="text-2xl font-extrabold text-coprBlue">
                {formatHuf(subtotalHuf)}
              </div>
            </div>
          </div>

          <Link
            href="/penztar"
            className="mt-6 block bg-ink py-4 text-center text-sm font-semibold text-white hover:bg-accent-dark"
          >
            {t("continue")}
          </Link>
        </div>
      )}
    </main>
  );
}
