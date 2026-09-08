"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { productFeatureGroups, productFeatures } from "@/db/schema";
import { saveUploadedImage } from "@/lib/upload";
import { getEurHufRate } from "@/lib/settings";
import { eurToHuf } from "@/lib/currency";
import { requireAdmin } from "@/lib/require-admin";
import { type ActionState, toActionError } from "@/lib/action-state";

const idSchema = z.coerce.number().int().positive();

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
    await requireAdmin();
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

export async function deleteGroup(id: number): Promise<ActionState> {
  try {
    await requireAdmin();
    // product_features cascades from the group, and product_feature_links
    // cascades from those — so the whole tab goes in one statement.
    await db
      .delete(productFeatureGroups)
      .where(eq(productFeatureGroups.id, idSchema.parse(id)));
    revalidatePath("/admin/hozzavalok");
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return toActionError(err);
  }
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
    await requireAdmin();
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
    await requireAdmin();
    const featureId = idSchema.parse(id);
    const current = await db.query.productFeatures.findFirst({
      where: eq(productFeatures.id, featureId),
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
      .where(eq(productFeatures.id, featureId));
    revalidatePath("/admin/hozzavalok");
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteFeature(id: number): Promise<ActionState> {
  try {
    await requireAdmin();
    await db.delete(productFeatures).where(eq(productFeatures.id, idSchema.parse(id)));
    revalidatePath("/admin/hozzavalok");
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return toActionError(err);
  }
}
