"use client";

import { useState } from "react";
import type { ActionState } from "@/lib/action-state";

/**
 * Turns a server action's state into a dismissible error message for
 * <ErrorModal>.
 *
 * Derived during render instead of copied into state by an effect (which
 * causes a cascading re-render, and is what React's
 * `react-hooks/set-state-in-effect` rule flags). Dismissal remembers *which*
 * state object was dismissed; every submission returns a fresh object, so
 * submitting into the same error again re-opens the modal.
 */
export function useActionError<T extends ActionState>(state: T) {
  const [dismissed, setDismissed] = useState<T | null>(null);
  return {
    message: state === dismissed ? null : (state.error ?? null),
    dismiss: () => setDismissed(state),
  };
}
