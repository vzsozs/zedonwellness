import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { deleteProduct } from "./actions";

export default async function ProductsPage() {
  const items = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    with: { category: true },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Termékek</h1>
        <Link
          href="/admin/products/new"
          className="bg-ink px-5 py-2.5 text-sm font-semibold text-white"
        >
          + Új termék
        </Link>
      </div>

      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold text-muted uppercase">
              <th className="px-5 py-3"></th>
              <th className="px-5 py-3">Név</th>
              <th className="px-5 py-3">Kategória</th>
              <th className="px-5 py-3">Ár</th>
              <th className="px-5 py-3">Állapot</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3">
                  {p.mainImage ? (
                    <div className="h-12 w-14 overflow-hidden border border-line">
                      <img src={p.mainImage} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-12 w-14 border border-line bg-paper-muted" />
                  )}
                </td>
                <td className="px-5 py-3">{p.nameHu}</td>
                <td className="px-5 py-3 text-muted">
                  {p.category?.nameHu ?? "—"}
                </td>
                <td className="px-5 py-3">
                  {Number(p.priceHuf).toLocaleString("hu-HU")} Ft
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {!p.inStock ? <Badge>Nincs készleten</Badge> : null}
                    {p.orderOnly ? <Badge>Csak megrendelés</Badge> : null}
                    {p.isFeatured ? <Badge>Kiemelt</Badge> : null}
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="mr-4 text-accent hover:text-accent-dark"
                  >
                    Szerkesztés
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteProduct(p.id);
                    }}
                    className="inline"
                  >
                    <button type="submit" className="text-red-600 hover:text-red-800">
                      Törlés
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-muted">
                  Még nincs termék.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-paper-muted px-2 py-0.5 text-[11px] font-semibold text-muted">
      {children}
    </span>
  );
}
