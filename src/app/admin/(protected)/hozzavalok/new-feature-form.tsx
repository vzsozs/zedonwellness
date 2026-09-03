"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { initialActionState } from "@/lib/action-state";
import { ErrorModal } from "@/components/admin/error-modal";
import { createFeature } from "./actions";

export function NewFeatureForm({ groupId }: { groupId: number }) {
  const [state, formAction, pending] = useActionState(createFeature, initialActionState);
  const [modalOpen, setModalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (state.error) setModalOpen(true);
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [state, pending]);

  return (
    <div className="max-w-sm border border-line bg-white p-5">
      <ErrorModal
        message={modalOpen ? state.error : null}
        onClose={() => setModalOpen(false)}
      />
      <h3 className="mb-4 text-sm font-semibold">Új jellemző</h3>
      <form ref={formRef} action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="groupId" value={groupId} />
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">Ikon</label>
          <input
            type="file"
            name="iconFile"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            className="block w-full text-sm"
          />
        </div>
        <input
          name="nameHu"
          required
          placeholder="Név (HU)"
          className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <input
          name="nameEn"
          placeholder="Név (EN)"
          className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <input
          type="number"
          name="priceEur"
          step="0.01"
          placeholder="Ár (EUR) — üres = alapból benne"
          className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="mt-1 w-fit bg-ink px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Létrehozás…" : "Létrehozás"}
        </button>
      </form>
    </div>
  );
}
