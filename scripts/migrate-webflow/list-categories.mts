// Egyszeri áttekintő: mit tartalmaznak most a kategóriák (név, leírás,
// sorozatok, termékszám) — a főoldali kártyák szövegének tervezéséhez.
import { config } from "dotenv";
config();
config({ path: ".env.local", override: true });

const { db } = await import("../../src/db/index.ts");

const rows = await db.query.categories.findMany({
  columns: { slug: true, nameHu: true, nameEn: true, descriptionHu: true, sortOrder: true },
  with: { series: { columns: { name: true } }, products: { columns: { id: true } } },
});

for (const r of rows.sort((a, b) => a.sortOrder - b.sortOrder)) {
  console.log(
    `  ${r.slug.padEnd(13)} | ${r.nameHu.padEnd(14)} | ${String(r.products.length).padStart(3)} termék | ${r.series.map((s) => s.name).join(", ") || "—"}`,
  );
  console.log(`      ${r.descriptionHu ?? "(nincs leírás)"}`);
}
process.exit(0);
