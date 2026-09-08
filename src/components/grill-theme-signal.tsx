"use client";

import { useSetGrillThemeActive } from "@/lib/grill-theme-context";

/** Renders nothing — mirrors the server's grill-theme decision into React
 * state so the header logo and client-side navigation follow it. */
export function GrillThemeSignal({ active }: { active: boolean }) {
  useSetGrillThemeActive(active);
  return null;
}
