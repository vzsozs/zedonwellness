import { db } from "@/db";
import { products, categories, orders } from "@/db/schema";

export default async function AdminDashboard() {
  const [productCount, categoryCount, orderCount] = await Promise.all([
    db.$count(products),
    db.$count(categories),
    db.$count(orders),
  ]);

  const stats = [
    { label: "Termékek", value: productCount },
    { label: "Kategóriák", value: categoryCount },
    { label: "Rendelések", value: orderCount },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold">Áttekintés</h1>
      <div className="grid grid-cols-3 gap-5">
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
