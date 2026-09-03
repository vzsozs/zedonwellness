"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { initialActionState } from "@/lib/action-state";
import { ErrorModal } from "@/components/admin/error-modal";
import { createGroup } from "./actions";

export function NewGroupForm() {
  const [state, formAction, pending] = useActionState(createGroup, initialActionState);
  const [modalOpen, setModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (state.error) setModalOpen(true);
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
      setOpen(false);
    }
    wasPending.current = pending;
  }, [state, pending]);

  return (
    <div>
      <ErrorModal
        message={modalOpen ? state.error : null}
        onClose={() => setModalOpen(false)}
      />
      {open ? (
        <form ref={formRef} action={formAction} className="flex items-end gap-2.5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Csoport neve (HU)
            </label>
            <input
              name="nameHu"
              required
              autoFocus
              className="border border-line px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Csoport neve (EN)
            </label>
            <input
              name="nameEn"
              className="border border-line px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Mentés…" : "Mentés"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-2 text-sm text-muted hover:text-ink"
          >
            Mégse
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-dark"
        >
          <Plus className="size-4" /> Új csoport (lap)
        </button>
      )}
    </div>
  );
}
