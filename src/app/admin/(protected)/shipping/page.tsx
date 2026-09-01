import { db } from "@/db";
import { shippingRates } from "@/db/schema";
import { asc } from "drizzle-orm";
import { createShippingRate, deleteShippingRate } from "./actions";

export default async function ShippingPage() {
  const items = await db.query.shippingRates.findMany({
    orderBy: [asc(shippingRates.id)],
  });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold">Szállítási díjak</h1>

      <div className="mb-10 border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold text-muted uppercase">
              <th className="px-5 py-3">Megnevezés</th>
              <th className="px-5 py-3">Sáv</th>
              <th className="px-5 py-3">Díj</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3">{r.label}</td>
                <td className="px-5 py-3 font-mono text-[13px] text-muted">
                  {r.band}
                </td>
                <td className="px-5 py-3">
                  {r.requiresQuote
                    ? "Egyedi ajánlat"
                    : `${Number(r.priceHuf ?? 0).toLocaleString("hu-HU")} Ft`}
                </td>
                <td className="px-5 py-3 text-right">
                  <form
                    action={async () => {
                      "use server";
                      await deleteShippingRate(r.id);
                    }}
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
                <td colSpan={4} className="px-5 py-6 text-center text-muted">
                  Még nincs szállítási díjsáv.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="max-w-md border border-line bg-white p-6">
        <h2 className="mb-5 text-base font-semibold">Új díjsáv</h2>
        <form action={createShippingRate} className="flex flex-col gap-4">
          <Field label="Megnevezés" name="label" required />
          <Field
            label="Sáv azonosító (pl. small, large, custom-quote)"
            name="band"
            required
          />
          <Field label="Díj (Ft)" name="priceHuf" type="number" />
          <label className="flex items-center gap-2.5 text-sm">
            <input type="checkbox" name="requiresQuote" className="accent-accent" />
            Egyedi ajánlatot igényel (nincs fix díj)
          </label>
          <button
            type="submit"
            className="mt-1 bg-ink py-2.5 text-sm font-semibold text-white"
          >
            Létrehozás
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
