"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SafeImage } from "@/components/safe-image";

export function ImageLightbox({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const t = useTranslations("common");
  const [index, setIndex] = useState(startIndex);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Where focus was before the dialog opened, so it can be handed back.
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const showPrev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const showNext = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );

  // Move focus into the dialog, keep it there while open, and restore it on
  // close — a modal that leaves focus behind it is unusable by keyboard.
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => previouslyFocused.current?.focus();
  }, []);

  // The page behind a full-screen overlay must not scroll.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "Tab") {
        // Focus trap: cycle through the dialog's own controls only.
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, showPrev, showNext]);

  if (images.length === 0) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("imageViewer")}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 px-6"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={t("close")}
        className="absolute top-5 right-5 flex size-10 items-center justify-center text-white/80 hover:text-white"
      >
        <X className="size-6" />
      </button>

      {images.length > 1 ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            showPrev();
          }}
          aria-label={t("previousImage")}
          className="absolute left-4 flex size-11 items-center justify-center text-white/80 hover:text-white max-sm:left-1"
        >
          <ChevronLeft className="size-7" />
        </button>
      ) : null}

      <SafeImage
        src={images[index]}
        alt=""
        width={1600}
        height={1200}
        sizes="85vw"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-auto max-w-[85vw] object-contain"
      />

      {images.length > 1 ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            showNext();
          }}
          aria-label={t("nextImage")}
          className="absolute right-4 flex size-11 items-center justify-center text-white/80 hover:text-white max-sm:right-1"
        >
          <ChevronRight className="size-7" />
        </button>
      ) : null}

      {images.length > 1 ? (
        <div aria-live="polite" className="absolute bottom-5 text-sm text-white/70">
          {index + 1} / {images.length}
        </div>
      ) : null}
    </div>
  );
}
