"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "@/i18n/navigation";

/** How long the theme cross-fade runs — must match the CSS below. */
const THEME_TRANSITION_MS = 2000;

const GrillThemeContext = createContext<{
  isDark: boolean;
  setGrillActive: (v: boolean | null) => void;
} | null>(null);

export function isGrillPath(pathname: string): boolean {
  return pathname === "/grillek" || pathname.startsWith("/grillek/");
}

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

  const isDark = override ?? isGrillPath(pathname);
  const previous = useRef<boolean | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const alreadyDark = root.classList.contains("dark-theme");

    // First run after hydration: the inline script in the document (see
    // ThemeScript / GrillTheme) has usually already applied the right
    // class, so re-applying it must not look like a change. Only an actual
    // switch — clicking from a grill page to a wellness one — animates.
    const changed = previous.current === null ? alreadyDark !== isDark : previous.current !== isDark;
    previous.current = isDark;
    if (!changed) {
      root.classList.toggle("dark-theme", isDark);
      return;
    }

    // The long cross-fade is opt-in per switch rather than a permanent rule
    // on every themed utility class — as a global rule it also slowed every
    // ordinary hover on the site to two seconds.
    root.classList.add("theme-transition");
    root.classList.toggle("dark-theme", isDark);
    const timer = setTimeout(
      () => root.classList.remove("theme-transition"),
      THEME_TRANSITION_MS,
    );
    return () => clearTimeout(timer);
  }, [isDark]);

  const setGrillActive = useCallback((v: boolean | null) => setOverride(v), []);

  return (
    <GrillThemeContext.Provider value={{ isDark, setGrillActive }}>
      {children}
    </GrillThemeContext.Provider>
  );
}

/** Call from a page that knows whether it's grill-themed (e.g. a product's category). */
export function useSetGrillThemeActive(active: boolean) {
  const ctx = useContext(GrillThemeContext);
  const setGrillActive = ctx?.setGrillActive;
  useEffect(() => {
    setGrillActive?.(active);
    return () => setGrillActive?.(null);
  }, [setGrillActive, active]);
}

/**
 * Read-only: is the grill dark theme currently active? (e.g. for the header
 * logo cross-fade.)
 *
 * Reads straight from context now. It used to watch <html> with a
 * MutationObserver, which meant the header lagged a frame behind the theme
 * it was supposed to be showing.
 */
export function useGrillThemeActive() {
  return useContext(GrillThemeContext)?.isDark ?? false;
}
