"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/layout/container";

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
    <section className="bg-[#cee0e9] py-22">
      <Container>
      <div className="mx-auto mb-11 max-w-[760px] text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-coprBlue/30 bg-coprBlue/10 px-4 py-1.5 text-[11.5px] font-bold tracking-[0.1em] text-coprBlue uppercase">
          {t("eyebrow")}
        </div>
        <h2 className="text-[42px] leading-tight font-bold tracking-[-0.01em] text-ink max-lg:text-3xl">
          {t("title")}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-7 max-lg:grid-cols-1">
        {VIDEOS.map((video) => (
          <div key={video.id} className="rounded-card group relative aspect-video overflow-hidden bg-ink">
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
                <Image
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={t(`${video.titleKey}.title`)}
                  fill
                  sizes="(max-width: 1024px) 50vw, 320px"
                  className="object-cover opacity-90 transition-opacity group-hover:opacity-70"
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
      </Container>
    </section>
  );
}
