// One-off: imports the Webflow "Megrendelos" collection (24 rows) — the
// full sauna catalog — into `products`, category "szaunak". Upserts by
// slug. Also creates the "Szauna jellemzők" feature group/icons from the
// Webflow "Kiegészítők" icon-list column, and the Hanscraft S1/S2/S3
// stain-color variantOptions (confirmed against the live site).
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { readCsv, resolveImages, resolveAsset, parseHufPrice, humanizeIconLabel } from "./lib";

const FILE = "zedonwellness-HUN - Megrendelos - 61fbaf174fc3c258b85c2810.csv";

function seriesNameFor(nameHu: string): string {
  if (nameHu.startsWith("Hanscraft szauna")) return "Hanscraft";
  if (nameHu.startsWith("Hordó szauna")) return "Hordó szauna";
  if (nameHu.startsWith("OKA Fusion Synergy")) return "OKA Fusion Synergy";
  if (nameHu.startsWith("OKA Pure Essential")) return "OKA Pure Essential";
  if (nameHu.startsWith("OKA Aura")) return "OKA Aura";
  return "Egyéb";
}

const STAIN_SLUGS = new Set(["hanscraft-szauna-s1", "hanscraft-szauna-s2", "hanscraft-szauna-s3"]);
const STAIN_CHOICES = ["Északi luc", "Thermowood", "Fehér nyár"];

async function main() {
  const { db } = await import("../../src/db");
  const { products, categories, productSeries, productFeatureGroups, productFeatures, productFeatureLinks } =
    await import("../../src/db/schema");
  const { eq, and } = await import("drizzle-orm");

  const category = await db.query.categories.findFirst({ where: eq(categories.slug, "szaunak") });
  if (!category) throw new Error('Category "szaunak" not found.');

  // "Szauna jellemzők" feature group + one feature per distinct icon URL.
  let featureGroup = await db.query.productFeatureGroups.findFirst({
    where: eq(productFeatureGroups.nameHu, "Szauna jellemzők"),
  });
  if (!featureGroup) {
    [featureGroup] = await db
      .insert(productFeatureGroups)
      .values({ nameHu: "Szauna jellemzők", nameEn: "Sauna features" })
      .returning();
    console.log('  created feature group "Szauna jellemzők"');
  }

  const rows = readCsv(FILE);

  // Pre-create every distinct icon feature referenced anywhere in the file.
  const iconUrls = new Set<string>();
  for (const row of rows) {
    for (const u of (row["Kiegészítők"] ?? "").split(";").map((s) => s.trim()).filter(Boolean)) {
      iconUrls.add(u);
    }
  }
  const featureIdByUrl = new Map<string, number>();
  for (const url of iconUrls) {
    const label = humanizeIconLabel(url);
    let feature = await db.query.productFeatures.findFirst({
      where: and(eq(productFeatures.groupId, featureGroup.id), eq(productFeatures.nameHu, label)),
    });
    if (!feature) {
      [feature] = await db
        .insert(productFeatures)
        .values({ groupId: featureGroup.id, nameHu: label, iconUrl: resolveAsset(url) })
        .returning();
    }
    featureIdByUrl.set(url, feature.id);
  }
  console.log(`  ${featureIdByUrl.size} distinct sauna feature icons ready`);

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const slug = row.Slug?.trim();
    const nameHu = row.Name?.trim();
    if (!slug || !nameHu) continue;

    const seriesName = seriesNameFor(nameHu);
    let series = await db.query.productSeries.findFirst({
      where: and(eq(productSeries.categoryId, category.id), eq(productSeries.name, seriesName)),
    });
    if (!series) {
      [series] = await db.insert(productSeries).values({ categoryId: category.id, name: seriesName }).returning();
      console.log(`  created series "${seriesName}"`);
    }

    const priceRaw = row["Ár"]?.trim() ?? "";
    const priceOnRequest = priceRaw === "" || !/\d/.test(priceRaw);
    const priceHuf = priceOnRequest ? 0 : (parseHufPrice(priceRaw) ?? 0);

    const images = resolveImages(row["More Image"]);
    const mainImage = images[0] ?? resolveAsset(row["Main Image"]);

    const threeDArUrl =
      row["3D megjelenítő"]?.trim().toLowerCase() === "true" ? row["3D Külső link"]?.trim() || null : null;

    const variantOptions = STAIN_SLUGS.has(slug)
      ? [
          {
            nameHu: "Pác színe",
            nameEn: "Stain color",
            choices: STAIN_CHOICES.map((c) => ({ nameHu: c, nameEn: c, imageUrl: null })),
          },
        ]
      : [];

    const values = {
      slug,
      categoryId: category.id,
      seriesId: series.id,
      nameHu,
      shortDescriptionHu: row["Description"]?.trim() || null,
      descriptionHu: row["Teljes leírás"]?.trim() || null,
      priceHuf: String(priceHuf),
      priceOnRequest,
      orderOnly: true,
      images,
      mainImage,
      threeDArUrl,
      variantOptions,
      inStock: true,
    };

    const existing = await db.query.products.findFirst({ where: eq(products.slug, slug) });
    let productId: number;
    if (existing) {
      await db.update(products).set({ ...values, updatedAt: new Date() }).where(eq(products.id, existing.id));
      productId = existing.id;
      updated++;
    } else {
      const [inserted] = await db.insert(products).values(values).returning();
      productId = inserted.id;
      created++;
    }

    const rowIconUrls = (row["Kiegészítők"] ?? "").split(";").map((s) => s.trim()).filter(Boolean);
    const featureIds = [...new Set(rowIconUrls.map((u) => featureIdByUrl.get(u)).filter((id): id is number => !!id))];
    await db.delete(productFeatureLinks).where(eq(productFeatureLinks.productId, productId));
    if (featureIds.length > 0) {
      await db.insert(productFeatureLinks).values(featureIds.map((featureId) => ({ productId, featureId })));
    }
  }

  console.log(`Done. created=${created} updated=${updated}`);
}

main();
