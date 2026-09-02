"use client";

import { useState } from "react";
import { ZoomIn } from "lucide-react";
import { ImageLightbox } from "./image-lightbox";

export function ProductGallery({
  images,
  badge,
  fallbackGradient,
}: {
  images: string[];
  badge: string | null;
  fallbackGradient: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const hasImages = images.length > 0;
  const mainImage = images[0];

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => hasImages && setLightboxIndex(0)}
        aria-label={hasImages ? "Kép nagyítása" : undefined}
        className={
          hasImages
            ? "group relative flex h-130 w-full items-center justify-center overflow-hidden max-lg:h-80"
            : `relative flex h-130 w-full items-center justify-center overflow-hidden bg-gradient-to-br ${fallbackGradient} max-lg:h-80`
        }
      >
        {badge ? (
          <span className="absolute top-4 left-4 z-10 bg-ink px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-white">
            {badge}
          </span>
        ) : null}
        {hasImages ? (
          <>
            <img
              src={mainImage}
              alt=""
              className="h-full w-full object-contain"
            />
            <span className="absolute right-4 bottom-4 flex size-9 items-center justify-center bg-white/90 text-ink opacity-0 transition-opacity group-hover:opacity-100">
              <ZoomIn className="size-4.5" strokeWidth={1.8} />
            </span>
          </>
        ) : null}
      </button>

      {images.length > 1 ? (
        <div className="mt-3.5 flex flex-wrap gap-3">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setLightboxIndex(i)}
              aria-label={`${i + 1}. kép nagyítása`}
              className="h-20 w-25 shrink-0 overflow-hidden bg-cover bg-center opacity-80 hover:opacity-100"
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
      ) : null}

      {lightboxIndex !== null && hasImages ? (
        <ImageLightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </div>
  );
}
