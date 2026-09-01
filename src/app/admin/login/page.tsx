import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, auth } from "@/auth";

async function login(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      redirect("/admin/login?error=1");
    }
    throw err;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/admin");

  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white p-8 shadow-sm">
        <img
          src="/brand/zedonwellness-logo.png"
          alt="Zedonwellness"
          className="mb-8 h-7 w-auto"
        />
        <h1 className="mb-6 text-xl font-semibold">Admin bejelentkezés</h1>

        {error ? (
          <div className="mb-5 border-l-[3px] border-red-500 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            Hibás e-mail cím vagy jelszó.
          </div>
        ) : null}

        <form action={login} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Jelszó
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="mt-2 bg-ink py-3 text-sm font-semibold text-white"
          >
            Bejelentkezés
          </button>
        </form>
      </div>
    </div>
  );
}
