"use client";

import { useState, useTransition } from "react";
import { HardDrive, Trash2 } from "lucide-react";
import { ErrorModal } from "@/components/admin/error-modal";
import { removeOrphanUploads, scanOrphanUploads, type OrphanScanState } from "./actions";

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function OrphanUploads() {
  const [state, setState] = useState<OrphanScanState>({});
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<OrphanScanState>) {
    start(async () => {
      const result = await fn();
      if (result.error) setError(result.error);
      else setState(result);
    });
  }

  const orphans = state.orphans ?? [];
  const totalBytes = orphans.reduce((sum, o) => sum + o.sizeBytes, 0);

  return (
    <div className="max-w-2xl border border-line bg-white p-6">
      <ErrorModal message={error} onClose={() => setError(null)} />
      <h2 className="mb-2 flex items-center gap-2 text-base font-semibold">
        <HardDrive className="size-4.5" strokeWidth={1.8} />
        Árva feltöltött fájlok
      </h2>
      <p className="mb-5 text-sm text-muted">
        Feltöltéskor a fájlok a lemezre kerülnek, de kép cseréjekor vagy termék
        törlésekor a régi fájl ott marad. Itt kilistázhatod azokat, amikre már
        semmi nem hivatkozik az adatbázisban, és egy lépésben törölheted őket.
      </p>

      <button
        type="button"
        onClick={() => run(scanOrphanUploads)}
        disabled={pending}
        className="border border-line px-4 py-2 text-sm font-semibold hover:border-ink disabled:opacity-50"
      >
        {pending ? "Vizsgálat…" : "Ellenőrzés futtatása"}
      </button>

      {state.deleted ? (
        <p className="mt-4 text-sm text-accent">
          {state.deleted.deleted} fájl törölve, {formatSize(state.deleted.freedBytes)} felszabadítva.
        </p>
      ) : null}

      {state.scanned ? (
        orphans.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Nincs árva fájl — minden feltöltés használatban van.</p>
        ) : (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold">
                {orphans.length} árva fájl · {formatSize(totalBytes)}
              </p>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!window.confirm(`Biztosan törlöd ezt a(z) ${orphans.length} fájlt? Nem vonható vissza.`)) return;
                  run(() => removeOrphanUploads(orphans.map((o) => o.url)));
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                <Trash2 className="size-4" strokeWidth={1.8} />
                Összes törlése
              </button>
            </div>
            <ul className="max-h-72 overflow-y-auto border border-line">
              {orphans.map((o) => (
                <li
                  key={o.url}
                  className="flex items-center justify-between gap-4 border-b border-line px-3.5 py-2 text-xs last:border-0"
                >
                  <span className="truncate font-mono text-muted">{o.url}</span>
                  <span className="shrink-0 text-muted">{formatSize(o.sizeBytes)}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      ) : null}
    </div>
  );
}
