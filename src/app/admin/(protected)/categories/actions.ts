"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories } from "@/db/schema";

const categorySchema = z.object({
  slug: z
    .string()
    .min(1, "Kötelező")
    .regex(/^[a-z0-9-]+$/, "Csak kisbetű, szám és kötőjel"),
  nameHu: z.string().min(1, "Kötelező"),
  nameEn: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export async function createCategory(formData: FormData) {
  const parsed = categorySchema.parse({
    slug: formData.get("slug"),
    nameHu: formData.get("nameHu"),
    nameEn: formData.get("nameEn") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
  });

  await db.insert(categories).values(parsed);
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: number, formData: FormData) {
  const parsed = categorySchema.parse({
    slug: formData.get("slug"),
    nameHu: formData.get("nameHu"),
    nameEn: formData.get("nameEn") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
  });

  await db.update(categories).set(parsed).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: number) {
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
}
