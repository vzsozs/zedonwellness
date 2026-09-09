"use client";

import { useActionState, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import type { ProductFeature } from "@/db/schema";
import { initialActionState } from "@/lib/action-state";
import { ErrorModal } from "@/components/admin/error-modal";
import { useActionError } from "@/components/admin/use-action-error";
import { updateFeature, deleteFeature } from "./actions";
import { ActionButton } from "@/components/admin/action-button";

export function FeatureCard({ feature }: { feature: ProductFeature }) {
  const updateWithId = updateFeature.bind(null, feature.id);
  const [state, formAction, pending] = useActionState(updateWithId, initialActionState);
  const actionError = useActionError(state);
  const [priceEur, setPriceEur] = useState(feature.priceEur ?? "");


  return (
    <div className="border border-line bg-white">
      <ErrorModal
        message={actionError.message}
        onClose={actionError.dismiss}
      />
      <form action={formAction}>
        <input type="hidden" name="groupId" value={feature.groupId} />
        <label className="relative flex h-20 w-full cursor-pointer items-center justify-center overflow-hidden border-b border-line p-4">
          {feature.iconUrl ? (
            <img src={feature.iconUrl} alt="" className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted">
              <ImagePlus className="size-5" strokeWidth={1.6} />
            </div>
          )}
          <input
            type="file"
            name="iconFile"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            className="hidden"
          />
        </label>
        <div className="flex flex-col gap-2 p-3">
          <input
            name="nameHu"
            defaultValue={feature.nameHu}
            required
            placeholder="Név (HU)"
            className="w-full border border-line px-2.5 py-1.5 text-sm outline-none focus:border-accent"
          />
          <input
            name="nameEn"
            defaultValue={feature.nameEn ?? ""}
            placeholder="Név (EN)"
            className="w-full border border-line px-2.5 py-1.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="number"
            name="priceEur"
            step="0.01"
            value={priceEur}
            onChange={(e) => setPriceEur(e.target.value)}
            placeholder="Ár (EUR) — üres = alapból benne"
            className="w-full border border-line px-2.5 py-1.5 text-sm outline-none focus:border-accent"
          />
          {feature.iconUrl ? (
            <label className="flex items-center gap-2 text-[11px] text-muted">
              <input type="checkbox" name="clearIcon" className="accent-accent" />
              Ikon törlése
            </label>
          ) : null}
          <div className="mt-1 flex items-center justify-between">
            <button
              type="submit"
              disabled={pending}
              className="text-xs font-semibold text-accent hover:text-accent-dark disabled:opacity-50"
            >
              {pending ? "Mentés…" : "Mentés"}
            </button>
            <ActionButton
              action={deleteFeature.bind(null, feature.id)}
              confirmMessage={`Biztosan törlöd a(z) "${feature.nameHu}" jellemzőt?`}
              aria-label="Törlés"
              className="text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              <Trash2 className="size-4" strokeWidth={1.8} />
            </ActionButton>
          </div>
        </div>
      </form>
    </div>
  );
}
