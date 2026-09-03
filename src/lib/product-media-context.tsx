"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type MediaContextValue = {
  variantImage: string | null;
  setVariantImage: (url: string | null) => void;
};

const MediaContext = createContext<MediaContextValue | null>(null);

/** Wraps a product page's gallery + actions so picking a SKU variant with
 * its own photo can swap the main gallery image. */
export function ProductMediaProvider({ children }: { children: ReactNode }) {
  const [variantImage, setVariantImage] = useState<string | null>(null);
  return (
    <MediaContext.Provider value={{ variantImage, setVariantImage }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useProductMedia() {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error("useProductMedia must be used within a ProductMediaProvider");
  return ctx;
}
