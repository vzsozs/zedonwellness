/** Picks the EN value when the locale is English and it's set, else falls back to HU. */
export function localized(
  locale: string,
  hu: string,
  en: string | null | undefined,
) {
  return locale === "en" && en ? en : hu;
}
