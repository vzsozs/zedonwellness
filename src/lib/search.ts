// Simple weighted product search — small catalog (a few dozen items), so a
// plain in-memory scan/score at request time is plenty fast and avoids
// standing up full-text search infrastructure for this.
type SearchableProduct = {
  nameHu: string;
  nameEn: string | null;
  shortDescriptionHu: string | null;
  shortDescriptionEn: string | null;
  descriptionHu: string | null;
  descriptionEn: string | null;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ");
}

/** Higher = more relevant. 0 = no match. Title matches outweigh description matches. */
export function scoreProduct(product: SearchableProduct, query: string, locale: string): number {
  const queryLower = query.trim().toLowerCase();
  if (!queryLower) return 0;

  const name = (locale === "en" ? product.nameEn : product.nameHu) ?? product.nameHu;
  const shortDesc = (locale === "en" ? product.shortDescriptionEn : product.shortDescriptionHu) ?? "";
  const desc = (locale === "en" ? product.descriptionEn : product.descriptionHu) ?? "";

  const nameLower = name.toLowerCase();
  const shortLower = shortDesc.toLowerCase();
  const descLower = stripHtml(desc).toLowerCase();

  let score = 0;
  if (nameLower === queryLower) score += 50;
  else if (nameLower.startsWith(queryLower)) score += 20;

  for (const word of queryLower.split(/\s+/).filter(Boolean)) {
    if (nameLower.includes(word)) score += 10;
    if (shortLower.includes(word)) score += 3;
    if (descLower.includes(word)) score += 1;
  }

  return score;
}
