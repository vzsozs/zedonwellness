// Egyszeri áttekintő: milyen specifikáció-címkék fordulnak elő a
// termékeken — a főoldali kártya spec-sávjának ikonozásához.
import { config } from "dotenv";
config();
config({ path: ".env.local", override: true });

const { db } = await import("../../src/db/index.ts");

const rows = await db.query.products.findMany({
  columns: { specs: true, capacity: true, isFeatured: true },
});

const counts = new Map<string, number>();
for (const r of rows) {
  for (const s of r.specs) {
    if (s.type === "boolean") continue;
    counts.set(s.label, (counts.get(s.label) ?? 0) + 1);
  }
}
console.log(`termékek: ${rows.length} | kiemelt: ${rows.filter((r) => r.isFeatured).length} | van férőhely: ${rows.filter((r) => r.capacity).length}`);
console.log("\nleggyakoribb specifikáció-címkék:");
for (const [label, n] of [...counts].sort((a, b) => b[1] - a[1]).slice(0, 25)) {
  console.log(`  ${String(n).padStart(3)}×  ${label}`);
}
process.exit(0);
