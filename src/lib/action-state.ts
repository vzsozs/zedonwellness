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

/** Postgres unique-constraint violation (e.g. a duplicate slug) — surfaced
 * by node-postgres as a plain object with `code: "23505"`, not a subclass
 * of Error, so this can't just check `error instanceof SomeDbError`. */
function isUniqueViolation(error: unknown): error is { code: string; constraint?: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23505"
  );
}

export function toActionError(error: unknown): ActionState {
  if (isUniqueViolation(error)) {
    const field = error.constraint?.includes("slug") ? "szlug" : "érték";
    return { error: `Ez a ${field} már foglalt — válassz másikat.` };
  }
  if (error instanceof Error) return { error: error.message };
  return { error: "Váratlan hiba történt. Próbáld újra." };
}
