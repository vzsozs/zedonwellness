"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

export function ProductGallery({
  images,
  badge,
  fallbackGradient,
}: {
  images: string[];
  badge: string | null;
  fallbackGradient: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const hasImages = images.length > 0;

  const showPrev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const showNext = () => setActiveIndex((i) => (i + 1) % images.length);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, images.length]);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => hasImages && setLightboxOpen(true)}
        aria-label={hasImages ? "Kép nagyítása" : undefined}
        className={
          hasImages
            ? "group relative flex h-130 w-full items-center justify-center overflow-hidden bg-cover bg-center max-lg:h-80"
            : `relative flex h-130 w-full items-center justify-center overflow-hidden bg-gradient-to-br ${fallbackGradient} max-lg:h-80`
        }
        style={hasImages ? { backgroundImage: `url(${images[activeIndex]})` } : undefined}
      >
        {badge ? (
          <span className="absolute top-4 left-4 bg-ink px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-white">
            {badge}
          </span>
        ) : null}
        {hasImages ? (
          <span className="absolute right-4 bottom-4 flex size-9 items-center justify-center bg-white/90 text-ink opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomIn className="size-4.5" strokeWidth={1.8} />
          </span>
        ) : null}
      </button>

      {images.length > 1 ? (
        <div className="mt-3.5 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`${i + 1}. kép megjelenítése`}
              className={`h-20 w-25 shrink-0 overflow-hidden bg-cover bg-center ${
                i === activeIndex ? "outline outline-2 outline-coprBlue" : "opacity-70"
              }`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
      ) : null}

      {lightboxOpen && hasImages ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 px-6"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
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
            src={images[activeIndex]}
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
              {activeIndex + 1} / {images.length}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
