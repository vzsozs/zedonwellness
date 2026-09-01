"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { products } from "@/db/schema";
import { saveUploadedImage } from "@/lib/upload";

const checkbox = z.union([z.literal("on"), z.null()]).transform(Boolean);

const productSchema = z.object({
  slug: z
    .string()
    .min(1, "Kötelező")
    .regex(/^[a-z0-9-]+$/, "Csak kisbetű, szám és kötőjel"),
  sku: z.string().optional(),
  categoryId: z.coerce.number().int().positive("Válassz kategóriát"),
  seriesId: z
    .union([z.coerce.number().int().positive(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  nameHu: z.string().min(1, "Kötelező"),
  nameEn: z.string().optional(),
  subtitleHu: z.string().optional(),
  subtitleEn: z.string().optional(),
  shortDescriptionHu: z.string().optional(),
  shortDescriptionEn: z.string().optional(),
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
  threeDArUrl: z.string().optional(),
  specs: z.string().optional(),
  variantOptions: z.string().optional(),
  extras: z.string().optional(),
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

// "Csoport neve: Választás1, Választás2" per line
function parseVariantOptions(value?: string) {
  const groups: { nameHu: string; nameEn: string; choices: string[] }[] = [];
  for (const line of parseLines(value)) {
    const [name, rest] = line.split(":");
    if (!name || !rest) continue;
    const choices = rest
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (choices.length > 0) {
      groups.push({ nameHu: name.trim(), nameEn: "", choices });
    }
  }
  return groups;
}

// "Név: ár" per line
function parseExtras(value?: string) {
  const extras: { nameHu: string; nameEn: string; priceHuf: number }[] = [];
  for (const line of parseLines(value)) {
    const [name, priceRaw] = line.split(":");
    if (!name || !priceRaw) continue;
    const price = Number(priceRaw.replace(/[^\d]/g, ""));
    if (!Number.isNaN(price)) {
      extras.push({ nameHu: name.trim(), nameEn: "", priceHuf: price });
    }
  }
  return extras;
}

function readForm(formData: FormData) {
  return productSchema.parse({
    slug: formData.get("slug"),
    sku: formData.get("sku") || undefined,
    categoryId: formData.get("categoryId"),
    seriesId: formData.get("seriesId") ?? "",
    nameHu: formData.get("nameHu"),
    nameEn: formData.get("nameEn") || undefined,
    subtitleHu: formData.get("subtitleHu") || undefined,
    subtitleEn: formData.get("subtitleEn") || undefined,
    shortDescriptionHu: formData.get("shortDescriptionHu") || undefined,
    shortDescriptionEn: formData.get("shortDescriptionEn") || undefined,
    descriptionHu: formData.get("descriptionHu") || undefined,
    descriptionEn: formData.get("descriptionEn") || undefined,
    priceHuf: formData.get("priceHuf"),
    eurPriceOverride: formData.get("eurPriceOverride") ?? "",
    orderOnly: formData.get("orderOnly") as "on" | null,
    inStock: formData.get("inStock") as "on" | null,
    isFeatured: formData.get("isFeatured") as "on" | null,
    isNew: formData.get("isNew") as "on" | null,
    isOnSale: formData.get("isOnSale") as "on" | null,
    threeDArUrl: formData.get("threeDArUrl") || undefined,
    specs: formData.get("specs") || undefined,
    variantOptions: formData.get("variantOptions") || undefined,
    extras: formData.get("extras") || undefined,
  });
}

async function resolveMainImage(formData: FormData, existing: string | null) {
  const clear = formData.get("clearMainImage") === "on";
  const file = formData.get("mainImageFile") as File | null;
  if (file && file.size > 0) {
    return saveUploadedImage(file, "products");
  }
  return clear ? null : existing;
}

async function resolveGalleryImages(formData: FormData, existing: string[]) {
  const removed = new Set(formData.getAll("removeGalleryImage").map(String));
  const kept = existing.filter((url) => !removed.has(url));

  const files = formData.getAll("galleryFiles") as File[];
  const uploaded = await Promise.all(
    files
      .filter((f) => f && f.size > 0)
      .map((f) => saveUploadedImage(f, "products")),
  );

  return [...kept, ...uploaded];
}

export async function createProduct(formData: FormData) {
  const parsed = readForm(formData);
  const { specs, variantOptions, extras, eurPriceOverride, ...rest } = parsed;

  const mainImage = await resolveMainImage(formData, null);
  const images = await resolveGalleryImages(formData, []);

  await db.insert(products).values({
    ...rest,
    priceHuf: String(rest.priceHuf),
    eurPriceOverride:
      eurPriceOverride === null ? null : String(eurPriceOverride),
    mainImage,
    images,
    specs: parseSpecs(specs),
    variantOptions: parseVariantOptions(variantOptions),
    extras: parseExtras(extras),
  });

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function updateProduct(id: number, formData: FormData) {
  const current = await db.query.products.findFirst({ where: eq(products.id, id) });
  if (!current) throw new Error("Termék nem található");

  const parsed = readForm(formData);
  const { specs, variantOptions, extras, eurPriceOverride, ...rest } = parsed;

  const mainImage = await resolveMainImage(formData, current.mainImage);
  const images = await resolveGalleryImages(formData, current.images);

  await db
    .update(products)
    .set({
      ...rest,
      priceHuf: String(rest.priceHuf),
      eurPriceOverride:
        eurPriceOverride === null ? null : String(eurPriceOverride),
      mainImage,
      images,
      specs: parseSpecs(specs),
      variantOptions: parseVariantOptions(variantOptions),
      extras: parseExtras(extras),
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
