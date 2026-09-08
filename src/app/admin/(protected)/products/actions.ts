"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, notInArray, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { products, productExtras, productVariants, productFeatureLinks } from "@/db/schema";
import { saveUploadedImage, saveUploadedDocument } from "@/lib/upload";
import { sanitizeDescription } from "@/lib/sanitize-description";
import { resolvePrice } from "@/lib/pricing";
import { requireAdmin } from "@/lib/require-admin";
import {
  type ActionState,
  isRedirectError,
  toActionError,
} from "@/lib/action-state";

/** Ids arrive as bound Server Action arguments, i.e. from the network —
 * validate them like any other request input. */
const idSchema = z.coerce.number().int().positive();

/** The transaction handle drizzle hands to `db.transaction(cb)`. */
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

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
  descriptionHu: z.string().optional().transform((v) => (v ? sanitizeDescription(v) : v)),
  descriptionEn: z.string().optional().transform((v) => (v ? sanitizeDescription(v) : v)),
  priceEur: z
    .union([z.literal(""), z.coerce.number().nonnegative()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  priceHuf: z.coerce.number().int().nonnegative(),
  priceHufManual: checkbox,
  capacity: z
    .union([z.coerce.number().int().positive(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  weightKg: z
    .union([z.coerce.number().positive(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  orderOnly: checkbox,
  inStock: checkbox,
  isFeatured: checkbox,
  isNew: checkbox,
  isOnSale: checkbox,
  priceOnRequest: checkbox,
  specsPosition: z.enum(["auto", "left", "right"]).default("auto"),
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
    nameEn: z.string(),
    choices: z.array(
      z.object({
        key: z.string(),
        nameHu: z.string(),
        nameEn: z.string(),
        imageUrl: z.string().nullable(),
      }),
    ),
  }),
);

const variantSkusDataSchema = z.array(
  z.object({
    key: z.string(),
    id: z.number().int().positive().nullable(),
    nameHu: z.string(),
    nameEn: z.string(),
    sku: z.string(),
    priceHuf: z.string(),
    weightKg: z.string(),
    imageUrl: z.string().nullable(),
    isDefault: z.boolean(),
    inStock: z.boolean(),
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
    priceEur: formData.get("priceEur") ?? "",
    priceHuf: formData.get("priceHuf"),
    priceHufManual: formData.get("priceHufManual") as "on" | null,
    capacity: formData.get("capacity") ?? "",
    weightKg: formData.get("weightKg") ?? "",
    orderOnly: formData.get("orderOnly") as "on" | null,
    inStock: formData.get("inStock") as "on" | null,
    isFeatured: formData.get("isFeatured") as "on" | null,
    isNew: formData.get("isNew") as "on" | null,
    isOnSale: formData.get("isOnSale") as "on" | null,
    priceOnRequest: formData.get("priceOnRequest") as "on" | null,
    specsPosition: formData.get("specsPosition") || "auto",
    threeDArUrl: formData.get("threeDArUrl") || undefined,
  });
}

const documentsDataSchema = z.array(
  z.object({ key: z.string(), label: z.string(), url: z.string().nullable() }),
);

async function resolveDocuments(formData: FormData) {
  const raw = formData.get("documentsData");
  if (typeof raw !== "string" || !raw) return [];
  const docs = documentsDataSchema.parse(JSON.parse(raw));

  const result = [];
  for (const d of docs) {
    if (!d.label.trim()) continue;
    const file = formData.get(`documentFile_${d.key}`) as File | null;
    const url = file && file.size > 0 ? await saveUploadedDocument(file, "documents") : d.url;
    if (!url) continue;
    result.push({ label: d.label.trim(), url });
  }
  return result;
}

function readSpecs(formData: FormData) {
  const raw = formData.get("specs");
  if (typeof raw !== "string" || !raw) return [];
  const parsed = z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        type: z.enum(["text", "boolean"]).optional(),
      }),
    )
    .safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : [];
}

async function resolveImages(formData: FormData) {
  const raw = formData.get("imageOrder");
  const order = raw && typeof raw === "string" ? imageOrderSchema.parse(JSON.parse(raw)) : [];
  const mainImageKey = String(formData.get("mainImageKey") ?? "");
  const cardImageKey = String(formData.get("cardImageKey") ?? "");
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
  const cardImage = resolved.find((r) => r.key === cardImageKey)?.url ?? null;

  return { images, mainImage, cardImage };
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
      choices.push({
        nameHu: choice.nameHu.trim(),
        nameEn: choice.nameEn.trim(),
        imageUrl,
      });
    }
    if (choices.length > 0) {
      result.push({ nameHu: group.nameHu.trim(), nameEn: group.nameEn.trim(), choices });
    }
  }
  return result;
}

async function resolveProductVariants(formData: FormData) {
  const raw = formData.get("variantSkusData");
  if (typeof raw !== "string" || !raw) return [];
  const skus = variantSkusDataSchema.parse(JSON.parse(raw));

  const result = [];
  let hasDefault = false;
  for (const s of skus) {
    if (!s.nameHu.trim()) continue;
    const file = formData.get(`variantSkuFile_${s.key}`) as File | null;
    const imageUrl =
      file && file.size > 0 ? await saveUploadedImage(file, "variants") : s.imageUrl;
    const isDefault = s.isDefault && !hasDefault;
    if (isDefault) hasDefault = true;
    result.push({
      id: s.id,
      nameHu: s.nameHu.trim(),
      nameEn: s.nameEn.trim() || null,
      sku: s.sku.trim() || null,
      priceHuf: s.priceHuf.trim() ? String(Number(s.priceHuf)) : null,
      weightKg: s.weightKg.trim() ? String(Number(s.weightKg)) : null,
      imageUrl,
      isDefault,
      inStock: s.inStock,
      sortOrder: result.length,
    });
  }
  // Guarantee exactly one default when there's at least one variant.
  if (result.length > 0 && !hasDefault) result[0].isDefault = true;
  return result;
}

/**
 * Reconciles the submitted variant rows against what's stored.
 *
 * Deliberately *not* a delete-all-then-insert: `product_variants.id` is
 * referenced by placed orders (`orders.items[].variantId`), so re-creating
 * the rows on every product save would leave those references pointing at
 * ids that no longer exist. Rows the admin actually removed are deleted,
 * the rest keep their id.
 */
async function syncProductVariants(tx: Tx, productId: number, formData: FormData) {
  const variants = await resolveProductVariants(formData);

  const keptIds = variants.map((v) => v.id).filter((id): id is number => id !== null);
  await tx
    .delete(productVariants)
    .where(
      keptIds.length > 0
        ? and(
            eq(productVariants.productId, productId),
            notInArray(productVariants.id, keptIds),
          )
        : eq(productVariants.productId, productId),
    );

  for (const { id, ...values } of variants) {
    if (id === null) {
      await tx.insert(productVariants).values({ ...values, productId });
    } else {
      // Scoped by productId too, so a forged id can't retarget another
      // product's variant row.
      await tx
        .update(productVariants)
        .set(values)
        .where(and(eq(productVariants.id, id), eq(productVariants.productId, productId)));
    }
  }
}

async function syncExtras(tx: Tx, productId: number, formData: FormData) {
  const ids = [
    ...new Set(formData.getAll("extraIds").map((v) => Number(v)).filter(Number.isFinite)),
  ];
  await tx.delete(productExtras).where(eq(productExtras.productId, productId));
  if (ids.length > 0) {
    await tx.insert(productExtras).values(ids.map((extraId) => ({ productId, extraId })));
  }
}

async function syncFeatures(tx: Tx, productId: number, formData: FormData) {
  const ids = [
    ...new Set(formData.getAll("featureIds").map((v) => Number(v)).filter(Number.isFinite)),
  ];
  await tx.delete(productFeatureLinks).where(eq(productFeatureLinks.productId, productId));
  if (ids.length > 0) {
    await tx
      .insert(productFeatureLinks)
      .values(ids.map((featureId) => ({ productId, featureId })));
  }
}

export async function createProduct(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const parsed = readForm(formData);
    const { priceEur, priceHuf: submittedHuf, priceHufManual, weightKg, ...rest } = parsed;

    const [{ images, mainImage, cardImage }, variantOptions, price, documents] = await Promise.all([
      resolveImages(formData),
      resolveVariantOptions(formData),
      resolvePrice(priceEur, submittedHuf, priceHufManual),
      resolveDocuments(formData),
    ]);

    // One transaction: the product row and its extras/features/variants are
    // one logical record, so a failure partway through must not leave a
    // half-linked product behind.
    await db.transaction(async (tx) => {
      const [product] = await tx
        .insert(products)
        .values({
          ...rest,
          priceEur: priceEur === null ? null : String(priceEur),
          priceHuf: String(price.priceHuf),
          priceHufManual: price.priceHufManual,
          weightKg: weightKg === null ? null : String(weightKg),
          images,
          mainImage,
          cardImage,
          specs: readSpecs(formData),
          variantOptions,
          documents,
        })
        .returning();

      await syncExtras(tx, product.id, formData);
      await syncFeatures(tx, product.id, formData);
      await syncProductVariants(tx, product.id, formData);
    });

    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return toActionError(err);
  }
  redirect("/admin/products");
}

export async function updateProduct(
  id: number,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const productId = idSchema.parse(id);
    const parsed = readForm(formData);
    const { priceEur, priceHuf: submittedHuf, priceHufManual, weightKg, ...rest } = parsed;

    const [{ images, mainImage, cardImage }, variantOptions, price, documents] = await Promise.all([
      resolveImages(formData),
      resolveVariantOptions(formData),
      resolvePrice(priceEur, submittedHuf, priceHufManual),
      resolveDocuments(formData),
    ]);

    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({
          ...rest,
          priceEur: priceEur === null ? null : String(priceEur),
          priceHuf: String(price.priceHuf),
          priceHufManual: price.priceHufManual,
          weightKg: weightKg === null ? null : String(weightKg),
          images,
          mainImage,
          cardImage,
          specs: readSpecs(formData),
          variantOptions,
          documents,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      await syncExtras(tx, productId, formData);
      await syncFeatures(tx, productId, formData);
      await syncProductVariants(tx, productId, formData);
    });

    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return toActionError(err);
  }
  redirect("/admin/products");
}

export async function deleteProduct(id: number): Promise<ActionState> {
  try {
    await requireAdmin();
    const productId = idSchema.parse(id);
    await db.delete(products).where(eq(products.id, productId));
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return {};
  } catch (err) {
    return toActionError(err);
  }
}
