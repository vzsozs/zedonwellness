// One-off: imports the 3 Webflow grill collections (Beépített BBQs, BBQ
// Grillkocsiks, Pizza Kemences) into our `products` table, category
// "grillek", one series per collection. Upserts by slug — safe to re-run.
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { readCsv, resolveImages, resolveAsset, parseHufPrice } from "./lib";

const FILES: { file: string; seriesName: string }[] = [
  { file: "zedonwellness-HUN - Beépített BBQs - 65b1e5edfe305f84b70f6c4f.csv", seriesName: "Beépített BBQ" },
  { file: "zedonwellness-HUN - BBQ Grillkocsiks - 65b257bc52d2ecc7e1c88cfe.csv", seriesName: "Grillkocsik" },
  { file: "zedonwellness-HUN - Pizza Kemences - 65b3ce58e79b44394101d6ca.csv", seriesName: "Kemencék" },
];

// "Táblázat - X" CSV columns -> our specs list. Boolean columns only show up
// as a spec row when true (mirrors how Webflow only rendered the icon/row
// when the field was checked); text/measurement columns show whenever
// non-empty.
const SPEC_COLUMNS: { column: string; label: string; boolean?: boolean }[] = [
  { column: "Táblázat - Méretek", label: "Méretek" },
  { column: "Táblázat - Teljesítmény", label: "Teljesítmény" },
  { column: "Kocsi", label: "Kocsi" },
  { column: "Táblázat - Égők", label: "Égők" },
  { column: "Táblázat - Infra hátsó égő", label: "Infra hátsó égő", boolean: true },
  { column: "Táblázat - Piezo", label: "Piezo gyújtás", boolean: true },
  { column: "Táblázat - Rozsdamentes acél köppeny", label: "Rozsdamentes acél köpeny" },
  { column: "Táblázat - Hőmérő", label: "Hőmérő", boolean: true },
  { column: "Táblázat - Rács", label: "Rács", boolean: true },
  { column: "Táblázat - Forgatómotor", label: "Forgatómotor", boolean: true },
  { column: "Táblázat - Zsírtartó tálca", label: "Zsírtartó tálca", boolean: true },
  { column: "Táblázat - Oldalsó polcok", label: "Oldalsó polcok", boolean: true },
  { column: "Táblázat - Világítás", label: "Világítás", boolean: true },
  { column: "Táblázat - Alsó főzőfelület", label: "Alsó főzőfelület" },
  { column: "Táblázat - Felső főzőfelület", label: "Felső főzőfelület" },
  { column: "Táblázat - Pizzasütő kő", label: "Pizzasütő kő" },
  { column: "Táblázat - köpeny alsó rész", label: "Köpeny (alsó rész)" },
  { column: "Táblázat - köpeny felső rész", label: "Köpeny (felső rész)" },
];

function buildSpecs(row: Record<string, string>) {
  const specs: { label: string; value: string }[] = [];
  for (const { column, label, boolean } of SPEC_COLUMNS) {
    const raw = row[column]?.trim();
    if (!raw) continue;
    if (boolean) {
      if (raw.toLowerCase() === "true") specs.push({ label, value: "Igen" });
      continue;
    }
    specs.push({ label, value: raw });
  }
  return specs;
}

function buildDocuments(row: Record<string, string>) {
  const docs: { label: string; url: string }[] = [];
  for (const n of [1, 2, 3]) {
    const label = row[`Dokumentum fájlnév ${n}`]?.trim();
    const url = resolveAsset(row[`Fájl ${n}`]);
    if (label && url) docs.push({ label, url });
  }
  return docs;
}

async function main() {
  const { db } = await import("../../src/db");
  const { products, categories, productSeries } = await import("../../src/db/schema");
  const { eq, and } = await import("drizzle-orm");

  const category = await db.query.categories.findFirst({ where: eq(categories.slug, "grillek") });
  if (!category) throw new Error('Category "grillek" not found.');

  let created = 0;
  let updated = 0;

  for (const { file, seriesName } of FILES) {
    let series = await db.query.productSeries.findFirst({
      where: and(eq(productSeries.categoryId, category.id), eq(productSeries.name, seriesName)),
    });
    if (!series) {
      [series] = await db.insert(productSeries).values({ categoryId: category.id, name: seriesName }).returning();
      console.log(`  created series "${seriesName}"`);
    }

    const rows = readCsv(file);
    for (const row of rows) {
      const slug = row.Slug?.trim();
      const nameHu = row.Name?.trim();
      if (!slug || !nameHu) continue;

      const priceHuf = parseHufPrice(row["Ár"]) ?? 0;
      const images = resolveImages(row["More Image"]) ;
      const mainImage = images[0] ?? resolveAsset(row["Main Image"]);

      const values = {
        slug,
        categoryId: category.id,
        seriesId: series.id,
        nameHu,
        shortDescriptionHu: row["Description"]?.trim() || null,
        descriptionHu: row["Teljes leírás"]?.trim() || null,
        priceHuf: String(priceHuf),
        images,
        mainImage,
        specs: buildSpecs(row),
        documents: buildDocuments(row),
        inStock: true,
      };

      const existing = await db.query.products.findFirst({ where: eq(products.slug, slug) });
      if (existing) {
        await db.update(products).set({ ...values, updatedAt: new Date() }).where(eq(products.id, existing.id));
        updated++;
      } else {
        await db.insert(products).values(values);
        created++;
      }
    }
  }

  console.log(`Done. created=${created} updated=${updated}`);
}

main();
