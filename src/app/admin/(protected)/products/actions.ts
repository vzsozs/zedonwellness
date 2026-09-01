"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { products, productExtras } from "@/db/schema";
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
});

const imageOrderSchema = z.array(
  z.union([
    z.object({ key: z.string(), type: z.literal("existing"), url: z.string() }),
    z.object({ key: z.string(), type: z.literal("new"), fileIndex: z.number().int() }),
  ]),
);

const variantOptionsDataSchema = z.array(
  z.object({
    key: z.string(),
    nameHu: z.string(),
    choices: z.array(
      z.object({
        key: z.string(),
        nameHu: z.string(),
        imageUrl: z.string().nullable(),
      }),
    ),
  }),
);

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
  });
}

function readSpecs(formData: FormData) {
  const raw = formData.get("specs");
  if (typeof raw !== "string" || !raw) return [];
  const parsed = z
    .array(z.object({ label: z.string(), value: z.string() }))
    .safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : [];
}

async function resolveImages(formData: FormData) {
  const raw = formData.get("imageOrder");
  const order = raw && typeof raw === "string" ? imageOrderSchema.parse(JSON.parse(raw)) : [];
  const mainImageKey = String(formData.get("mainImageKey") ?? "");
  const newFiles = formData.getAll("galleryFiles") as File[];

  const uploadedByIndex = new Map<number, string>();
  for (let i = 0; i < newFiles.length; i++) {
    if (newFiles[i] && newFiles[i].size > 0) {
      uploadedByIndex.set(i, await saveUploadedImage(newFiles[i], "products"));
    }
  }

  const resolved = order.map((entry) => ({
    key: entry.key,
    url: entry.type === "existing" ? entry.url : (uploadedByIndex.get(entry.fileIndex) ?? null),
  }));
  const images = resolved
    .map((r) => r.url)
    .filter((url): url is string => Boolean(url));

  const mainImage =
    resolved.find((r) => r.key === mainImageKey)?.url ?? images[0] ?? null;

  return { images, mainImage };
}

async function resolveVariantOptions(formData: FormData) {
  const raw = formData.get("variantOptionsData");
  if (typeof raw !== "string" || !raw) return [];
  const groups = variantOptionsDataSchema.parse(JSON.parse(raw));

  const result = [];
  for (const group of groups) {
    if (!group.nameHu.trim()) continue;
    const choices = [];
    for (const choice of group.choices) {
      if (!choice.nameHu.trim()) continue;
      const file = formData.get(`variantFile_${choice.key}`) as File | null;
      const imageUrl =
        file && file.size > 0 ? await saveUploadedImage(file, "variants") : choice.imageUrl;
      choices.push({ nameHu: choice.nameHu.trim(), nameEn: "", imageUrl });
    }
    if (choices.length > 0) {
      result.push({ nameHu: group.nameHu.trim(), nameEn: "", choices });
    }
  }
  return result;
}

async function syncExtras(productId: number, formData: FormData) {
  const ids = [
    ...new Set(formData.getAll("extraIds").map((v) => Number(v)).filter(Number.isFinite)),
  ];
  await db.delete(productExtras).where(eq(productExtras.productId, productId));
  if (ids.length > 0) {
    await db.insert(productExtras).values(ids.map((extraId) => ({ productId, extraId })));
  }
}

export async function createProduct(formData: FormData) {
  const parsed = readForm(formData);
  const { eurPriceOverride, ...rest } = parsed;

  const [{ images, mainImage }, variantOptions] = await Promise.all([
    resolveImages(formData),
    resolveVariantOptions(formData),
  ]);

  const [product] = await db
    .insert(products)
    .values({
      ...rest,
      priceHuf: String(rest.priceHuf),
      eurPriceOverride: eurPriceOverride === null ? null : String(eurPriceOverride),
      images,
      mainImage,
      specs: readSpecs(formData),
      variantOptions,
    })
    .returning();

  await syncExtras(product.id, formData);

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function updateProduct(id: number, formData: FormData) {
  const parsed = readForm(formData);
  const { eurPriceOverride, ...rest } = parsed;

  const [{ images, mainImage }, variantOptions] = await Promise.all([
    resolveImages(formData),
    resolveVariantOptions(formData),
  ]);

  await db
    .update(products)
    .set({
      ...rest,
      priceHuf: String(rest.priceHuf),
      eurPriceOverride: eurPriceOverride === null ? null : String(eurPriceOverride),
      images,
      mainImage,
      specs: readSpecs(formData),
      variantOptions,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));

  await syncExtras(id, formData);

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(id: number) {
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}
