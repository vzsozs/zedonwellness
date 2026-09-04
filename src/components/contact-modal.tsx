"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, Mail, Phone, Facebook } from "lucide-react";
import { useGrillThemeActive } from "@/lib/grill-theme-context";

export function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("contactModal");
  const isGrill = useGrillThemeActive();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white p-10 text-center max-lg:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute top-4 right-4 text-muted hover:text-ink"
        >
          <X className="size-5" strokeWidth={1.8} />
        </button>

        {isGrill ? (
          <img
            src="/ZedonGrill-logo-Eng-update.svg"
            alt="ZedonGrill"
            className="mx-auto h-28 w-auto"
          />
        ) : (
          <img
            src="/brand/zedonwellness-logo.png"
            alt="Zedonwellness"
            className="mx-auto h-8 w-auto"
          />
        )}

        <div className="mt-9">
          <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
            {t("centralHeading")}
          </div>
          <div className="mt-3.5 flex flex-col items-center gap-2 text-sm">
            <a
              href={`mailto:${isGrill ? "sales@zedongrill.com" : "info@zedonwellness.com"}`}
              className="inline-flex items-center gap-2 hover:text-accent"
            >
              <Mail className="size-4 shrink-0" strokeWidth={1.8} />
              {isGrill ? "sales@zedongrill.com" : "info@zedonwellness.com"}
            </a>
            <a
              href="tel:+36309513808"
              className="inline-flex items-center gap-2 hover:text-accent"
            >
              <Phone className="size-4 shrink-0" strokeWidth={1.8} />
              +36 30 951 3808
            </a>
          </div>
        </div>

        {isGrill ? null : (
          <div className="mt-8 border-t border-line pt-8">
            <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
              {t("serviceHeading")}
            </div>
            <div className="mt-3.5 flex flex-col items-center gap-2 text-sm">
              <a
                href="mailto:szerviz@zedonwellness.com"
                className="inline-flex items-center gap-2 hover:text-accent"
              >
                <Mail className="size-4 shrink-0" strokeWidth={1.8} />
                szerviz@zedonwellness.com
              </a>
              <a
                href="tel:+36709449442"
                className="inline-flex items-center gap-2 hover:text-accent"
              >
                <Phone className="size-4 shrink-0" strokeWidth={1.8} />
                Kiss György — +36 70 944 9442
              </a>
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-line pt-8">
          <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
            {t("followUs")}
          </div>
          <a
            href={
              isGrill
                ? "https://www.facebook.com/profile.php?id=100085312058058"
                : "https://www.facebook.com/zedonwellness/"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3.5 inline-flex items-center gap-2 border-[1.5px] border-ink px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-white"
          >
            <Facebook className="size-4" strokeWidth={1.8} />
            Facebook
          </a>
        </div>
      </div>
    </div>
  );
}
