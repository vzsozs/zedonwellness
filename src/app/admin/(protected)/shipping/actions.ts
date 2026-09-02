"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { shippingRates } from "@/db/schema";

const checkbox = z.union([z.literal("on"), z.null()]).transform(Boolean);

const shippingSchema = z.object({
  zone: z.enum(["domestic", "international"]),
  minKg: z.coerce.number().nonnegative(),
  maxKg: z
    .union([z.coerce.number().positive(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  priceHuf: z
    .union([z.coerce.number().int().nonnegative(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  requiresQuote: checkbox,
});

export async function createShippingRate(formData: FormData) {
  const parsed = shippingSchema.parse({
    zone: formData.get("zone"),
    minKg: formData.get("minKg"),
    maxKg: formData.get("maxKg") ?? "",
    priceHuf: formData.get("priceHuf") ?? "",
    requiresQuote: formData.get("requiresQuote") as "on" | null,
  });

  await db.insert(shippingRates).values({
    zone: parsed.zone,
    minKg: String(parsed.minKg),
    maxKg: parsed.maxKg === null ? null : String(parsed.maxKg),
    priceHuf: parsed.priceHuf === null ? null : String(parsed.priceHuf),
    requiresQuote: parsed.requiresQuote,
  });
  revalidatePath("/admin/shipping");
}

export async function deleteShippingRate(id: number) {
  await db.delete(shippingRates).where(eq(shippingRates.id, id));
  revalidatePath("/admin/shipping");
}
