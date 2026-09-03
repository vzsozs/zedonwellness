/** Some admin-entered 3D/AR links are missing the "?" before their first
 * query param (e.g. "...page&lang=en") — patches that up so it embeds
 * correctly in an iframe instead of 404ing on a mangled path. */
export function normalizeArUrl(url: string): string {
  if (url.includes("?")) return url;
  const ampIndex = url.indexOf("&");
  if (ampIndex === -1) return url;
  return `${url.slice(0, ampIndex)}?${url.slice(ampIndex + 1)}`;
}
