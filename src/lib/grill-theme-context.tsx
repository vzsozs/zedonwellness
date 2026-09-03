"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname } from "@/i18n/navigation";

const GrillThemeContext = createContext<{ setGrillActive: (v: boolean | null) => void } | null>(
  null,
);

/** Wraps the whole app; owns the `dark-theme` class on <html>. */
export function GrillThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Pages that know their own grill-ness (e.g. a product's category) call
  // useSetGrillThemeActive to override this — null falls back to the route
  // check below. No pathname-driven reset here on purpose: that raced with
  // a child's mount effect (child sets the override, then this ran right
  // after and clobbered it back to null on the very first render). Leaving
  // a stale override is safe — useSetGrillThemeActive's own cleanup already
  // resets it to null when the page that set it unmounts.
  const [override, setOverride] = useState<boolean | null>(null);

  const isGrillRoute = pathname === "/grillek" || pathname.startsWith("/grillek/");
  const isDark = override ?? isGrillRoute;

  useEffect(() => {
    document.documentElement.classList.toggle("dark-theme", isDark);
  }, [isDark]);

  const setGrillActive = useCallback((v: boolean | null) => setOverride(v), []);

  return (
    <GrillThemeContext.Provider value={{ setGrillActive }}>{children}</GrillThemeContext.Provider>
  );
}

/** Call from a page that knows whether it's grill-themed (e.g. a product's category). */
export function useSetGrillThemeActive(active: boolean) {
  const ctx = useContext(GrillThemeContext);
  useEffect(() => {
    ctx?.setGrillActive(active);
    return () => ctx?.setGrillActive(null);
  }, [ctx, active]);
}

/** Read-only: is the grill dark theme currently active? (e.g. for the header logo) */
export function useGrillThemeActive() {
  const pathname = usePathname();
  const [active, setActive] = useState(
    pathname === "/grillek" || pathname.startsWith("/grillek/"),
  );

  useEffect(() => {
    const check = () => setActive(document.documentElement.classList.contains("dark-theme"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return active;
}
