"use client";

import { useActionState, useEffect, useState } from "react";
import type { Category, Extra, Product, ProductSeries } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { ErrorModal } from "@/components/admin/error-modal";
import { NameSlugFields } from "./name-slug-fields";
import { CategorySeriesFields } from "./category-series-fields";
import { ImageGalleryField } from "./image-gallery-field";
import { SpecsEditor } from "./specs-editor";
import { VariantOptionsEditor } from "./variant-options-editor";
import { ExtrasPicker } from "./extras-picker";

export function ProductForm({
  categories,
  seriesList,
  allExtras,
  selectedExtraIds,
  values,
  action,
  submitLabel,
}: {
  categories: Category[];
  seriesList: ProductSeries[];
  allExtras: Extra[];
  selectedExtraIds: number[];
  values?: Product;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (state.error) setModalOpen(true);
  }, [state]);

  return (
    <form action={formAction} className="flex max-w-4xl flex-col gap-6">
      <ErrorModal
        message={modalOpen ? state.error : null}
        onClose={() => setModalOpen(false)}
      />
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

      <ImageGalleryField
        existingImages={values?.images ?? []}
        mainImage={values?.mainImage ?? null}
      />

      <SpecsEditor defaultSpecs={values?.specs ?? []} />

      <VariantOptionsEditor defaultGroups={values?.variantOptions ?? []} />

      <ExtrasPicker allExtras={allExtras} selectedIds={selectedExtraIds} />

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
        disabled={pending}
        className="mt-2 w-fit bg-ink px-8 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Mentés…" : submitLabel}
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
