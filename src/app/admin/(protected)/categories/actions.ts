"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, count } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, products, productSeries } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { saveUploadedImage } from "@/lib/upload";
import {
  type ActionState,
  isRedirectError,
  toActionError,
} from "@/lib/action-state";

const idSchema = z.coerce.number().int().positive();

const categorySchema = z.object({
  slug: z
    .string()
    .min(1, "Kötelező")
    .regex(/^[a-z0-9-]+$/, "Csak kisbetű, szám és kötőjel"),
  nameHu: z.string().min(1, "Kötelező"),
  nameEn: z.string().optional(),
  descriptionHu: z.string().optional(),
  descriptionEn: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

/** A newly uploaded file wins; otherwise keep (or explicitly clear) the
 * existing one. Same convention as the extras/features editors. */
async function resolveImage(formData: FormData, existing: string | null) {
  const file = formData.get("imageFile") as File | null;
  if (file && file.size > 0) return saveUploadedImage(file, "categories");
  return formData.get("clearImage") === "on" ? null : existing;
}

function readForm(formData: FormData) {
  return categorySchema.parse({
    slug: formData.get("slug"),
    nameHu: formData.get("nameHu"),
    nameEn: formData.get("nameEn") || undefined,
    descriptionHu: formData.get("descriptionHu") || undefined,
    descriptionEn: formData.get("descriptionEn") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
  });
}

export async function createCategory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = readForm(formData);
    const imageUrl = await resolveImage(formData, null);
    await db.insert(categories).values({ ...parsed, imageUrl });
    revalidatePath("/admin/categories");
    revalidatePath("/", "layout");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return toActionError(err);
  }
  redirect("/admin/categories");
}

export async function updateCategory(
  id: number,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const categoryId = idSchema.parse(id);
    const parsed = readForm(formData);
    const current = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });
    const imageUrl = await resolveImage(formData, current?.imageUrl ?? null);
    await db
      .update(categories)
      .set({ ...parsed, imageUrl })
      .where(eq(categories.id, categoryId));
    revalidatePath("/admin/categories");
    revalidatePath("/", "layout");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return toActionError(err);
  }
  redirect("/admin/categories");
}

export async function deleteCategory(id: number): Promise<ActionState> {
  try {
    await requireAdmin();
    const categoryId = idSchema.parse(id);

    // products.category_id is NOT NULL with a foreign key, so deleting a
    // category that still has products raises a raw Postgres error. Check
    // first and explain what to do instead.
    const [{ value: productCount }] = await db
      .select({ value: count() })
      .from(products)
      .where(eq(products.categoryId, categoryId));
    if (productCount > 0) {
      return {
        error: `Ez a kategória ${productCount} terméket tartalmaz — előbb helyezd át vagy töröld őket.`,
      };
    }

    // Series belong to the category and nothing else references them once
    // the products are gone, so they can go with it.
    await db.transaction(async (tx) => {
      await tx.delete(productSeries).where(eq(productSeries.categoryId, categoryId));
      await tx.delete(categories).where(eq(categories.id, categoryId));
    });

    revalidatePath("/admin/categories");
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return toActionError(err);
  }
}
