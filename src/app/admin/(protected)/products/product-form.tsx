"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import type {
  Category,
  Extra,
  Product,
  ProductSeries,
  ProductVariant,
  ProductFeatureGroup,
  ProductFeature,
} from "@/db/schema";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { ErrorModal } from "@/components/admin/error-modal";
import { NameSlugFields } from "./name-slug-fields";
import { CategorySeriesFields } from "./category-series-fields";
import { ImageGalleryField } from "./image-gallery-field";
import { SpecsEditor } from "./specs-editor";
import { VariantOptionsEditor } from "./variant-options-editor";
import { VariantSkusEditor } from "./variant-skus-editor";
import { ExtrasPicker } from "./extras-picker";
import { FeaturesPicker } from "./features-picker";
import { DocumentsEditor } from "./documents-editor";
import { RichTextField } from "./rich-text-field";
import { ToggleSwitch } from "./toggle-switch";
import { PriceField } from "./price-field";

export function ProductForm({
  categories,
  seriesList,
  allExtras,
  selectedExtraIds,
  featureGroups,
  selectedFeatureIds,
  values,
  action,
  submitLabel,
  eurHufRate,
}: {
  categories: Category[];
  seriesList: ProductSeries[];
  allExtras: Extra[];
  selectedExtraIds: number[];
  featureGroups: (ProductFeatureGroup & { features: ProductFeature[] })[];
  selectedFeatureIds: number[];
  values?: Product & { variants?: ProductVariant[] };
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  eurHufRate: number;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (state.error) setModalOpen(true);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <ErrorModal
        message={modalOpen ? state.error : null}
        onClose={() => setModalOpen(false)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main content */}
        <div className="order-2 flex min-w-0 flex-col gap-6 lg:order-1">
          <FormSection title="Alapadatok">
            <NameSlugFields defaultNameHu={values?.nameHu} defaultSlug={values?.slug} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="SKU / cikkszám" name="sku" defaultValue={values?.sku ?? ""} />
              <Field label="Név (EN)" name="nameEn" defaultValue={values?.nameEn ?? ""} />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
          </FormSection>

          <FormSection title="Állapot">
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <ToggleSwitch
                label="Készleten"
                name="inStock"
                defaultChecked={values?.inStock ?? true}
              />
              <ToggleSwitch
                label="Csak megrendelhető"
                name="orderOnly"
                defaultChecked={values?.orderOnly ?? false}
              />
              <ToggleSwitch
                label="Kiemelt termék"
                name="isFeatured"
                defaultChecked={values?.isFeatured ?? false}
              />
              <ToggleSwitch label="Újdonság" name="isNew" defaultChecked={values?.isNew ?? false} />
              <ToggleSwitch
                label="Akciós"
                name="isOnSale"
                defaultChecked={values?.isOnSale ?? false}
              />
              <ToggleSwitch
                label="Ár érdeklődésre (Hamarosan)"
                name="priceOnRequest"
                defaultChecked={values?.priceOnRequest ?? false}
              />
            </div>
          </FormSection>

          <FormSection title="Leírások">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <RichTextField
                label="Hosszú leírás (HU) — termékoldal"
                name="descriptionHu"
                defaultValue={values?.descriptionHu ?? ""}
              />
              <RichTextField
                label="Hosszú leírás (EN)"
                name="descriptionEn"
                defaultValue={values?.descriptionEn ?? ""}
              />
            </div>
          </FormSection>

          <FormSection title="Egyéb adatok">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Férőhely (fő, opcionális) — a kategória oldal szűrőjéhez"
                name="capacity"
                type="number"
                defaultValue={values?.capacity ?? ""}
              />
              <Field
                label="Súly (kg, opcionális) — a GLS szállítási díj számításához"
                name="weightKg"
                type="number"
                step="0.1"
                defaultValue={values?.weightKg ?? ""}
              />
            </div>
            <Field
              label="3D/AR megtekintő link (opcionális)"
              name="threeDArUrl"
              defaultValue={values?.threeDArUrl ?? ""}
            />
          </FormSection>

          <FormSection title="Extrák">
            <ExtrasPicker allExtras={allExtras} selectedIds={selectedExtraIds} />
          </FormSection>

          <FormSection
            title="Termék hozzávalók"
            description="Ikonos jellemzők, pl. egy szaunánál: van kályha, van lámpa."
          >
            <FeaturesPicker groups={featureGroups} selectedIds={selectedFeatureIds} />
          </FormSection>

          <FormSection title="Képek">
            <ImageGalleryField
              existingImages={values?.images ?? []}
              mainImage={values?.mainImage ?? null}
              cardImage={values?.cardImage ?? null}
            />
          </FormSection>

          <FormSection title="Dokumentumok">
            <DocumentsEditor defaultDocuments={values?.documents ?? []} />
          </FormSection>

          <FormSection title="Specifikáció">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted">
                Elhelyezés a termékoldalon
              </label>
              <select
                name="specsPosition"
                defaultValue={values?.specsPosition ?? "auto"}
                className="w-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
              >
                <option value="auto">Automatikus (grilleknél jobbra, egyébként balra)</option>
                <option value="left">Mindig balra</option>
                <option value="right">Mindig jobbra</option>
              </select>
            </div>
            <SpecsEditor defaultSpecs={values?.specs ?? []} />
          </FormSection>

          <FormSection
            title="Konfigurációs opciók"
            description="Extra költség nélküli választási lehetőségek, pl. Héj színe, Sarok elem."
          >
            <VariantOptionsEditor defaultGroups={values?.variantOptions ?? []} />
          </FormSection>

          <FormSection
            title="Termékváltozatok (SKU-k)"
            description="Saját ár/SKU/súly/kép is lehet változatonként, pl. illatok, ízek."
          >
            <VariantSkusEditor
              defaultVariants={(values?.variants ?? []).map((v) => ({
                nameHu: v.nameHu,
                nameEn: v.nameEn,
                sku: v.sku,
                priceHuf: v.priceHuf,
                weightKg: v.weightKg,
                imageUrl: v.imageUrl,
                isDefault: v.isDefault,
                inStock: v.inStock,
              }))}
            />
          </FormSection>
        </div>

        {/* Sidebar */}
        <div className="order-1 flex flex-col gap-6 lg:order-2 lg:sticky lg:top-6 lg:self-start">
          <FormSection title="Mentés">
            <button
              type="submit"
              disabled={pending}
              className="w-full bg-ink py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Mentés…" : submitLabel}
            </button>
          </FormSection>

          <FormSection title="Ár">
            <PriceField
              eurHufRate={eurHufRate}
              defaultPriceEur={values?.priceEur ?? null}
              defaultPriceHuf={values?.priceHuf ?? 0}
              defaultManual={values?.priceHufManual ?? false}
            />
          </FormSection>

          <FormSection title="Kategorizálás">
            <CategorySeriesFields
              categories={categories}
              seriesList={seriesList}
              defaultCategoryId={values?.categoryId}
              defaultSeriesId={values?.seriesId}
            />
          </FormSection>
        </div>
      </div>
    </form>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-line bg-white p-5 sm:p-6">
      <h2 className="text-xs font-bold tracking-wide text-ink uppercase">{title}</h2>
      {description ? <p className="mt-1 text-xs text-muted">{description}</p> : null}
      <div className="mt-4 flex flex-col gap-5">{children}</div>
    </section>
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
