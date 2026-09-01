"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function ImageLightbox({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);

  const showPrev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const showNext = () => setIndex((i) => (i + 1) % images.length);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 px-6"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Bezárás"
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
          aria-label="Előző kép"
          className="absolute left-4 flex size-11 items-center justify-center text-white/80 hover:text-white max-sm:left-1"
        >
          <ChevronLeft className="size-7" />
        </button>
      ) : null}

      <img
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[85vw] object-contain"
      />

      {images.length > 1 ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            showNext();
          }}
          aria-label="Következő kép"
          className="absolute right-4 flex size-11 items-center justify-center text-white/80 hover:text-white max-sm:right-1"
        >
          <ChevronRight className="size-7" />
        </button>
      ) : null}

      {images.length > 1 ? (
        <div className="absolute bottom-5 text-sm text-white/70">
          {index + 1} / {images.length}
        </div>
      ) : null}
    </div>
  );
}
