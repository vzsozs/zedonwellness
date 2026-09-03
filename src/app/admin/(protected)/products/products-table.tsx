"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Pencil, Trash2 } from "lucide-react";
import type { Category, Product } from "@/db/schema";
import { formatEur } from "@/lib/currency";
import { deleteProduct } from "./actions";

type ProductRow = Product & { category: Category | null };

export function ProductsTable({ items }: { items: ProductRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = items.filter((p) =>
    p.nameHu.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          strokeWidth={1.8}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Keresés név szerint…"
          className="w-full border border-line bg-white py-2.5 pr-3.5 pl-9 text-sm outline-none focus:border-accent"
        />
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
            {filtered.map((p) => (
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
                <td className="px-5 py-3 text-muted">{p.category?.nameHu ?? "—"}</td>
                <td className="px-5 py-3">
                  {Number(p.priceHuf).toLocaleString("hu-HU")} Ft
                  {p.priceEur !== null ? (
                    <span className="ml-1.5 text-xs text-muted">
                      ({formatEur(Number(p.priceEur))})
                    </span>
                  ) : null}
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {!p.inStock ? <Badge>Nincs készleten</Badge> : null}
                    {p.orderOnly ? <Badge>Csak megrendelés</Badge> : null}
                    {p.isFeatured ? <Badge>Kiemelt</Badge> : null}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-3.5">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      aria-label="Szerkesztés"
                      className="text-accent hover:text-accent-dark"
                    >
                      <Pencil className="size-4" strokeWidth={1.8} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteProduct(p.id)}
                      aria-label="Törlés"
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="size-4" strokeWidth={1.8} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-muted">
                  {items.length === 0 ? "Még nincs termék." : "Nincs találat."}
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
