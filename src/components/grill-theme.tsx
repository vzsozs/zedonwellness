"use client";

import { useSetGrillThemeActive } from "@/lib/grill-theme-context";

/** Renders nothing — just declares that the current page is (or isn't) grill-themed. */
export function GrillTheme({ active }: { active: boolean }) {
  useSetGrillThemeActive(active);
  return null;
}
