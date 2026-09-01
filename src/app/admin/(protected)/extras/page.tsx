import { db } from "@/db";
import { extras } from "@/db/schema";
import { asc } from "drizzle-orm";
import { createExtra, updateExtra, deleteExtra } from "./actions";

export default async function ExtrasPage() {
  const items = await db.query.extras.findMany({
    orderBy: [asc(extras.sortOrder), asc(extras.nameHu)],
  });

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Extrák</h1>
      <p className="mb-8 max-w-2xl text-sm text-muted">
        Ez a rendelhető extrák globális katalógusa (pl. Lépcső, WiFi, Audio
        rendszer) — a termék szerkesztésénél innen lehet kiválasztani, mely
        extrák érhetők el az adott terméknél.
      </p>

      <div className="mb-10 border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold text-muted uppercase">
              <th className="px-5 py-3">Név (HU)</th>
              <th className="px-5 py-3">Név (EN)</th>
              <th className="px-5 py-3">Ár (Ft)</th>
              <th className="px-5 py-3">Sorrend</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => {
              const updateWithId = updateExtra.bind(null, e.id);
              const formId = `extra-${e.id}`;
              return (
                <tr key={e.id} className="border-b border-line last:border-0">
                  <td className="p-0">
                    <input
                      form={formId}
                      name="nameHu"
                      defaultValue={e.nameHu}
                      required
                      className="w-full px-5 py-3 text-sm outline-none focus:bg-paper-muted"
                    />
                  </td>
                  <td className="p-0">
                    <input
                      form={formId}
                      name="nameEn"
                      defaultValue={e.nameEn ?? ""}
                      className="w-full px-5 py-3 text-sm outline-none focus:bg-paper-muted"
                    />
                  </td>
                  <td className="p-0">
                    <input
                      form={formId}
                      type="number"
                      name="priceHuf"
                      defaultValue={e.priceHuf}
                      required
                      className="w-full px-5 py-3 text-sm outline-none focus:bg-paper-muted"
                    />
                  </td>
                  <td className="p-0">
                    <input
                      form={formId}
                      type="number"
                      name="sortOrder"
                      defaultValue={e.sortOrder}
                      className="w-full px-5 py-3 text-sm outline-none focus:bg-paper-muted"
                    />
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <form id={formId} action={updateWithId} className="inline">
                      <button type="submit" className="mr-4 text-accent hover:text-accent-dark">
                        Mentés
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await deleteExtra(e.id);
                      }}
                      className="inline"
                    >
                      <button type="submit" className="text-red-600 hover:text-red-800">
                        Törlés
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-muted">
                  Még nincs extra felvéve.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="max-w-2xl border border-line bg-white p-6">
        <h2 className="mb-5 text-base font-semibold">Új extra</h2>
        <form action={createExtra} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-5">
            <Field label="Név (HU)" name="nameHu" required />
            <Field label="Név (EN)" name="nameEn" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Ár (Ft)" name="priceHuf" type="number" required />
            <Field label="Sorrend" name="sortOrder" type="number" defaultValue="0" />
          </div>
          <button
            type="submit"
            className="mt-1 w-fit bg-ink px-8 py-2.5 text-sm font-semibold text-white"
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
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
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
        defaultValue={defaultValue}
        className="w-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
