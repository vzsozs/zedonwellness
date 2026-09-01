"use client";

import { useState } from "react";
import { ImageLightbox } from "./image-lightbox";

export function VariantOptionGroup({
  group,
}: {
  group: {
    nameHu: string;
    choices: { nameHu: string; imageUrl: string | null }[];
  };
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const images = group.choices
    .map((c) => c.imageUrl)
    .filter((u): u is string => Boolean(u));

  let imagePosition = -1;

  return (
    <div>
      <h2 className="mb-3 text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
        {group.nameHu}
      </h2>
      <div className="flex flex-wrap gap-3">
        {group.choices.map((choice, i) => {
          const hasImage = Boolean(choice.imageUrl);
          if (hasImage) imagePosition += 1;
          const thisPosition = imagePosition;
          return (
            <div key={`${choice.nameHu}-${i}`} className="w-22">
              {hasImage ? (
                <button
                  type="button"
                  onClick={() => setOpenIndex(thisPosition)}
                  aria-label={`${choice.nameHu} nagyítása`}
                  className="h-20 w-22 overflow-hidden border border-line hover:border-ink"
                >
                  <img
                    src={choice.imageUrl!}
                    alt={choice.nameHu}
                    className="h-full w-full object-cover"
                  />
                </button>
              ) : (
                <div className="h-20 w-22 border border-line bg-paper-muted" />
              )}
              <div className="mt-1 text-center text-[11px] text-muted">
                {choice.nameHu}
              </div>
            </div>
          );
        })}
      </div>

      {openIndex !== null ? (
        <ImageLightbox
          images={images}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      ) : null}
    </div>
  );
}
