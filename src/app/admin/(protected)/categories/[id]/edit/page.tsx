import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { categories, productSeries } from "@/db/schema";
import { updateCategory } from "../../actions";
import { createSeries, deleteSeries } from "../../series-actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoryId = Number(id);
  const [category, series] = await Promise.all([
    db.query.categories.findFirst({ where: eq(categories.id, categoryId) }),
    db.query.productSeries.findMany({
      where: eq(productSeries.categoryId, categoryId),
      orderBy: [asc(productSeries.sortOrder), asc(productSeries.name)],
    }),
  ]);
  if (!category) notFound();

  const updateWithId = updateCategory.bind(null, category.id);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold">Kategória szerkesztése</h1>
      <div className="grid grid-cols-2 gap-8 max-lg:grid-cols-1">
        <form
          action={updateWithId}
          className="flex flex-col gap-4 border border-line bg-white p-6"
        >
          <Field label="Slug (URL)" name="slug" defaultValue={category.slug} required />
          <Field label="Név (HU)" name="nameHu" defaultValue={category.nameHu} required />
          <Field label="Név (EN)" name="nameEn" defaultValue={category.nameEn ?? ""} />
          <Field
            label="Leírás (HU)"
            name="descriptionHu"
            defaultValue={category.descriptionHu ?? ""}
          />
          <Field
            label="Leírás (EN)"
            name="descriptionEn"
            defaultValue={category.descriptionEn ?? ""}
          />
          <Field
            label="Sorrend"
            name="sortOrder"
            type="number"
            defaultValue={String(category.sortOrder)}
          />
          <button type="submit" className="mt-1 bg-ink py-2.5 text-sm font-semibold text-white">
            Mentés
          </button>
        </form>

        <div className="border border-line bg-white p-6">
          <h2 className="mb-1.5 text-base font-semibold">Sorozatok</h2>
          <p className="mb-5 text-xs text-muted">
            A termékfelvitelnél ebből a listából lehet majd választani —
            innen elkerülhető az elgépelés.
          </p>

          <div className="mb-5 flex flex-col gap-2">
            {series.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between border border-line px-3.5 py-2.5 text-sm"
              >
                {s.name}
                <form
                  action={async () => {
                    "use server";
                    await deleteSeries(s.id);
                  }}
                >
                  <button type="submit" className="text-red-600 hover:text-red-800">
                    Törlés
                  </button>
                </form>
              </div>
            ))}
            {series.length === 0 ? (
              <p className="text-sm text-muted">Még nincs sorozat felvéve.</p>
            ) : null}
          </div>

          <form action={createSeries} className="flex gap-2.5">
            <input type="hidden" name="categoryId" value={category.id} />
            <input
              type="text"
              name="name"
              required
              placeholder="Új sorozat neve (pl. HC Design)"
              className="flex-1 border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="bg-ink px-5 py-2.5 text-sm font-semibold text-white"
            >
              Hozzáadás
            </button>
          </form>
        </div>
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
