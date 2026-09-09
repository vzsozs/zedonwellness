import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ProductsTable } from "./products-table";

export default async function ProductsPage() {
  const items = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    with: { category: true },
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Termékek</h1>
        <div className="flex flex-wrap items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- 
              route handler that streams a CSV download, not a page: next/link
              would prefetch it and trigger a spurious export. */}
          <a
            href="/admin/products/export"
            className="rounded-control border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:border-ink"
          >
            CSV export
          </a>
          <Link
            href="/admin/products/import"
            className="rounded-control border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:border-ink"
          >
            CSV import
          </Link>
          <Link
            href="/admin/products/new"
            className="rounded-control bg-ink px-5 py-2.5 text-sm font-semibold text-white"
          >
            + Új termék
          </Link>
        </div>
      </div>

      <ProductsTable items={items} />
    </div>
  );
}
