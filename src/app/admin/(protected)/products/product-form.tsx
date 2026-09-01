import type { Category, Product, ProductSeries } from "@/db/schema";
import { NameSlugFields } from "./name-slug-fields";
import { CategorySeriesFields } from "./category-series-fields";

export function ProductForm({
  categories,
  seriesList,
  values,
  action,
  submitLabel,
}: {
  categories: Category[];
  seriesList: ProductSeries[];
  values?: Product;
  action: (formData: FormData) => void;
  submitLabel: string;
}) {
  const specsText = values?.specs
    ? Object.entries(values.specs)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    : "";

  const variantOptionsText = values?.variantOptions?.length
    ? values.variantOptions
        .map((g) => `${g.nameHu}: ${g.choices.join(", ")}`)
        .join("\n")
    : "";

  const extrasText = values?.extras?.length
    ? values.extras.map((e) => `${e.nameHu}: ${e.priceHuf}`).join("\n")
    : "";

  return (
    <form action={action} className="flex max-w-4xl flex-col gap-5">
      <NameSlugFields defaultNameHu={values?.nameHu} defaultSlug={values?.slug} />

      <div className="grid grid-cols-2 gap-5">
        <Field label="SKU / cikkszám" name="sku" defaultValue={values?.sku ?? ""} />
        <Field label="Név (EN)" name="nameEn" defaultValue={values?.nameEn ?? ""} />
      </div>

      <CategorySeriesFields
        categories={categories}
        seriesList={seriesList}
        defaultCategoryId={values?.categoryId}
        defaultSeriesId={values?.seriesId}
      />

      <div className="grid grid-cols-2 gap-5">
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
          label="Rövid leírás (HU) — kártyákhoz, találati listához"
          name="shortDescriptionHu"
          defaultValue={values?.shortDescriptionHu ?? ""}
          rows={2}
        />
        <TextArea
          label="Rövid leírás (EN)"
          name="shortDescriptionEn"
          defaultValue={values?.shortDescriptionEn ?? ""}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <TextArea
          label="Hosszú leírás (HU) — termékoldal"
          name="descriptionHu"
          defaultValue={values?.descriptionHu ?? ""}
        />
        <TextArea
          label="Hosszú leírás (EN)"
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

      <MainImageField currentImage={values?.mainImage ?? null} />
      <GalleryImagesField currentImages={values?.images ?? []} />

      <TextArea
        label="Specifikáció (formátum: Címke: érték, soronként)"
        name="specs"
        defaultValue={specsText}
        rows={4}
      />

      <TextArea
        label="Konfigurációs opciók, extra költség nélkül (formátum: Csoport neve: Választás1, Választás2, … — pl. Héj színe: Fehér, Szürke, Fekete)"
        name="variantOptions"
        defaultValue={variantOptionsText}
        rows={3}
      />

      <TextArea
        label="Rendelhető extrák, saját árral (formátum: Név: ár, soronként — pl. Lépcső: 59990)"
        name="extras"
        defaultValue={extrasText}
        rows={3}
      />

      <Field
        label="3D/AR megtekintő link (opcionális)"
        name="threeDArUrl"
        defaultValue={values?.threeDArUrl ?? ""}
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

function MainImageField({ currentImage }: { currentImage: string | null }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">
        Főkép
      </label>
      <div className="flex items-center gap-4">
        {currentImage ? (
          <img
            src={currentImage}
            alt=""
            className="h-20 w-24 border border-line object-cover"
          />
        ) : null}
        <div className="flex-1">
          <input
            type="file"
            name="mainImageFile"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="block w-full text-sm"
          />
          {currentImage ? (
            <label className="mt-2 flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" name="clearMainImage" className="accent-accent" />
              Meglévő főkép törlése (feltöltés nélkül)
            </label>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function GalleryImagesField({ currentImages }: { currentImages: string[] }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">
        Egyéb képek (galéria)
      </label>
      {currentImages.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-3">
          {currentImages.map((src) => (
            <div key={src} className="w-24">
              <img
                src={src}
                alt=""
                className="h-20 w-24 border border-line object-cover"
              />
              <label className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                <input
                  type="checkbox"
                  name="removeGalleryImage"
                  value={src}
                  className="accent-accent"
                />
                Törlés
              </label>
            </div>
          ))}
        </div>
      ) : null}
      <input
        type="file"
        name="galleryFiles"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="block w-full text-sm"
      />
    </div>
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
  defaultValue?: string | number | null;
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
        defaultValue={defaultValue ?? ""}
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
