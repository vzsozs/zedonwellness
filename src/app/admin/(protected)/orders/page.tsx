import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function OrdersPage() {
  const items = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
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
              <th className="px-5 py-3">Összeg</th>
              <th className="px-5 py-3">Állapot</th>
              <th className="px-5 py-3">Dátum</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 font-mono text-[13px]">
                  {o.orderNumber}
                </td>
                <td className="px-5 py-3">{o.customerName}</td>
                <td className="px-5 py-3">
                  {Number(o.totalHuf).toLocaleString("hu-HU")} {o.currency}
                </td>
                <td className="px-5 py-3">{o.status}</td>
                <td className="px-5 py-3 text-muted">
                  {new Date(o.createdAt).toLocaleDateString("hu-HU")}
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-muted">
                  Még nincs rendelés — a checkout folyamat elkészülte után
                  itt fognak megjelenni.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
