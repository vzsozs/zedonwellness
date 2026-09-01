"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { extras } from "@/db/schema";
import { saveUploadedImage } from "@/lib/upload";

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

async function resolveImage(formData: FormData, existing: string | null) {
  const clear = formData.get("clearImage") === "on";
  const file = formData.get("imageFile") as File | null;
  if (file && file.size > 0) return saveUploadedImage(file, "extras");
  return clear ? null : existing;
}

export async function createExtra(formData: FormData) {
  const parsed = readForm(formData);
  const imageUrl = await resolveImage(formData, null);
  await db.insert(extras).values({ ...parsed, priceHuf: String(parsed.priceHuf), imageUrl });
  revalidatePath("/admin/extras");
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

export async function updateExtra(id: number, formData: FormData) {
  const current = await db.query.extras.findFirst({ where: eq(extras.id, id) });
  const parsed = readForm(formData);
  const imageUrl = await resolveImage(formData, current?.imageUrl ?? null);
  await db
    .update(extras)
    .set({ ...parsed, priceHuf: String(parsed.priceHuf), imageUrl })
    .where(eq(extras.id, id));
  revalidatePath("/admin/extras");
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

export async function deleteExtra(id: number) {
  await db.delete(extras).where(eq(extras.id, id));
  revalidatePath("/admin/extras");
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}
