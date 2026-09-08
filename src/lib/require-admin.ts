import { auth } from "@/auth";

/**
 * Guards an admin Server Action.
 *
 * The `(protected)` layout's `auth()` check only gates *page rendering* —
 * Server Actions are independent public HTTP endpoints addressed by an
 * action id, so a POST to one never passes through that layout. Every
 * exported admin action must therefore call this itself.
 *
 * Throws a plain Error so `toActionError()` turns it into the same civil
 * modal message every other action failure uses.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Nincs jogosultságod ehhez a művelethez. Jelentkezz be újra.");
  }
  return session.user;
}
