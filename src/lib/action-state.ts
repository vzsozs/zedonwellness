export type ActionState = { error?: string };

export const initialActionState: ActionState = {};

/**
 * Next's redirect() (used at the end of a successful save) works by
 * throwing a special error the framework recognizes by this digest — a
 * server action's try/catch must let it propagate, not treat it as a
 * real failure.
 */
export function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function toActionError(error: unknown): ActionState {
  if (error instanceof Error) return { error: error.message };
  return { error: "Váratlan hiba történt. Próbáld újra." };
}
