import { db } from "@/db";
import { products, categories, extras, orders } from "@/db/schema";

export default async function AdminDashboard() {
  const [productCount, categoryCount, extraCount, orderCount] = await Promise.all([
    db.$count(products),
    db.$count(categories),
    db.$count(extras),
    db.$count(orders),
  ]);

  const stats = [
    { label: "Termékek", value: productCount },
    { label: "Kategóriák", value: categoryCount },
    { label: "Extrák", value: extraCount },
    { label: "Rendelések", value: orderCount },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold">Áttekintés</h1>
      <div className="grid grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="border border-line bg-white p-6">
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="mt-1.5 text-sm text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
