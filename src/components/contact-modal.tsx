"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, Mail, Phone, Facebook } from "lucide-react";
import { COMPANY } from "@/lib/company";
import { useGrillThemeActive } from "@/lib/grill-theme-context";
import Image from "next/image";

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
          <Image
            src="/ZedonGrill-logo-Eng-update.svg"
            alt="ZedonGrill"
            width={280}
            height={112}
            className="mx-auto h-28 w-auto"
          />
        ) : (
          <Image
            src="/brand/zedonwellness-logo.png"
            alt="Zedonwellness"
            width={191}
            height={32}
            className="mx-auto h-8 w-auto"
          />
        )}

        <div className="mt-9">
          <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
            {t("centralHeading")}
          </div>
          <div className="mt-3.5 flex flex-col items-center gap-2 text-sm">
            <a
              href={`mailto:${isGrill ? COMPANY.grill.email : COMPANY.email}`}
              className="inline-flex items-center gap-2 hover:text-accent"
            >
              <Mail className="size-4 shrink-0" strokeWidth={1.8} />
              {isGrill ? COMPANY.grill.email : COMPANY.email}
            </a>
            <a
              href={`tel:${COMPANY.phoneHref}`}
              className="inline-flex items-center gap-2 hover:text-accent"
            >
              <Phone className="size-4 shrink-0" strokeWidth={1.8} />
              {COMPANY.phone}
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
                href={`mailto:${COMPANY.service.email}`}
                className="inline-flex items-center gap-2 hover:text-accent"
              >
                <Mail className="size-4 shrink-0" strokeWidth={1.8} />
                {COMPANY.service.email}
              </a>
              <a
                href={`tel:${COMPANY.service.phoneHref}`}
                className="inline-flex items-center gap-2 hover:text-accent"
              >
                <Phone className="size-4 shrink-0" strokeWidth={1.8} />
                {COMPANY.service.contactName} — {COMPANY.service.phone}
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
                ? COMPANY.grill.facebook
                : COMPANY.facebook
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
