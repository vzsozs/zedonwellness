import { GrillThemeSignal } from "./grill-theme-signal";

/**
 * Declares that the current page is (or isn't) grill-themed.
 *
 * Two halves, on purpose:
 *
 * 1. An inline script that toggles the class on <html> *while the document
 *    is still parsing*, before the first paint. Without it the page painted
 *    light and only flipped to dark after hydration — a visible white flash,
 *    made worse by the theme's two-second cross-fade. The server already
 *    knows the answer here (it looked up the product's category), so there's
 *    no reason to wait for the browser to find out.
 * 2. A client component that mirrors the same value into React state, so the
 *    header logo and any client-side navigation stay in sync.
 */
export function GrillTheme({ active }: { active: boolean }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.${active ? "add" : "remove"}("dark-theme")`,
        }}
      />
      <GrillThemeSignal active={active} />
    </>
  );
}
