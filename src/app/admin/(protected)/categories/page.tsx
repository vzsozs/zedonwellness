import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { createCategory, deleteCategory } from "./actions";

export default async function CategoriesPage() {
  const items = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.nameHu)],
  });

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold">Kategóriák</h1>

      <div className="mb-10 border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold text-muted uppercase">
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3">Név (HU)</th>
              <th className="px-5 py-3">Név (EN)</th>
              <th className="px-5 py-3">Sorrend</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 font-mono text-[13px]">{c.slug}</td>
                <td className="px-5 py-3">{c.nameHu}</td>
                <td className="px-5 py-3 text-muted">{c.nameEn ?? "—"}</td>
                <td className="px-5 py-3">{c.sortOrder}</td>
                <td className="px-5 py-3 text-right">
                  <a
                    href={`/admin/categories/${c.id}/edit`}
                    className="mr-4 text-accent hover:text-accent-dark"
                  >
                    Szerkesztés
                  </a>
                  <form
                    action={async () => {
                      "use server";
                      await deleteCategory(c.id);
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
                <td colSpan={5} className="px-5 py-6 text-center text-muted">
                  Még nincs kategória.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="border border-line bg-white p-6">
        <h2 className="mb-5 text-base font-semibold">Új kategória</h2>
        <form action={createCategory} className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-5">
            <Field label="Slug (URL, pl. jakuzzik)" name="slug" required />
            <Field label="Név (HU)" name="nameHu" required />
            <Field label="Név (EN)" name="nameEn" />
          </div>
          <div className="grid grid-cols-3 gap-5">
            <Field
              label="Leírás (HU) — pl. HC Design, Celtic, OKA — 25+ modell"
              name="descriptionHu"
            />
            <Field label="Leírás (EN)" name="descriptionEn" />
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
