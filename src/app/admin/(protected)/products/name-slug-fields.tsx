"use client";

import { useState } from "react";
import { Lock, LockOpen } from "lucide-react";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NameSlugFields({
  defaultNameHu = "",
  defaultSlug = "",
}: {
  defaultNameHu?: string;
  defaultSlug?: string;
}) {
  const [nameHu, setNameHu] = useState(defaultNameHu);
  const [slug, setSlug] = useState(defaultSlug);
  const [locked, setLocked] = useState(true);

  return (
    <div className="grid grid-cols-2 gap-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-muted">
          Név (HU)
        </label>
        <input
          type="text"
          name="nameHu"
          required
          value={nameHu}
          onChange={(e) => {
            setNameHu(e.target.value);
            if (locked) setSlug(slugify(e.target.value));
          }}
          className="w-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-muted">
          Slug (URL)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            name="slug"
            required
            readOnly={locked}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={`w-full border border-line px-3.5 py-2.5 text-sm outline-none ${
              locked ? "bg-paper-muted text-muted" : "focus:border-accent"
            }`}
          />
          <button
            type="button"
            onClick={() => setLocked((v) => !v)}
            aria-label={locked ? "Slug szerkesztésének feloldása" : "Slug zárolása"}
            className="flex w-11 shrink-0 items-center justify-center border border-line bg-white"
          >
            {locked ? (
              <Lock className="size-4" strokeWidth={1.8} />
            ) : (
              <LockOpen className="size-4" strokeWidth={1.8} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
