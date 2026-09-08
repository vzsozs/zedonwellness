"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getShippingQuote, zoneFromCountryCode } from "@/lib/shipping";
import { COUNTRIES, countryLabel } from "@/lib/countries";
import { cartLinesInputSchema, resolveCart, type CartLineInput } from "@/lib/cart-validation";
import { sendOrderConfirmation, sendOrderNotification } from "@/lib/order-mail";
import { ORDER_ONLY_THRESHOLD_HUF } from "@/lib/config";
import {
  type ActionState,
  isRedirectError,
  toActionError,
} from "@/lib/action-state";

/** Re-prices a cart against the database. Called from the cart and checkout
 * screens so the customer never sees a price the order wouldn't use. */
export async function revalidateCart(items: CartLineInput[]) {
  const parsed = cartLinesInputSchema.safeParse(items);
  if (!parsed.success) {
    return { lines: [], blockingIssues: true, subtotalHuf: 0, totalWeightKg: null as number | null };
  }
  return resolveCart(parsed.data);
}

export async function getShippingEstimate(countryCode: string, totalWeightKg: number | null) {
  const zone = zoneFromCountryCode(countryCode);
  return { zone, ...(await getShippingQuote(zone, totalWeightKg)) };
}

export async function createOrder(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getTranslations("checkout");
  const checkoutSchema = z.object({
    customerName: z.string().trim().min(1, t("errorRequired")).max(120),
    customerEmail: z.string().trim().email(t("errorInvalidEmail")).max(200),
    customerPhone: z.string().trim().max(40).optional(),
    countryCode: z.enum(COUNTRIES.map((c) => c.code) as [string, ...string[]]),
    zip: z.string().trim().min(1, t("errorRequired")).max(20),
    city: z.string().trim().min(1, t("errorRequired")).max(100),
    street: z.string().trim().min(1, t("errorRequired")).max(200),
    note: z.string().trim().max(2000).optional(),
    // Consumer-law consent: the order can't be placed without it, and the
    // acceptance is recorded on the order itself as proof.
    acceptTerms: z.literal("on", { message: t("errorTermsRequired") }),
  });

  let orderNumber: string;

  try {
    const parsed = checkoutSchema.parse({
      customerName: formData.get("customerName"),
      customerEmail: formData.get("customerEmail"),
      customerPhone: formData.get("customerPhone") || undefined,
      countryCode: formData.get("countryCode"),
      zip: formData.get("zip"),
      city: formData.get("city"),
      street: formData.get("street"),
      note: formData.get("note") || undefined,
      acceptTerms: formData.get("acceptTerms"),
    });

    const rawItems = formData.get("items");
    const cartItems = cartLinesInputSchema.parse(
      typeof rawItems === "string" && rawItems ? JSON.parse(rawItems) : [],
    );
    if (cartItems.length === 0) {
      return { error: t("errorEmptyCart") };
    }

    // Authoritative re-pricing — the same resolver the cart screen uses, so
    // stock, price-on-request, product/variant pairing and prices are all
    // re-checked here regardless of what the browser submitted.
    const cart = await resolveCart(cartItems);
    if (cart.blockingIssues) {
      return { error: t("errorCartChanged") };
    }
    const priceChanged = cart.lines.some((l) => l.issues.includes("priceChanged"));
    if (priceChanged) {
      return { error: t("errorPriceChanged") };
    }

    const orderItems = cart.lines.map((l) => ({
      productId: l.productId,
      variantId: l.variantId,
      slug: l.slug,
      nameHu: l.variantNameHu ? `${l.nameHu} (${l.variantNameHu})` : l.nameHu,
      priceHuf: l.priceHuf,
      quantity: l.quantity,
      weightKg: l.weightKg,
    }));

    const zone = zoneFromCountryCode(parsed.countryCode);
    const shippingQuote = await getShippingQuote(zone, cart.totalWeightKg);
    const shippingHuf = shippingQuote.requiresQuote ? 0 : shippingQuote.priceHuf;
    const totalHuf = cart.subtotalHuf + shippingHuf;

    // Above the threshold (or with any order-only line) there is no online
    // payment at all — recorded on the order so the follow-up is unambiguous.
    const orderOnly =
      totalHuf > ORDER_ONLY_THRESHOLD_HUF || cart.lines.some((l) => l.orderOnly);

    orderNumber = `ZW-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 8).toUpperCase()}`;

    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        customerName: parsed.customerName,
        customerEmail: parsed.customerEmail,
        customerPhone: parsed.customerPhone ?? null,
        shippingAddress: {
          zone,
          countryCode: parsed.countryCode,
          country: countryLabel(parsed.countryCode, "hu"),
          zip: parsed.zip,
          city: parsed.city,
          street: parsed.street,
          note: parsed.note ?? null,
          shippingHuf: shippingQuote.requiresQuote ? null : shippingHuf,
          shippingRequiresQuote: shippingQuote.requiresQuote,
        },
        items: orderItems,
        totalHuf: String(totalHuf),
        status: orderOnly ? "order_only" : "pending",
        termsAcceptedAt: new Date(),
      })
      .returning();

    // Best-effort: the order is already committed, so a mail outage must not
    // surface as a failed checkout.
    await Promise.all([
      sendOrderConfirmation(order).catch(() => false),
      sendOrderNotification(order).catch(() => false),
    ]);
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return toActionError(err);
  }

  redirect(`/rendeles-visszaigazolva?orderNumber=${orderNumber}`);
}
