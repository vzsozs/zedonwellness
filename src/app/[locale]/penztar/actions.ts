"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { products, productVariants, orders } from "@/db/schema";
import { getShippingQuote, zoneFromCountryCode } from "@/lib/shipping";
import { COUNTRIES, countryLabel } from "@/lib/countries";
import {
  type ActionState,
  isRedirectError,
  toActionError,
} from "@/lib/action-state";

export async function getShippingEstimate(countryCode: string, totalWeightKg: number | null) {
  const zone = zoneFromCountryCode(countryCode);
  return { zone, ...(await getShippingQuote(zone, totalWeightKg)) };
}

const cartItemSchema = z.array(
  z.object({
    productId: z.number().int().positive(),
    variantId: z.number().int().positive().nullable(),
    quantity: z.number().int().positive(),
  }),
);

export async function createOrder(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getTranslations("checkout");
  const checkoutSchema = z.object({
    customerName: z.string().min(1, t("errorRequired")),
    customerEmail: z.string().email(t("errorInvalidEmail")),
    customerPhone: z.string().optional(),
    countryCode: z.enum(COUNTRIES.map((c) => c.code) as [string, ...string[]]),
    zip: z.string().min(1, t("errorRequired")),
    city: z.string().min(1, t("errorRequired")),
    street: z.string().min(1, t("errorRequired")),
    note: z.string().optional(),
  });

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
    });

    const rawItems = formData.get("items");
    const cartItems = cartItemSchema.parse(
      typeof rawItems === "string" && rawItems ? JSON.parse(rawItems) : [],
    );
    if (cartItems.length === 0) {
      return { error: t("errorEmptyCart") };
    }

    // Re-fetch authoritative product/variant data — never trust
    // client-submitted prices/weights for the total.
    const productIds = cartItems.map((i) => i.productId);
    const variantIds = cartItems.map((i) => i.variantId).filter((id): id is number => id !== null);
    const [dbProducts, dbVariants] = await Promise.all([
      db.query.products.findMany({ where: inArray(products.id, productIds) }),
      variantIds.length > 0
        ? db.query.productVariants.findMany({ where: inArray(productVariants.id, variantIds) })
        : Promise.resolve([]),
    ]);
    const productById = new Map(dbProducts.map((p) => [p.id, p]));
    const variantById = new Map(dbVariants.map((v) => [v.id, v]));

    const orderItems = cartItems.map((ci) => {
      const p = productById.get(ci.productId);
      if (!p) throw new Error(t("errorProductUnavailable"));
      const variant = ci.variantId !== null ? variantById.get(ci.variantId) : undefined;
      if (ci.variantId !== null && !variant) {
        throw new Error(t("errorVariantUnavailable"));
      }
      return {
        productId: p.id,
        variantId: variant?.id ?? null,
        slug: p.slug,
        nameHu: variant ? `${p.nameHu} (${variant.nameHu})` : p.nameHu,
        priceHuf: Number(variant?.priceHuf ?? p.priceHuf),
        quantity: ci.quantity,
        weightKg:
          (variant?.weightKg ?? p.weightKg) !== null
            ? Number(variant?.weightKg ?? p.weightKg)
            : null,
      };
    });

    const subtotalHuf = orderItems.reduce((sum, i) => sum + i.priceHuf * i.quantity, 0);
    const totalWeightKg = orderItems.some((i) => i.weightKg === null)
      ? null
      : orderItems.reduce((sum, i) => sum + (i.weightKg ?? 0) * i.quantity, 0);

    const zone = zoneFromCountryCode(parsed.countryCode);
    const shippingQuote = await getShippingQuote(zone, totalWeightKg);
    const shippingHuf = shippingQuote.requiresQuote ? 0 : shippingQuote.priceHuf;
    const totalHuf = subtotalHuf + shippingHuf;

    const orderNumber = `ZW-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 6).toUpperCase()}`;

    await db.insert(orders).values({
      orderNumber,
      customerName: parsed.customerName,
      customerEmail: parsed.customerEmail,
      customerPhone: parsed.customerPhone ?? null,
      shippingAddress: {
        zone,
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
      status: "pending",
    });

    redirect(`/rendeles-visszaigazolva?orderNumber=${orderNumber}`);
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return toActionError(err);
  }
}
