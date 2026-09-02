"use client";

import { useActionState, useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import type { Extra } from "@/db/schema";
import { initialActionState } from "@/lib/action-state";
import { ErrorModal } from "@/components/admin/error-modal";
import { updateExtra, deleteExtra } from "./actions";

export function ExtraCard({ extra, eurHufRate }: { extra: Extra; eurHufRate: number }) {
  const updateWithId = updateExtra.bind(null, extra.id);
  const [state, formAction, pending] = useActionState(updateWithId, initialActionState);
  const [modalOpen, setModalOpen] = useState(false);
  const [priceEur, setPriceEur] = useState(extra.priceEur ?? "");

  useEffect(() => {
    if (state.error) setModalOpen(true);
  }, [state]);

  return (
    <div className="border border-line bg-white">
      <ErrorModal
        message={modalOpen ? state.error : null}
        onClose={() => setModalOpen(false)}
      />
      <form action={formAction}>
        <label className="relative flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden border-b border-line p-5">
          {extra.imageUrl ? (
            <img src={extra.imageUrl} alt="" className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-32 w-full items-center justify-center text-muted">
              <ImagePlus className="size-6" strokeWidth={1.6} />
            </div>
          )}
          <input
            type="file"
            name="imageFile"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            className="hidden"
          />
        </label>
        <div className="flex flex-col gap-2.5 p-4">
          <input
            name="nameHu"
            defaultValue={extra.nameHu}
            required
            placeholder="Név (HU)"
            className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="nameEn"
            defaultValue={extra.nameEn ?? ""}
            placeholder="Név (EN)"
            className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <div className="flex gap-2.5">
            <div className="w-full">
              <input
                type="number"
                name="priceEur"
                step="0.01"
                value={priceEur}
                onChange={(e) => setPriceEur(e.target.value)}
                required
                placeholder="Ár (EUR)"
                className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-accent"
              />
              {priceEur ? (
                <p className="mt-1 text-[11px] text-muted">
                  ≈ {Math.round(Number(priceEur) * eurHufRate).toLocaleString("hu-HU")} Ft
                </p>
              ) : null}
            </div>
            <input
              type="number"
              name="sortOrder"
              defaultValue={extra.sortOrder}
              placeholder="Sorrend"
              className="h-9 w-20 shrink-0 border border-line px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          {extra.imageUrl ? (
            <label className="flex items-center gap-2 text-[11px] text-muted">
              <input type="checkbox" name="clearImage" className="accent-accent" />
              Kép törlése
            </label>
          ) : null}
          <div className="mt-1 flex items-center justify-between">
            <button
              type="submit"
              disabled={pending}
              className="text-sm font-semibold text-accent hover:text-accent-dark disabled:opacity-50"
            >
              {pending ? "Mentés…" : "Mentés"}
            </button>
            <button
              type="button"
              onClick={() => deleteExtra(extra.id)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Törlés
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
