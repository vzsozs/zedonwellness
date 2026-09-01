import type { Category } from "@/db/schema";

type ProductFormValues = {
  slug?: string;
  categoryId?: number;
  nameHu?: string;
  nameEn?: string | null;
  series?: string | null;
  subtitleHu?: string | null;
  subtitleEn?: string | null;
  descriptionHu?: string | null;
  descriptionEn?: string | null;
  priceHuf?: string;
  eurPriceOverride?: string | null;
  orderOnly?: boolean;
  inStock?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  images?: string[];
  specs?: Record<string, string>;
};

export function ProductForm({
  categories,
  values,
  action,
  submitLabel,
}: {
  categories: Category[];
  values?: ProductFormValues;
  action: (formData: FormData) => void;
  submitLabel: string;
}) {
  const specsText = values?.specs
    ? Object.entries(values.specs)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    : "";

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <Field label="Slug (URL)" name="slug" defaultValue={values?.slug} required />
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">
            Kategória
          </label>
          <select
            name="categoryId"
            required
            defaultValue={values?.categoryId ?? ""}
            className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          >
            <option value="" disabled>
              Válassz…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameHu}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Field label="Név (HU)" name="nameHu" defaultValue={values?.nameHu} required />
        <Field label="Név (EN)" name="nameEn" defaultValue={values?.nameEn ?? ""} />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <Field
          label="Sorozat (pl. HC Design)"
          name="series"
          defaultValue={values?.series ?? ""}
        />
        <Field
          label="Alcím (HU) — pl. 6 fő · 220×220 cm"
          name="subtitleHu"
          defaultValue={values?.subtitleHu ?? ""}
        />
        <Field
          label="Alcím (EN)"
          name="subtitleEn"
          defaultValue={values?.subtitleEn ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <TextArea
          label="Leírás (HU)"
          name="descriptionHu"
          defaultValue={values?.descriptionHu ?? ""}
        />
        <TextArea
          label="Leírás (EN)"
          name="descriptionEn"
          defaultValue={values?.descriptionEn ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Field
          label="Ár (HUF, bruttó)"
          name="priceHuf"
          type="number"
          defaultValue={values?.priceHuf}
          required
        />
        <Field
          label="EUR ár felülírás (opcionális)"
          name="eurPriceOverride"
          type="number"
          step="0.01"
          defaultValue={values?.eurPriceOverride ?? ""}
        />
      </div>

      <TextArea
        label="Képek (egy URL soronként)"
        name="images"
        defaultValue={(values?.images ?? []).join("\n")}
        rows={3}
      />

      <TextArea
        label="Specifikáció (formátum: Címke: érték, soronként)"
        name="specs"
        defaultValue={specsText}
        rows={4}
      />

      <div className="grid grid-cols-2 gap-3">
        <Checkbox
          label="Készleten"
          name="inStock"
          defaultChecked={values?.inStock ?? true}
        />
        <Checkbox
          label="Csak megrendelhető (nincs online fizetés)"
          name="orderOnly"
          defaultChecked={values?.orderOnly ?? false}
        />
        <Checkbox
          label="Kiemelt termék"
          name="isFeatured"
          defaultChecked={values?.isFeatured ?? false}
        />
        <Checkbox label="Újdonság" name="isNew" defaultChecked={values?.isNew ?? false} />
        <Checkbox
          label="Akciós"
          name="isOnSale"
          defaultChecked={values?.isOnSale ?? false}
        />
      </div>

      <button
        type="submit"
        className="mt-2 w-fit bg-ink px-8 py-3 text-sm font-semibold text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  step,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
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
        step={step}
        required={required}
        defaultValue={defaultValue}
        className="w-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">
        {label}
      </label>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="w-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}

function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="accent-accent"
      />
      {label}
    </label>
  );
}
