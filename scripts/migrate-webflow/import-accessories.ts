// One-off: imports the Webflow ecommerce "Products" collection (41 variant
// rows / 24 products — cleaning products + misc accessories) into
// `products`, category "kiegeszitok", as standalone products. Multi-variant
// products (e.g. 12 fragrances) become `productVariants`. Upserts by slug.
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { readCsv, resolveImages, parseEcommercePrice, slugify } from "./lib";

const FILE = "zedonwellness-HUN - Products.csv";

async function main() {
  const { db } = await import("../../src/db");
  const { products, categories, productSeries, productVariants } = await import("../../src/db/schema");
  const { eq, and } = await import("drizzle-orm");

  const category = await db.query.categories.findFirst({ where: eq(categories.slug, "kiegeszitok") });
  if (!category) throw new Error('Category "kiegeszitok" not found.');

  const rows = readCsv(FILE);
  const byProduct = new Map<string, Record<string, string>[]>();
  for (const row of rows) {
    const pid = row["Product ID"];
    if (!byProduct.has(pid)) byProduct.set(pid, []);
    byProduct.get(pid)!.push(row);
  }

  let created = 0;
  let updated = 0;

  for (const [, variantRows] of byProduct) {
    const first = variantRows[0];
    const nameHu = first["Product Name"]?.trim();
    if (!nameHu) continue;
    const slug = first["Product Handle"]?.trim() || slugify(nameHu);

    const categoryLabel = first["Product Categories"]?.trim() || "Egyéb kiegészítők";
    let series = await db.query.productSeries.findFirst({
      where: and(eq(productSeries.categoryId, category.id), eq(productSeries.name, categoryLabel)),
    });
    if (!series) {
      [series] = await db.insert(productSeries).values({ categoryId: category.id, name: categoryLabel }).returning();
      console.log(`  created series "${categoryLabel}"`);
    }

    const prices = variantRows
      .map((r) => parseEcommercePrice(r["Variant Price"]))
      .filter((p): p is number => p !== null);
    const basePrice = prices.length > 0 ? Math.min(...prices) : 0;

    const weights = variantRows
      .map((r) => Number(r["Variant Weight"]))
      .filter((w) => Number.isFinite(w) && w > 0);
    const baseWeightKg = weights.length > 0 ? weights[0] / 1000 : null;

    const allImages = [
      ...new Set(
        variantRows.flatMap((r) => [
          ...resolveImages(r["Main Variant Image"]),
          ...resolveImages(r["More Variant Images"]),
        ]),
      ),
    ];

    const productValues = {
      slug,
      sku: variantRows.length === 1 ? first["Variant Sku"]?.trim() || null : null,
      categoryId: category.id,
      seriesId: series.id,
      nameHu,
      shortDescriptionHu: first["Product Description"]?.trim() || null,
      priceHuf: String(basePrice),
      weightKg: baseWeightKg !== null ? String(baseWeightKg) : null,
      images: allImages,
      mainImage: allImages[0] ?? null,
      inStock: true,
    };

    const existing = await db.query.products.findFirst({ where: eq(products.slug, slug) });
    let productId: number;
    if (existing) {
      await db.update(products).set({ ...productValues, updatedAt: new Date() }).where(eq(products.id, existing.id));
      productId = existing.id;
      updated++;
    } else {
      const [inserted] = await db.insert(products).values(productValues).returning();
      productId = inserted.id;
      created++;
    }

    if (variantRows.length > 1) {
      await db.delete(productVariants).where(eq(productVariants.productId, productId));
      const skuVariants = variantRows.map((r, i) => {
        const variantName = r["Option1 Value"]?.trim() || `Változat ${i + 1}`;
        const price = parseEcommercePrice(r["Variant Price"]);
        const weightG = Number(r["Variant Weight"]);
        const images = [...resolveImages(r["Main Variant Image"]), ...resolveImages(r["More Variant Images"])];
        return {
          productId,
          nameHu: variantName,
          sku: r["Variant Sku"]?.trim() || null,
          priceHuf: price !== null && price !== basePrice ? String(price) : null,
          weightKg:
            Number.isFinite(weightG) && weightG > 0 && weightG / 1000 !== baseWeightKg
              ? String(weightG / 1000)
              : null,
          imageUrl: images[0] ?? null,
          isDefault: i === 0,
          inStock: true,
          sortOrder: i,
        };
      });
      await db.insert(productVariants).values(skuVariants);
    }
  }

  console.log(`Done. created=${created} updated=${updated}`);
}

main();
