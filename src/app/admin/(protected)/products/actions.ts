"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { products } from "@/db/schema";

const checkbox = z.union([z.literal("on"), z.null()]).transform(Boolean);

const productSchema = z.object({
  slug: z
    .string()
    .min(1, "Kötelező")
    .regex(/^[a-z0-9-]+$/, "Csak kisbetű, szám és kötőjel"),
  categoryId: z.coerce.number().int().positive("Válassz kategóriát"),
  nameHu: z.string().min(1, "Kötelező"),
  nameEn: z.string().optional(),
  series: z.string().optional(),
  subtitleHu: z.string().optional(),
  subtitleEn: z.string().optional(),
  descriptionHu: z.string().optional(),
  descriptionEn: z.string().optional(),
  priceHuf: z.coerce.number().int().nonnegative(),
  eurPriceOverride: z
    .union([z.coerce.number().nonnegative(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  orderOnly: checkbox,
  inStock: checkbox,
  isFeatured: checkbox,
  isNew: checkbox,
  isOnSale: checkbox,
  images: z.string().optional(),
  specs: z.string().optional(),
});

function parseLines(value?: string) {
  return (value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function parseSpecs(value?: string): Record<string, string> {
  const specs: Record<string, string> = {};
  for (const line of parseLines(value)) {
    const [label, ...rest] = line.split(":");
    if (label && rest.length) {
      specs[label.trim()] = rest.join(":").trim();
    }
  }
  return specs;
}

function readForm(formData: FormData) {
  return productSchema.parse({
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
    nameHu: formData.get("nameHu"),
    nameEn: formData.get("nameEn") || undefined,
    series: formData.get("series") || undefined,
    subtitleHu: formData.get("subtitleHu") || undefined,
    subtitleEn: formData.get("subtitleEn") || undefined,
    descriptionHu: formData.get("descriptionHu") || undefined,
    descriptionEn: formData.get("descriptionEn") || undefined,
    priceHuf: formData.get("priceHuf"),
    eurPriceOverride: formData.get("eurPriceOverride") ?? "",
    orderOnly: formData.get("orderOnly") as "on" | null,
    inStock: formData.get("inStock") as "on" | null,
    isFeatured: formData.get("isFeatured") as "on" | null,
    isNew: formData.get("isNew") as "on" | null,
    isOnSale: formData.get("isOnSale") as "on" | null,
    images: formData.get("images") || undefined,
    specs: formData.get("specs") || undefined,
  });
}

export async function createProduct(formData: FormData) {
  const parsed = readForm(formData);
  const { images, specs, eurPriceOverride, ...rest } = parsed;

  await db.insert(products).values({
    ...rest,
    priceHuf: String(rest.priceHuf),
    eurPriceOverride:
      eurPriceOverride === null ? null : String(eurPriceOverride),
    images: parseLines(images),
    specs: parseSpecs(specs),
  });

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function updateProduct(id: number, formData: FormData) {
  const parsed = readForm(formData);
  const { images, specs, eurPriceOverride, ...rest } = parsed;

  await db
    .update(products)
    .set({
      ...rest,
      priceHuf: String(rest.priceHuf),
      eurPriceOverride:
        eurPriceOverride === null ? null : String(eurPriceOverride),
      images: parseLines(images),
      specs: parseSpecs(specs),
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(id: number) {
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}
