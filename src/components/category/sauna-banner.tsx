"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ImageLightbox } from "@/components/image-lightbox";

const GALLERY_IMAGES = [
  "/e-szauna-02.webp",
  "/e-szauna-03.webp",
  "/e-szauna-04.webp",
  "/e-szauna-05.webp",
  "/e-szauna-06.webp",
  "/e-szauna-07.webp",
];

export function SaunaBanner() {
  const t = useTranslations("category");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div className="mb-9 flex items-center gap-6 border border-line bg-[#f2f8fd] px-8 py-4 max-lg:flex-col max-lg:text-center">
      <img src="/Egyedi_szauna.svg" alt="" className="h-24 w-24 shrink-0" />
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold">{t("saunaBannerTitle")}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t("saunaBannerText")}</p>
      </div>
      <div className="flex shrink-0 gap-3.5 max-lg:justify-center">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="bg-accent px-6 py-3 text-sm font-semibold whitespace-nowrap text-white hover:bg-accent-dark"
        >
          {t("saunaBannerGallery")}
        </button>
        <Link
          href="/kapcsolat"
          className="border-[1.5px] border-ink px-6 py-3 text-sm font-semibold whitespace-nowrap hover:bg-ink hover:text-white"
        >
          {t("saunaBannerContact")}
        </Link>
      </div>

      {lightboxIndex !== null ? (
        <ImageLightbox
          images={GALLERY_IMAGES}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </div>
  );
}
