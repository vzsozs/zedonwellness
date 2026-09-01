"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { extras } from "@/db/schema";

const extraSchema = z.object({
  nameHu: z.string().min(1, "Kötelező"),
  nameEn: z.string().optional(),
  priceHuf: z.coerce.number().int().nonnegative(),
  sortOrder: z.coerce.number().int().default(0),
});

function readForm(formData: FormData) {
  return extraSchema.parse({
    nameHu: formData.get("nameHu"),
    nameEn: formData.get("nameEn") || undefined,
    priceHuf: formData.get("priceHuf"),
    sortOrder: formData.get("sortOrder") || 0,
  });
}

export async function createExtra(formData: FormData) {
  const parsed = readForm(formData);
  await db.insert(extras).values({ ...parsed, priceHuf: String(parsed.priceHuf) });
  revalidatePath("/admin/extras");
  revalidatePath("/admin/products");
}

export async function updateExtra(id: number, formData: FormData) {
  const parsed = readForm(formData);
  await db
    .update(extras)
    .set({ ...parsed, priceHuf: String(parsed.priceHuf) })
    .where(eq(extras.id, id));
  revalidatePath("/admin/extras");
  revalidatePath("/admin/products");
}

export async function deleteExtra(id: number) {
  await db.delete(extras).where(eq(extras.id, id));
  revalidatePath("/admin/extras");
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}
