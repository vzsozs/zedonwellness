import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";

/** Shared shell for the legal pages (Impresszum / ÁSZF / Adatvédelem) so
 * they read as one document family instead of three one-off layouts. */
export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt?: string;
  children: ReactNode;
}) {
  return (
    <Container as="main" width="prose" className="pt-16 pb-25">
      <h1 className="text-4xl font-bold max-lg:text-3xl">{title}</h1>
      {updatedAt ? (
        <p className="mt-2 text-xs text-muted">Utolsó frissítés: {updatedAt}</p>
      ) : null}
      <div className="legal-content mt-10">{children}</div>
    </Container>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

/**
 * Marks a value the shop owner still has to supply (company registration
 * number, tax number, hosting provider…). Rendered visibly rather than left
 * blank so an unfinished legal page can't quietly ship looking complete.
 */
export function Todo({ children }: { children: ReactNode }) {
  return (
    <mark className="bg-amber-100 px-1.5 py-0.5 text-amber-900">
      {children}
    </mark>
  );
}
