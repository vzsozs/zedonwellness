import { Trash2 } from "lucide-react";
import { db } from "@/db";
import { shippingRates } from "@/db/schema";
import { asc } from "drizzle-orm";
import { createShippingRate, deleteShippingRate } from "./actions";

const ZONE_LABEL = { domestic: "Belföld", international: "Külföld" } as const;

export default async function ShippingPage() {
  const items = await db.query.shippingRates.findMany({
    orderBy: [asc(shippingRates.zone), asc(shippingRates.sortOrder), asc(shippingRates.minKg)],
  });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold">Szállítási díjak (GLS)</h1>
      <p className="mb-6 max-w-2xl text-sm text-muted">
        Csak GLS-sel szállítunk, belföldre és külföldre egyaránt, súly szerinti
        sávokban. 40 kg felett minden esetben egyedi ajánlatot adunk — ilyen
        sávnál hagyd üresen a &bdquo;-ig&rdquo; mezőt és jelöld be az egyedi
        ajánlatot.
      </p>

      <div className="mb-10 overflow-x-auto border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold text-muted uppercase">
              <th className="px-5 py-3">Zóna</th>
              <th className="px-5 py-3">Súlysáv</th>
              <th className="px-5 py-3">Díj</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3">{ZONE_LABEL[r.zone]}</td>
                <td className="px-5 py-3 font-mono text-[13px] text-muted">
                  {Number(r.minKg)} kg – {r.maxKg ? `${Number(r.maxKg)} kg` : "∞"}
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
                    <button type="submit" aria-label="Törlés" className="text-red-600 hover:text-red-800">
                      <Trash2 className="size-4" strokeWidth={1.8} />
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
        <h2 className="mb-5 text-base font-semibold">Új súlysáv</h2>
        <form action={createShippingRate} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Zóna
            </label>
            <select
              name="zone"
              required
              className="w-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            >
              <option value="domestic">Belföld</option>
              <option value="international">Külföld</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Súly -tól (kg)" name="minKg" type="number" step="0.1" required />
            <Field
              label="Súly -ig (kg, üres = nyitott)"
              name="maxKg"
              type="number"
              step="0.1"
            />
          </div>
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
  step,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
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
        step={step}
        required={required}
        className="w-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
