import type { ElementType, ReactNode } from "react";

/**
 * The storefront's horizontal rhythm in one place.
 *
 * `px-16 max-lg:px-6` was repeated by hand in about twenty files, so
 * adjusting the page gutter meant finding every one of them.
 */
export function Container({
  as: Tag = "div",
  width = "wide",
  className = "",
  children,
}: {
  as?: ElementType;
  /** `wide` fills the page; `prose` is the narrower reading measure used by
   * the legal and article pages; `full` adds only the gutter. */
  width?: "wide" | "prose" | "full";
  className?: string;
  children: ReactNode;
}) {
  const max =
    width === "prose"
      ? "mx-auto max-w-3xl"
      : width === "wide"
        ? "mx-auto max-w-[1600px]"
        : "";
  return <Tag className={`${max} px-16 max-lg:px-6 ${className}`.trim()}>{children}</Tag>;
}
