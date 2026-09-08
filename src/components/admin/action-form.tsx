"use client";

import { useActionState, useState, type ReactNode } from "react";
import { type ActionState, initialActionState } from "@/lib/action-state";
import { ErrorModal } from "./error-modal";

/**
 * Wraps an admin create/update form so a failing server action shows the
 * shared error modal rather than bubbling up to Next's generic error page
 * (which reads as "the admin froze" — see FEJLESZTESINAPLO 2026-09-01).
 *
 * The action must return an ActionState; a successful one typically
 * redirects, so nothing is rendered for the success case.
 */
export function ActionForm({
  action,
  children,
  className,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  // Derived during render rather than copied into state by an effect:
  // dismissing remembers *which* state object was dismissed, and every
  // submission produces a fresh one — so re-submitting into the same error
  // re-opens the modal, without a cascading render.
  const [dismissed, setDismissed] = useState<ActionState | null>(null);
  const message = state === dismissed ? null : state.error;

  return (
    <>
      <form action={formAction} className={className}>
        {children}
      </form>
      <ErrorModal message={message} onClose={() => setDismissed(state)} />
    </>
  );
}
