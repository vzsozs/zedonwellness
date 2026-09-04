const SORO_TOKEN = "84acc88f-14b8-4296-96d3-1bfd6f19b957";
const SORO_API_BASE = "https://app.trysoro.com/api/embed";
const SORO_EMBED_URL = `${SORO_API_BASE}/${SORO_TOKEN}`;

export type SoroArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  isoDate: string;
  image: string | null;
};

// There's no separate JSON API for the Soro blog — the embed widget ships
// as a single JS file with the full article list baked in as
// `var SORO_ARTICLES = [...]` (already sorted newest first). This scrapes
// that same array out so the homepage teaser can use real posts/photos
// instead of the widget itself.
export async function getSoroArticles(): Promise<SoroArticle[]> {
  try {
    const res = await fetch(SORO_EMBED_URL, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const text = await res.text();
    const match = text.match(/SORO_ARTICLES\s*=\s*(\[[\s\S]*?\]);\s*\n/);
    if (!match) return [];
    return JSON.parse(match[1]);
  } catch {
    return [];
  }
}

// Full post body (HTML), fetched on demand for a single article — kept
// separate from the list feed above since it's not needed for cards.
export async function getSoroArticleContent(id: string): Promise<string | null> {
  try {
    const res = await fetch(`${SORO_API_BASE}/${SORO_TOKEN}/article/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.content === "string" ? data.content : null;
  } catch {
    return null;
  }
}
