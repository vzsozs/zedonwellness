"use client";

import { useState } from "react";
import { ImageLightbox } from "./image-lightbox";
import { localized } from "@/lib/localized";

export function VariantOptionGroup({
  group,
  locale,
}: {
  group: {
    nameHu: string;
    nameEn: string;
    choices: { nameHu: string; nameEn: string; imageUrl: string | null }[];
  };
  locale: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const images = group.choices
    .map((c) => c.imageUrl)
    .filter((u): u is string => Boolean(u));

  let imagePosition = -1;
  const groupName = localized(locale, group.nameHu, group.nameEn);

  return (
    <div>
      <h2 className="mb-3 text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
        {groupName}
      </h2>
      <div className="flex flex-wrap gap-3">
        {group.choices.map((choice, i) => {
          const hasImage = Boolean(choice.imageUrl);
          if (hasImage) imagePosition += 1;
          const thisPosition = imagePosition;
          const choiceName = localized(locale, choice.nameHu, choice.nameEn);
          return (
            <div key={`${choice.nameHu}-${i}`} className="w-22">
              {hasImage ? (
                <button
                  type="button"
                  onClick={() => setOpenIndex(thisPosition)}
                  aria-label={choiceName}
                  className="h-20 w-22 overflow-hidden border border-line hover:border-ink"
                >
                  <img
                    src={choice.imageUrl!}
                    alt={choiceName}
                    className="h-full w-full object-cover"
                  />
                </button>
              ) : (
                <div className="h-20 w-22 border border-line bg-paper-muted" />
              )}
              <div className="mt-1 text-center text-[11px] text-muted">
                {choiceName}
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
