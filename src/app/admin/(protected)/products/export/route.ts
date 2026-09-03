import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { products } from "@/db/schema";
import { stringifyCsv } from "@/lib/csv";
import { CSV_COLUMNS, boolToCsv } from "../csv-columns";

// Route handlers aren't wrapped by the (protected) layout's auth check —
// that only guards page.tsx rendering — so this needs its own session check.
export async function GET() {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const items = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    with: { category: true, series: true },
  });

  const rows = items.map((p) => {
    const record: Record<(typeof CSV_COLUMNS)[number], string> = {
      id: String(p.id),
      szlug: p.slug,
      cikkszam: p.sku ?? "",
      kategoria: p.category?.slug ?? "",
      sorozat: p.series?.name ?? "",
      nev_hu: p.nameHu,
      nev_en: p.nameEn ?? "",
      alcim_hu: p.subtitleHu ?? "",
      alcim_en: p.subtitleEn ?? "",
      rovid_leiras_hu: p.shortDescriptionHu ?? "",
      rovid_leiras_en: p.shortDescriptionEn ?? "",
      ar_eur: p.priceEur ?? "",
      ar_huf: p.priceHuf,
      ar_huf_manualis: boolToCsv(p.priceHufManual),
      ferohely: p.capacity !== null ? String(p.capacity) : "",
      suly_kg: p.weightKg ?? "",
      csak_megrendelheto: boolToCsv(p.orderOnly),
      keszleten: boolToCsv(p.inStock),
      kiemelt: boolToCsv(p.isFeatured),
      uj: boolToCsv(p.isNew),
      akcio: boolToCsv(p.isOnSale),
      ar_3d: p.threeDArUrl ?? "",
    };
    return CSV_COLUMNS.map((col) => record[col]);
  });

  // Leading BOM so Excel opens the UTF-8 file with Hungarian accents intact.
  const csv = "﻿" + stringifyCsv([[...CSV_COLUMNS], ...rows]);
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="termekek-${date}.csv"`,
    },
  });
}
