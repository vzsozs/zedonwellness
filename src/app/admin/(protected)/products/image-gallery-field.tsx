"use client";

import { useEffect, useRef, useState } from "react";
import { Star, X, ChevronUp, ChevronDown, ImagePlus } from "lucide-react";

type Slot =
  | { key: string; type: "existing"; url: string }
  | { key: string; type: "new"; fileIndex: number; previewUrl: string };

let keySeq = 0;
const nextKey = () => `slot-${++keySeq}`;

export function ImageGalleryField({
  existingImages,
  mainImage,
}: {
  existingImages: string[];
  mainImage: string | null;
}) {
  const [slots, setSlots] = useState<Slot[]>(() =>
    existingImages.map((url) => ({ key: nextKey(), type: "existing", url })),
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [mainKey, setMainKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve initial main key against the initial slots (runs once).
  useEffect(() => {
    if (mainKey !== null) return;
    const idx = existingImages.findIndex((u) => u === mainImage);
    if (idx >= 0 && slots[idx]) setMainKey(slots[idx].key);
    else if (slots.length > 0) setMainKey(slots[0].key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the real file input's FileList in sync with `newFiles`, so the
  // form submits exactly the files still present after removals — order
  // matches `newFiles`, which `slots[].fileIndex` refers to.
  useEffect(() => {
    if (!fileInputRef.current) return;
    const dt = new DataTransfer();
    newFiles.forEach((f) => dt.items.add(f));
    fileInputRef.current.files = dt.files;
  }, [newFiles]);

  function addFiles(fileList: FileList) {
    const added = Array.from(fileList);
    setNewFiles((prev) => {
      const startIndex = prev.length;
      setSlots((s) => [
        ...s,
        ...added.map((f, i) => ({
          key: nextKey(),
          type: "new" as const,
          fileIndex: startIndex + i,
          previewUrl: URL.createObjectURL(f),
        })),
      ]);
      return [...prev, ...added];
    });
  }

  function removeSlot(key: string) {
    setSlots((s) => {
      const removed = s.find((x) => x.key === key);
      const rest = s.filter((x) => x.key !== key);
      if (removed?.type === "new") {
        setNewFiles((files) => files.filter((_, i) => i !== removed.fileIndex));
        // Shift fileIndex of remaining "new" slots down past the removed one.
        return rest.map((x) =>
          x.type === "new" && x.fileIndex > removed.fileIndex
            ? { ...x, fileIndex: x.fileIndex - 1 }
            : x,
        );
      }
      return rest;
    });
    setMainKey((mk) => (mk === key ? null : mk));
  }

  function move(key: string, dir: -1 | 1) {
    setSlots((s) => {
      const i = s.findIndex((x) => x.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= s.length) return s;
      const next = [...s];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  // Fall back to the first slot as main if nothing is marked (e.g. after
  // removing the marked one).
  const effectiveMainKey = mainKey ?? slots[0]?.key ?? null;

  const orderPayload = JSON.stringify(
    slots.map((s) =>
      s.type === "existing"
        ? { key: s.key, type: "existing", url: s.url }
        : { key: s.key, type: "new", fileIndex: s.fileIndex },
    ),
  );

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">
        Képek
      </label>
      <p className="mb-3 text-xs text-muted">
        A csillaggal jelöld ki a főképet, a nyilakkal állítsd a sorrendet.
      </p>

      <input type="hidden" name="imageOrder" value={orderPayload} />
      <input type="hidden" name="mainImageKey" value={effectiveMainKey ?? ""} />

      {slots.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-3">
          {slots.map((slot, i) => {
            const src = slot.type === "existing" ? slot.url : slot.previewUrl;
            const isMain = slot.key === effectiveMainKey;
            return (
              <div key={slot.key} className="w-28">
                <div className="relative">
                  <img
                    src={src}
                    alt=""
                    className={`h-24 w-28 border object-cover ${
                      isMain ? "border-2 border-coprBlue" : "border-line"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setMainKey(slot.key)}
                    aria-label="Kijelölés főképnek"
                    className="absolute top-1 left-1 flex size-6 items-center justify-center bg-white/90"
                  >
                    <Star
                      className={`size-3.5 ${isMain ? "fill-coprBlue text-coprBlue" : "text-muted"}`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSlot(slot.key)}
                    aria-label="Kép törlése"
                    className="absolute top-1 right-1 flex size-6 items-center justify-center bg-white/90 text-muted hover:text-red-600"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <div className="mt-1 flex justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(slot.key, -1)}
                    disabled={i === 0}
                    aria-label="Balra/feljebb"
                    className="flex size-6 items-center justify-center border border-line disabled:opacity-30"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(slot.key, 1)}
                    disabled={i === slots.length - 1}
                    aria-label="Jobbra/lejjebb"
                    className="flex size-6 items-center justify-center border border-line disabled:opacity-30"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>
                {isMain ? (
                  <div className="mt-0.5 text-center text-[10px] font-semibold text-coprBlue">
                    Főkép
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <label className="flex h-24 w-28 cursor-pointer flex-col items-center justify-center gap-1.5 border border-dashed border-line text-muted hover:border-ink hover:text-ink">
        <ImagePlus className="size-5" strokeWidth={1.6} />
        <span className="text-[11px] font-medium">Kép hozzáadása</span>
        <input
          ref={fileInputRef}
          type="file"
          name="galleryFiles"
          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              addFiles(e.target.files);
            }
          }}
        />
      </label>
    </div>
  );
}
