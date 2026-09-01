"use client";

import { AlertTriangle, X } from "lucide-react";

export function ErrorModal({
  message,
  onClose,
}: {
  message: string | null | undefined;
  onClose: () => void;
}) {
  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center bg-red-50 text-red-600">
            <AlertTriangle className="size-5" strokeWidth={1.8} />
          </div>
          <div className="flex-1 pt-1">
            <div className="text-sm font-semibold text-ink">Hiba történt</div>
            <p className="mt-1.5 text-sm text-muted">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Bezárás"
            className="text-muted hover:text-ink"
          >
            <X className="size-4.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full bg-ink py-2.5 text-sm font-semibold text-white"
        >
          Rendben
        </button>
      </div>
    </div>
  );
}
