"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for failures in the root layout itself (where the
 * locale error.tsx can't render, since its layout is what broke). Must ship
 * its own <html>/<body> and can't rely on next-intl, so the copy is inline.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global]", error);
  }, [error]);

  return (
    <html lang="hu">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          background: "#ebf6ff",
          color: "#17201e",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, margin: "0 0 12px" }}>Váratlan hiba történt</h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#63706d", margin: 0 }}>
            Az oldal betöltése közben hiba lépett fel. Próbáld újra, vagy térj vissza
            később.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              background: "#17201e",
              color: "#fff",
              border: 0,
              padding: "14px 32px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Újrapróbálkozás
          </button>
        </div>
      </body>
    </html>
  );
}
