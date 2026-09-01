import { db } from "@/db";
import { extras } from "@/db/schema";
import { asc } from "drizzle-orm";
import { ImagePlus } from "lucide-react";
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
        extrák érhetők el az adott terméknél. Kártyaként jelennek meg a
        főoldalon is.
      </p>

      <div className="mb-12 grid grid-cols-4 gap-5 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {items.map((e) => {
          const updateWithId = updateExtra.bind(null, e.id);
          const formId = `extra-${e.id}`;
          return (
            <div key={e.id} className="border border-line bg-white">
              <form id={formId} action={updateWithId} />
              <label className="relative block h-32 w-full cursor-pointer border-b border-line bg-paper-muted">
                {e.imageUrl ? (
                  <img src={e.imageUrl} alt="" className="h-32 w-full object-cover" />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center text-muted">
                    <ImagePlus className="size-6" strokeWidth={1.6} />
                  </div>
                )}
                <input
                  form={formId}
                  type="file"
                  name="imageFile"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                />
              </label>
              <div className="flex flex-col gap-2.5 p-4">
                <input
                  form={formId}
                  name="nameHu"
                  defaultValue={e.nameHu}
                  required
                  placeholder="Név (HU)"
                  className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-accent"
                />
                <input
                  form={formId}
                  name="nameEn"
                  defaultValue={e.nameEn ?? ""}
                  placeholder="Név (EN)"
                  className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-accent"
                />
                <div className="flex gap-2.5">
                  <input
                    form={formId}
                    type="number"
                    name="priceHuf"
                    defaultValue={e.priceHuf}
                    required
                    placeholder="Ár (Ft)"
                    className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                  <input
                    form={formId}
                    type="number"
                    name="sortOrder"
                    defaultValue={e.sortOrder}
                    placeholder="Sorrend"
                    className="w-20 shrink-0 border border-line px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                {e.imageUrl ? (
                  <label className="flex items-center gap-2 text-[11px] text-muted">
                    <input
                      form={formId}
                      type="checkbox"
                      name="clearImage"
                      className="accent-accent"
                    />
                    Kép törlése
                  </label>
                ) : null}
                <div className="mt-1 flex items-center justify-between">
                  <button
                    form={formId}
                    type="submit"
                    className="text-sm font-semibold text-accent hover:text-accent-dark"
                  >
                    Mentés
                  </button>
                  <form
                    action={async () => {
                      "use server";
                      await deleteExtra(e.id);
                    }}
                  >
                    <button type="submit" className="text-sm text-red-600 hover:text-red-800">
                      Törlés
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="max-w-md border border-line bg-white p-6">
        <h2 className="mb-5 text-base font-semibold">Új extra</h2>
        <form action={createExtra} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Kép
            </label>
            <input
              type="file"
              name="imageFile"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="block w-full text-sm"
            />
          </div>
          <Field label="Név (HU)" name="nameHu" required />
          <Field label="Név (EN)" name="nameEn" />
          <div className="grid grid-cols-2 gap-4">
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
