"use server";

import { revalidatePath } from "next/cache";
import { eq, count } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { productSeries, products } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { type ActionState, toActionError } from "@/lib/action-state";

const idSchema = z.coerce.number().int().positive();

const seriesSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  name: z.string().min(1, "Kötelező"),
});

export async function createSeries(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = seriesSchema.parse({
      categoryId: formData.get("categoryId"),
      name: formData.get("name"),
    });

    await db.insert(productSeries).values(parsed);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteSeries(id: number): Promise<ActionState> {
  try {
    await requireAdmin();
    const seriesId = idSchema.parse(id);

    // products.series_id is ON DELETE SET NULL, so this succeeds either way —
    // but silently un-categorising products is surprising, so say what will
    // happen instead of doing it behind the admin's back.
    const [{ value: productCount }] = await db
      .select({ value: count() })
      .from(products)
      .where(eq(products.seriesId, seriesId));
    if (productCount > 0) {
      return {
        error: `Ehhez a sorozathoz ${productCount} termék tartozik — előbb állítsd át őket másik sorozatra.`,
      };
    }

    await db.delete(productSeries).where(eq(productSeries.id, seriesId));
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return toActionError(err);
  }
}
