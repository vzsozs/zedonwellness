"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { productSeries } from "@/db/schema";

const seriesSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  name: z.string().min(1, "Kötelező"),
});

export async function createSeries(formData: FormData) {
  const parsed = seriesSchema.parse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
  });

  await db.insert(productSeries).values(parsed);
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

export async function deleteSeries(id: number) {
  await db.delete(productSeries).where(eq(productSeries.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}
