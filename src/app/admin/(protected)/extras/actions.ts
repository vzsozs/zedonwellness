"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { extras } from "@/db/schema";
import { saveUploadedImage } from "@/lib/upload";
import { getEurHufRate } from "@/lib/settings";
import { eurToHuf } from "@/lib/currency";
import { type ActionState, toActionError } from "@/lib/action-state";

const extraSchema = z.object({
  nameHu: z.string().min(1, "Kötelező"),
  nameEn: z.string().optional(),
  // Optional — many extras are included by default and have no separate
  // price; a blank field means "included", not "0 Ft".
  priceEur: z
    .union([z.literal(""), z.coerce.number().nonnegative()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  sortOrder: z.coerce.number().int().default(0),
});

function readForm(formData: FormData) {
  return extraSchema.parse({
    nameHu: formData.get("nameHu"),
    nameEn: formData.get("nameEn") || undefined,
    priceEur: formData.get("priceEur") ?? "",
    sortOrder: formData.get("sortOrder") || 0,
  });
}

async function resolveImage(formData: FormData, existing: string | null) {
  const clear = formData.get("clearImage") === "on";
  const file = formData.get("imageFile") as File | null;
  if (file && file.size > 0) return saveUploadedImage(file, "extras");
  return clear ? null : existing;
}

export async function createExtra(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = readForm(formData);
    const imageUrl = await resolveImage(formData, null);
    const rate = await getEurHufRate();
    const priceHuf = parsed.priceEur === null ? 0 : eurToHuf(parsed.priceEur, rate);
    await db.insert(extras).values({
      ...parsed,
      priceEur: parsed.priceEur === null ? null : String(parsed.priceEur),
      priceHuf: String(priceHuf),
      imageUrl,
    });
    revalidatePath("/admin/extras");
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateExtra(
  id: number,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const current = await db.query.extras.findFirst({ where: eq(extras.id, id) });
    const parsed = readForm(formData);
    const imageUrl = await resolveImage(formData, current?.imageUrl ?? null);
    const rate = await getEurHufRate();
    const priceHuf = parsed.priceEur === null ? 0 : eurToHuf(parsed.priceEur, rate);
    await db
      .update(extras)
      .set({
        ...parsed,
        priceEur: parsed.priceEur === null ? null : String(parsed.priceEur),
        priceHuf: String(priceHuf),
        imageUrl,
      })
      .where(eq(extras.id, id));
    revalidatePath("/admin/extras");
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteExtra(id: number) {
  await db.delete(extras).where(eq(extras.id, id));
  revalidatePath("/admin/extras");
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}
