import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";

/**
 * A bcrypt hash of a value nobody can log in with, compared against when the
 * e-mail doesn't exist. Without it, a missing user returned immediately while
 * an existing one paid the ~100ms bcrypt cost — a timing difference that
 * reveals which e-mail addresses are real admin accounts.
 */
const DUMMY_HASH_PROMISE = hash("not-a-real-password", 10);

/**
 * In-memory throttle for failed logins.
 *
 * The admin login had no rate limiting at all, so an unattended credential
 * stuffing run was free. Per-process and reset on restart, which is fine for
 * a single-container deployment; if this ever runs on more than one instance,
 * move the counter to Postgres or Redis.
 */
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; firstAt: number }>();

function isLockedOut(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string): void {
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: Date.now() });
    return;
  }
  entry.count += 1;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = (credentials?.email as string | undefined)?.toLowerCase().trim();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        if (isLockedOut(email)) return null;

        const user = await db.query.adminUsers.findFirst({
          where: eq(adminUsers.email, email),
        });

        // Always run a comparison, even with no matching user, so the
        // response time doesn't distinguish the two cases.
        const valid = await compare(password, user?.passwordHash ?? (await DUMMY_HASH_PROMISE));

        if (!user || !valid) {
          recordFailure(email);
          return null;
        }

        attempts.delete(email);
        return { id: String(user.id), email: user.email, name: user.name };
      },
    }),
  ],
});
