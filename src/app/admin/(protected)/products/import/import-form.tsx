"use client";

import { useActionState, useEffect, useState } from "react";
import { importProductsCsv, type ImportState } from "./actions";
import { ErrorModal } from "@/components/admin/error-modal";

const initialState: ImportState = {};

export function ImportForm() {
  const [state, formAction, pending] = useActionState(importProductsCsv, initialState);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (state.error) setModalOpen(true);
  }, [state]);

  return (
    <div className="flex flex-col gap-6">
      <ErrorModal message={modalOpen ? state.error : null} onClose={() => setModalOpen(false)} />

      <form action={formAction} className="max-w-md border border-line bg-white p-6">
        <label className="mb-1.5 block text-xs font-semibold text-muted">CSV fájl</label>
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="mt-5 bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Importálás…" : "Importálás indítása"}
        </button>
      </form>

      {state.summary ? (
        <div className="border border-line bg-white p-6">
          <h2 className="mb-4 text-base font-semibold">Eredmény</h2>
          <div className="mb-5 flex gap-6 text-sm">
            <span>
              <span className="font-bold text-accent">{state.summary.created}</span> új
            </span>
            <span>
              <span className="font-bold text-accent">{state.summary.updated}</span> frissítve
            </span>
            <span>
              <span className="font-bold text-red-600">{state.summary.errors}</span> hiba
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold text-muted uppercase">
                  <th className="px-3 py-2">Sor</th>
                  <th className="px-3 py-2">Szlug</th>
                  <th className="px-3 py-2">Állapot</th>
                  <th className="px-3 py-2">Megjegyzés</th>
                </tr>
              </thead>
              <tbody>
                {state.summary.rows.map((r) => (
                  <tr key={r.row} className="border-b border-line last:border-0">
                    <td className="px-3 py-2 text-muted">{r.row}</td>
                    <td className="px-3 py-2 font-mono">{r.slug}</td>
                    <td className="px-3 py-2">
                      {r.status === "created" ? (
                        <span className="font-semibold text-accent">Új</span>
                      ) : r.status === "updated" ? (
                        <span className="font-semibold text-muted">Frissítve</span>
                      ) : (
                        <span className="font-semibold text-red-600">Hiba</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted">{r.message ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
