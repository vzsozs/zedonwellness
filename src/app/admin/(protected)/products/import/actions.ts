"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, categories, productSeries } from "@/db/schema";
import { csvToRecords } from "@/lib/csv";
import { csvToBool } from "../csv-columns";
import { resolvePriceWithRate } from "@/lib/pricing";
import { getEurHufRate } from "@/lib/settings";
import { requireAdmin } from "@/lib/require-admin";
import { toActionError } from "@/lib/action-state";

export type ImportRowResult = {
  row: number;
  slug: string;
  status: "created" | "updated" | "error";
  message?: string;
};

export type ImportState = {
  error?: string;
  summary?: {
    created: number;
    updated: number;
    errors: number;
    rows: ImportRowResult[];
  };
};

function parseNum(raw: string | undefined): number | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  const normalized = /^-?\d+,\d+$/.test(s) ? s.replace(",", ".") : s;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export async function importProductsCsv(
  _prevState: ImportState,
  formData: FormData,
): Promise<ImportState> {
  try {
    await requireAdmin();
  } catch (err) {
    return toActionError(err);
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Válassz egy CSV fájlt." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "A CSV fájl mérete legfeljebb 5 MB lehet." };
  }

  const text = await file.text();
  const records = csvToRecords(text);
  if (records.length === 0) {
    return { error: "A CSV fájl üres, vagy nem sikerült beolvasni." };
  }

  // Fetched once up front rather than per row — resolvePrice would
  // otherwise hit the settings table for every line of the CSV.
  const [allCategories, allSeries, eurHufRate] = await Promise.all([
    db.select().from(categories),
    db.select().from(productSeries),
    getEurHufRate(),
  ]);
  const categoryBySlug = new Map(allCategories.map((c) => [c.slug, c]));
  const seriesByKey = new Map(
    allSeries.map((s) => [`${s.categoryId}:${s.name.toLowerCase()}`, s]),
  );

  const rows: ImportRowResult[] = [];
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const rowNum = i + 2; // +1 for 1-indexing, +1 for the header row
    const slug = (r.szlug ?? "").trim();

    try {
      if (!slug) throw new Error("Hiányzik a szlug (slug).");
      if (!/^[a-z0-9-]+$/.test(slug)) {
        throw new Error("Érvénytelen szlug — csak kisbetű, szám, kötőjel.");
      }
      const nameHu = (r.nev_hu ?? "").trim();
      if (!nameHu) throw new Error("Hiányzik a Név (HU).");

      const categorySlug = (r.kategoria ?? "").trim();
      const category = categoryBySlug.get(categorySlug);
      if (!category) throw new Error(`Ismeretlen kategória szlug: "${categorySlug}".`);

      const seriesName = (r.sorozat ?? "").trim();
      const series = seriesName
        ? seriesByKey.get(`${category.id}:${seriesName.toLowerCase()}`)
        : undefined;

      const priceEur = parseNum(r.ar_eur);
      if (priceEur === null && !(r.ar_huf ?? "").trim()) {
        throw new Error("Hiányzik az ár (ar_eur vagy ar_huf).");
      }
      const priceHufManual = csvToBool(r.ar_huf_manualis);
      const submittedHuf = parseNum(r.ar_huf) ?? 0;
      const price = resolvePriceWithRate(priceEur, submittedHuf, priceHufManual, eurHufRate);

      const capacityNum = parseNum(r.ferohely);
      const weightNum = parseNum(r.suly_kg);

      const values = {
        slug,
        sku: r.cikkszam?.trim() || null,
        categoryId: category.id,
        seriesId: series?.id ?? null,
        nameHu,
        nameEn: r.nev_en?.trim() || null,
        subtitleHu: r.alcim_hu?.trim() || null,
        subtitleEn: r.alcim_en?.trim() || null,
        shortDescriptionHu: r.rovid_leiras_hu?.trim() || null,
        shortDescriptionEn: r.rovid_leiras_en?.trim() || null,
        priceEur: priceEur === null ? null : String(priceEur),
        priceHuf: String(price.priceHuf),
        priceHufManual: price.priceHufManual,
        capacity: capacityNum === null ? null : Math.round(capacityNum),
        weightKg: weightNum === null ? null : String(weightNum),
        orderOnly: csvToBool(r.csak_megrendelheto),
        inStock: csvToBool(r.keszleten),
        isFeatured: csvToBool(r.kiemelt),
        isNew: csvToBool(r.uj),
        isOnSale: csvToBool(r.akcio),
        threeDArUrl: r.ar_3d?.trim() || null,
      };

      // Per row rather than per file: the report is row-by-row and one bad
      // line shouldn't undo the good ones — but a single row still has to
      // apply completely or not at all.
      const wasCreated = await db.transaction(async (tx) => {
        const existing = await tx.query.products.findFirst({
          where: eq(products.slug, slug),
        });
        if (existing) {
          await tx
            .update(products)
            .set({ ...values, updatedAt: new Date() })
            .where(eq(products.id, existing.id));
          return false;
        }
        await tx.insert(products).values(values);
        return true;
      });

      if (wasCreated) {
        created++;
        rows.push({ row: rowNum, slug, status: "created" });
      } else {
        updated++;
        rows.push({ row: rowNum, slug, status: "updated" });
      }
    } catch (err) {
      errors++;
      rows.push({
        row: rowNum,
        slug: slug || `(${rowNum}. sor)`,
        status: "error",
        message: err instanceof Error ? err.message : "Ismeretlen hiba",
      });
    }
  }

  if (created > 0 || updated > 0) {
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
  }

  return { summary: { created, updated, errors, rows } };
}
