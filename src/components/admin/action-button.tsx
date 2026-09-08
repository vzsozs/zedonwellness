"use client";

import { useState, useTransition, type ReactNode } from "react";
import type { ActionState } from "@/lib/action-state";
import { ErrorModal } from "./error-modal";

/**
 * Runs a server action that returns an ActionState (typically a delete) and
 * surfaces any failure in the shared error modal instead of letting it
 * disappear silently or crash the page.
 */
export function ActionButton({
  action,
  confirmMessage,
  children,
  className,
  "aria-label": ariaLabel,
}: {
  action: () => Promise<ActionState>;
  /** When set, a native confirm() must be accepted before the action runs. */
  confirmMessage?: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await action();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </button>
      <ErrorModal message={error} onClose={() => setError(null)} />
    </>
  );
}
