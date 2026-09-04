"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";

const VIDEOS = [
  { id: "ubkWMKEfyNE", titleKey: "massage" },
  { id: "U2qD7P67IfI", titleKey: "construktiva" },
  { id: "qJYfn9L6F6o", titleKey: "quality" },
  { id: "Ax7fBkZygp0", titleKey: "hungexpo" },
] as const;

export function VideoSection() {
  const t = useTranslations("home.videos");
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <section className="bg-[#cee0e9] px-16 py-22 max-lg:px-6">
      <div className="mb-11 text-center">
        <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
          {t("eyebrow")}
        </div>
        <h2 className="mt-3.5 text-4xl font-bold">{t("title")}</h2>
      </div>
      <div className="mx-auto grid w-4/5 grid-cols-2 gap-7 max-lg:w-full max-lg:grid-cols-1">
        {VIDEOS.map((video) => (
          <div key={video.id} className="group relative aspect-video overflow-hidden bg-ink">
            {playingId === video.id ? (
              <iframe
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                title={t(`${video.titleKey}.title`)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlayingId(video.id)}
                className="relative block h-full w-full cursor-pointer"
              >
                <img
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={t(`${video.titleKey}.title`)}
                  className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-70"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-16 items-center justify-center rounded-full bg-white/90 transition-transform group-hover:scale-110">
                    <Play className="size-6 translate-x-0.5 text-accent" fill="currentColor" />
                  </span>
                </span>
                <span className="absolute right-5 bottom-5 left-5 text-left text-lg font-bold text-white">
                  {t(`${video.titleKey}.title`)}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
