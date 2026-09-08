"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

/** Catches render/data failures inside the storefront so a hiccup shows a
 * branded page with a retry instead of Next's bare error screen. */
export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPage");

  useEffect(() => {
    console.error("[storefront]", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl px-16 pt-24 pb-32 text-center max-lg:px-6">
      <h1 className="text-3xl font-bold max-lg:text-2xl">{t("title")}</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
        {t("description")}
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-muted/70">{error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-8 bg-ink px-8 py-3.5 text-sm font-semibold text-white hover:bg-accent-dark"
      >
        {t("retry")}
      </button>
    </main>
  );
}
