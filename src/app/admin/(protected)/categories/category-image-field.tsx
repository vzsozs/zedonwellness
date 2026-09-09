"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";

/**
 * Dedicated hero photo for a category's homepage card.
 *
 * Without one the card falls back to the most expensive product's photo,
 * which means adding a new flagship product silently redraws the homepage.
 */
export function CategoryImageField({ current }: { current: string | null }) {
  const [preview, setPreview] = useState<string | null>(current);
  const [cleared, setCleared] = useState(false);

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">
        Kategória fotó (a főoldali kártyán jelenik meg)
      </label>
      <div className="flex items-center gap-4">
        <label className="relative flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden border border-line bg-paper-muted">
          {preview ? (
            // Local object URL while picking, so next/image can't handle it.
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="size-5 text-muted" strokeWidth={1.6} />
          )}
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPreview(URL.createObjectURL(file));
                setCleared(false);
              }
            }}
          />
        </label>
        <div className="flex flex-col gap-2 text-xs text-muted">
          <span>JPG, PNG, WEBP, AVIF vagy SVG — legfeljebb 8 MB.</span>
          {preview ? (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="clearImage"
                checked={cleared}
                onChange={(e) => setCleared(e.target.checked)}
                className="accent-accent"
              />
              Fotó eltávolítása mentéskor
            </label>
          ) : null}
        </div>
      </div>
    </div>
  );
}
