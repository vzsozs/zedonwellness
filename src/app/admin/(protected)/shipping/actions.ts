"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { shippingRates } from "@/db/schema";

const checkbox = z.union([z.literal("on"), z.null()]).transform(Boolean);

const shippingSchema = z.object({
  label: z.string().min(1, "Kötelező"),
  band: z.string().min(1, "Kötelező"),
  priceHuf: z
    .union([z.coerce.number().int().nonnegative(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  requiresQuote: checkbox,
});

export async function createShippingRate(formData: FormData) {
  const parsed = shippingSchema.parse({
    label: formData.get("label"),
    band: formData.get("band"),
    priceHuf: formData.get("priceHuf") ?? "",
    requiresQuote: formData.get("requiresQuote") as "on" | null,
  });

  await db.insert(shippingRates).values({
    ...parsed,
    priceHuf: parsed.priceHuf === null ? null : String(parsed.priceHuf),
  });
  revalidatePath("/admin/shipping");
}

export async function deleteShippingRate(id: number) {
  await db.delete(shippingRates).where(eq(shippingRates.id, id));
  revalidatePath("/admin/shipping");
}
