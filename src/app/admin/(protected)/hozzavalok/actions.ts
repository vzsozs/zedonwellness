"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { productFeatureGroups, productFeatures } from "@/db/schema";
import { saveUploadedImage } from "@/lib/upload";
import { getEurHufRate } from "@/lib/settings";
import { eurToHuf } from "@/lib/currency";
import { type ActionState, toActionError } from "@/lib/action-state";

const groupSchema = z.object({
  nameHu: z.string().min(1, "Kötelező"),
  nameEn: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

const priceEurField = z
  .union([z.literal(""), z.coerce.number().nonnegative()])
  .optional()
  .transform((v) => (v === "" || v === undefined ? null : v));

const featureSchema = z.object({
  groupId: z.coerce.number().int().positive(),
  nameHu: z.string().min(1, "Kötelező"),
  nameEn: z.string().optional(),
  // Optional, same convention as extras — blank means "included", not free.
  priceEur: priceEurField,
  sortOrder: z.coerce.number().int().default(0),
});

export async function createGroup(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = groupSchema.parse({
      nameHu: formData.get("nameHu"),
      nameEn: formData.get("nameEn") || undefined,
      sortOrder: formData.get("sortOrder") || 0,
    });
    await db.insert(productFeatureGroups).values(parsed);
    revalidatePath("/admin/hozzavalok");
    revalidatePath("/admin/products");
    return {};
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteGroup(id: number) {
  await db.delete(productFeatureGroups).where(eq(productFeatureGroups.id, id));
  revalidatePath("/admin/hozzavalok");
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

async function resolveIcon(formData: FormData, existing: string | null) {
  const clear = formData.get("clearIcon") === "on";
  const file = formData.get("iconFile") as File | null;
  if (file && file.size > 0) return saveUploadedImage(file, "features");
  return clear ? null : existing;
}

export async function createFeature(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = featureSchema.parse({
      groupId: formData.get("groupId"),
      nameHu: formData.get("nameHu"),
      nameEn: formData.get("nameEn") || undefined,
      priceEur: formData.get("priceEur") ?? "",
      sortOrder: formData.get("sortOrder") || 0,
    });
    const iconUrl = await resolveIcon(formData, null);
    const rate = await getEurHufRate();
    const { priceEur, ...rest } = parsed;
    await db.insert(productFeatures).values({
      ...rest,
      priceEur: priceEur === null ? null : String(priceEur),
      priceHuf: priceEur === null ? null : String(eurToHuf(priceEur, rate)),
      iconUrl,
    });
    revalidatePath("/admin/hozzavalok");
    revalidatePath("/admin/products");
    return {};
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateFeature(
  id: number,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const current = await db.query.productFeatures.findFirst({
      where: eq(productFeatures.id, id),
    });
    const parsed = featureSchema.parse({
      groupId: formData.get("groupId") ?? current?.groupId,
      nameHu: formData.get("nameHu"),
      nameEn: formData.get("nameEn") || undefined,
      priceEur: formData.get("priceEur") ?? "",
      sortOrder: formData.get("sortOrder") || 0,
    });
    const iconUrl = await resolveIcon(formData, current?.iconUrl ?? null);
    const rate = await getEurHufRate();
    const { priceEur, ...rest } = parsed;
    await db
      .update(productFeatures)
      .set({
        ...rest,
        priceEur: priceEur === null ? null : String(priceEur),
        priceHuf: priceEur === null ? null : String(eurToHuf(priceEur, rate)),
        iconUrl,
      })
      .where(eq(productFeatures.id, id));
    revalidatePath("/admin/hozzavalok");
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteFeature(id: number) {
  await db.delete(productFeatures).where(eq(productFeatures.id, id));
  revalidatePath("/admin/hozzavalok");
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}
