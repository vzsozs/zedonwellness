import type { ElementType, ReactNode } from "react";

/**
 * The storefront's horizontal rhythm in one place.
 *
 * The gutter is a percentage, not a fixed 64px: on a wide monitor the page
 * needs more breathing room than on a laptop, and a fixed value makes the
 * content look pinned to the edges at 1920px. Capped at 1480px so lines
 * never grow past a comfortable measure.
 *
 * Below `lg` it falls back to a fixed 24px — 5% of a phone screen is too
 * tight to read against.
 */
export function Container({
  as: Tag = "div",
  width = "wide",
  className = "",
  children,
}: {
  as?: ElementType;
  /** `wide` is the standard page width; `prose` the narrower reading
   * measure used by the legal and article pages; `full` adds only the
   * gutter, for sections that manage their own width. */
  width?: "wide" | "prose" | "full";
  className?: string;
  children: ReactNode;
}) {
  const max =
    width === "prose"
      ? "mx-auto max-w-3xl"
      : width === "wide"
        ? "mx-auto max-w-[1480px]"
        : "";
  return <Tag className={`${max} px-[5%] max-lg:px-6 ${className}`.trim()}>{children}</Tag>;
}

/** The same gutter without the max-width — for full-bleed bars (top bar,
 * site header) that span the viewport but align their content to the grid. */
export function Gutter({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={`px-[5%] max-lg:px-6 ${className}`.trim()}>{children}</Tag>;
}
