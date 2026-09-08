import Link from "next/link";
import { desc } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { formatHuf } from "@/lib/config";
import { ORDER_STATUS_LABELS, type OrderStatus } from "./order-status";
import { StatusBadge } from "./status-badge";

export default async function OrdersPage() {
  const items = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    limit: 200,
  });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold">Rendelések</h1>

      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold text-muted uppercase">
              <th className="px-5 py-3">Rendelésszám</th>
              <th className="px-5 py-3">Vevő</th>
              <th className="px-5 py-3">Tételek</th>
              <th className="px-5 py-3">Összeg</th>
              <th className="px-5 py-3">Állapot</th>
              <th className="px-5 py-3">Dátum</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0 hover:bg-paper-muted">
                <td className="px-5 py-3 font-mono text-[13px]">
                  <Link href={`/admin/orders/${o.id}`} className="text-accent hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <div>{o.customerName}</div>
                  <div className="text-xs text-muted">{o.customerEmail}</div>
                </td>
                <td className="px-5 py-3 text-muted">
                  {o.items.reduce((sum, i) => sum + i.quantity, 0)} db
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  {formatHuf(Number(o.totalHuf))}
                  {o.shippingAddress.shippingRequiresQuote ? (
                    <span className="text-muted"> + szállítás</span>
                  ) : null}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={o.status as OrderStatus} />
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-muted">
                  {new Date(o.createdAt).toLocaleString("hu-HU", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    aria-label={`${o.orderNumber} megnyitása`}
                    className="text-accent hover:text-accent-dark"
                  >
                    <ChevronRight className="size-4" strokeWidth={2} />
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-muted">
                  Még nincs rendelés.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted">
        Állapotok: {Object.values(ORDER_STATUS_LABELS).join(" · ")}
      </p>
    </div>
  );
}
