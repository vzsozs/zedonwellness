"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { initialActionState } from "@/lib/action-state";
import { ErrorModal } from "@/components/admin/error-modal";
import { createExtra } from "./actions";

export function NewExtraForm({ eurHufRate }: { eurHufRate: number }) {
  const [state, formAction, pending] = useActionState(createExtra, initialActionState);
  const [modalOpen, setModalOpen] = useState(false);
  const [priceEur, setPriceEur] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (state.error) setModalOpen(true);
    // Reset the form after a successful create (pending just turned false
    // and there's no error to show).
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
      setPriceEur("");
    }
    wasPending.current = pending;
  }, [state, pending]);

  return (
    <div className="max-w-md border border-line bg-white p-6">
      <ErrorModal
        message={modalOpen ? state.error : null}
        onClose={() => setModalOpen(false)}
      />
      <h2 className="mb-5 text-base font-semibold">Új extra</h2>
      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted">
            Kép
          </label>
          <input
            type="file"
            name="imageFile"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            className="block w-full text-sm"
          />
        </div>
        <Field label="Név (HU)" name="nameHu" required />
        <Field label="Név (EN)" name="nameEn" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Ár (EUR) — üres = alapból benne
            </label>
            <input
              type="number"
              name="priceEur"
              step="0.01"
              value={priceEur}
              onChange={(e) => setPriceEur(e.target.value)}
              className="w-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
            {priceEur ? (
              <p className="mt-1 text-xs text-muted">
                ≈ {Math.round(Number(priceEur) * eurHufRate).toLocaleString("hu-HU")} Ft
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted">Alapból benne (nincs külön ár)</p>
            )}
          </div>
          <Field label="Sorrend" name="sortOrder" type="number" defaultValue="0" />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="mt-1 w-fit bg-ink px-8 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Létrehozás…" : "Létrehozás"}
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
