import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { formatHuf } from "@/lib/config";
import { ClearCartOnMount } from "./clear-cart-on-mount";

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderNumber?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("orderConfirmation");

  const { orderNumber } = await searchParams;
  if (!orderNumber) notFound();

  const order = await db.query.orders.findFirst({
    where: eq(orders.orderNumber, orderNumber),
  });
  if (!order) notFound();

  return (
    <main className="mx-auto max-w-2xl px-16 pt-14 pb-25 text-center max-lg:px-6">
      <ClearCartOnMount />
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-3 text-sm text-muted">
        {t("orderNumberLabel")}{" "}
        <span className="font-mono font-semibold text-ink">{order.orderNumber}</span>
      </p>
      <p className="mt-1 text-sm text-muted">
        {t("confirmationSent", {
          email: order.customerEmail,
          reason: order.shippingAddress.shippingRequiresQuote
            ? t("contactReasonQuote")
            : t("contactReasonNormal"),
        })}
      </p>

      <div className="mt-8 border border-line bg-white p-6 text-left">
        <h2 className="mb-4 text-sm font-bold tracking-wide text-ink uppercase">
          {t("orderedProducts")}
        </h2>
        <div className="flex flex-col gap-2.5 text-sm">
          {order.items.map((item) => (
            <div
              key={`${item.productId}:${item.variantId ?? ""}`}
              className="flex justify-between gap-3"
            >
              <span className="text-muted">
                {item.nameHu} × {item.quantity}
              </span>
              <span className="font-semibold whitespace-nowrap">
                {formatHuf(item.priceHuf * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-line pt-4 text-sm">
          <span className="text-muted">{t("shipping")}</span>
          <span className="font-semibold">
            {order.shippingAddress.shippingRequiresQuote
              ? t("customQuote")
              : formatHuf(order.shippingAddress.shippingHuf ?? 0)}
          </span>
        </div>
        <div className="mt-4 flex justify-between border-t border-line pt-4">
          <span className="font-bold">{t("total")}</span>
          <span className="text-xl font-extrabold text-coprBlue">
            {formatHuf(order.totalHuf)}
            {order.shippingAddress.shippingRequiresQuote ? " +" : ""}
          </span>
        </div>
      </div>

      <Link
        href="/"
        className="mt-8 inline-block border-[1.5px] border-ink px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-white"
      >
        {t("backToHome")}
      </Link>
    </main>
  );
}
