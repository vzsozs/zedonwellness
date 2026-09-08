// Simple weighted product search — small catalog (a few dozen items), so a
// plain in-memory scan/score at request time is plenty fast and avoids
// standing up full-text search infrastructure for this.
type SearchableProduct = {
  nameHu: string;
  nameEn: string | null;
  shortDescriptionHu: string | null;
  shortDescriptionEn: string | null;
  sku?: string | null;
  seriesName?: string | null;
};

/**
 * Lowercases and strips diacritics, so "hoszivattyu" finds "hőszivattyú" —
 * Hungarian accents are exactly what people leave off when typing quickly.
 */
function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Higher = more relevant. 0 = no match. Title matches outweigh description matches. */
export function scoreProduct(product: SearchableProduct, query: string, locale: string): number {
  const q = fold(query.trim());
  if (!q) return 0;

  // Both languages are always searched: catalogue content is only partly
  // translated, so an English visitor searching "sauna" should still find a
  // product whose name is only stored in Hungarian.
  const primaryName = (locale === "en" ? product.nameEn : product.nameHu) ?? product.nameHu;
  const name = fold(primaryName);
  const altName = fold([product.nameHu, product.nameEn].filter(Boolean).join(" "));
  const shortDesc = fold(
    [product.shortDescriptionHu, product.shortDescriptionEn].filter(Boolean).join(" "),
  );
  const sku = fold(product.sku ?? "");
  const series = fold(product.seriesName ?? "");

  let score = 0;
  if (name === q) score += 50;
  else if (name.startsWith(q)) score += 20;
  if (sku && sku === q) score += 50;

  for (const word of q.split(/\s+/).filter(Boolean)) {
    if (name.includes(word)) score += 10;
    else if (altName.includes(word)) score += 6;
    if (series.includes(word)) score += 4;
    if (shortDesc.includes(word)) score += 3;
    if (sku.includes(word)) score += 2;
  }

  return score;
}
