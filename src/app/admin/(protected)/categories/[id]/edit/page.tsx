import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { updateCategory } from "../../actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, Number(id)),
  });
  if (!category) notFound();

  const updateWithId = updateCategory.bind(null, category.id);

  return (
    <div className="max-w-md">
      <h1 className="mb-8 text-2xl font-semibold">Kategória szerkesztése</h1>
      <form action={updateWithId} className="flex flex-col gap-4 border border-line bg-white p-6">
        <Field label="Slug (URL)" name="slug" defaultValue={category.slug} required />
        <Field label="Név (HU)" name="nameHu" defaultValue={category.nameHu} required />
        <Field label="Név (EN)" name="nameEn" defaultValue={category.nameEn ?? ""} />
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
