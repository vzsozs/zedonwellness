"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-context";
import { formatHuf } from "@/lib/config";
import { initialActionState } from "@/lib/action-state";
import { COUNTRIES } from "@/lib/countries";
import { createOrder, getShippingEstimate } from "./actions";
import type { ShippingZone } from "@/lib/shipping";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const { items, subtotalHuf, totalWeightKg } = useCart();
  const [countryCode, setCountryCode] = useState("HU");
  const [shipping, setShipping] = useState<{
    zone: ShippingZone;
    requiresQuote: boolean;
    priceHuf: number | null;
  }>({ zone: "domestic", requiresQuote: true, priceHuf: null });
  const [state, formAction, pending] = useActionState(createOrder, initialActionState);

  useEffect(() => {
    let cancelled = false;
    getShippingEstimate(countryCode, totalWeightKg).then((quote) => {
      if (!cancelled) setShipping(quote);
    });
    return () => {
      cancelled = true;
    };
  }, [countryCode, totalWeightKg]);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-16 pt-10 pb-25 max-lg:px-6">
        <h1 className="text-4xl font-semibold max-lg:text-3xl">{t("title")}</h1>
        <p className="mt-6 text-sm text-muted">{t("emptyCart")}</p>
        <Link
          href="/"
          className="mt-5 inline-block border-[1.5px] border-ink px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-white"
        >
          {t("backToProducts")}
        </Link>
      </main>
    );
  }

  const totalHuf = subtotalHuf + (shipping.requiresQuote ? 0 : (shipping.priceHuf ?? 0));

  return (
    <main className="mx-auto max-w-4xl px-16 pt-10 pb-25 max-lg:px-6">
      <h1 className="text-4xl font-semibold max-lg:text-3xl">{t("title")}</h1>

      <div className="mt-8 flex gap-14 max-lg:flex-col">
        <form action={formAction} className="flex flex-1 flex-col gap-5">
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(
              items.map((i) => ({
                productId: i.productId,
                variantId: i.variantId,
                quantity: i.quantity,
              })),
            )}
          />

          {state.error ? (
            <div className="border-l-[3px] border-red-600 bg-red-50 px-4.5 py-3.5 text-[13.5px] text-red-800">
              {state.error}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-5">
            <Field label={t("fullName")} name="customerName" required />
            <Field label={t("email")} name="customerEmail" type="email" required />
          </div>
          <Field label={t("phoneOptional")} name="customerPhone" />

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              {t("country")}
            </label>
            <select
              name="countryCode"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              required
              className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {locale === "en" ? c.en : c.hu}
                </option>
              ))}
            </select>
            <div className="mt-1.5 text-xs text-muted">
              {t("zoneLabel")}:{" "}
              <span className="font-semibold text-ink">
                {shipping.zone === "domestic" ? t("zoneDomestic") : t("zoneInternational")}
              </span>{" "}
              {t("zoneAutoNote")}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Field label={t("zip")} name="zip" required />
            <Field label={t("city")} name="city" required />
          </div>
          <Field label={t("street")} name="street" required />
          <TextArea label={t("noteOptional")} name="note" />

          <button
            type="submit"
            disabled={pending}
            className="mt-2 bg-ink py-4 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
          >
            {pending ? t("submitting") : t("submit")}
          </button>
        </form>

        <div className="w-80 shrink-0 bg-[#f2f8fd] p-6 max-lg:w-full">
          <h2 className="mb-4 text-sm font-bold tracking-wide text-ink uppercase">
            {t("summary")}
          </h2>
          <div className="flex flex-col gap-2.5 text-sm">
            {items.map((item) => (
              <div
                key={`${item.productId}:${item.variantId ?? ""}`}
                className="flex justify-between gap-3"
              >
                <span className="text-muted">
                  {item.nameHu}
                  {item.variantLabel ? ` (${item.variantLabel})` : ""} × {item.quantity}
                </span>
                <span className="font-semibold whitespace-nowrap">
                  {formatHuf(item.priceHuf * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-sm">
            <span className="text-muted">{t("subtotal")}</span>
            <span className="font-semibold">{formatHuf(subtotalHuf)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted">{t("shipping")}</span>
            <span className="font-semibold">
              {shipping.requiresQuote ? t("customQuote") : formatHuf(shipping.priceHuf ?? 0)}
            </span>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4">
            <span className="font-bold">{t("total")}</span>
            <span className="text-xl font-extrabold text-coprBlue">
              {formatHuf(totalHuf)}
              {shipping.requiresQuote ? " +" : ""}
            </span>
          </div>
          {shipping.requiresQuote ? (
            <p className="mt-3 text-[12.5px] text-muted">{t("quoteNote")}</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}

function TextArea({ label, name }: { label: string; name: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">{label}</label>
      <textarea
        name={name}
        rows={3}
        className="w-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
