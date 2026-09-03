import { readFileSync } from "fs";
import path from "path";
import { csvToRecords } from "../../src/lib/csv";

export const CSV_DIR = path.join(process.cwd(), "Ideiglenes/webflow_database");

const assetMap: Record<string, string> = JSON.parse(
  readFileSync(path.join(process.cwd(), "scripts/migrate-webflow/asset-map.json"), "utf-8"),
);

export function readCsv(filename: string): Record<string, string>[] {
  const text = readFileSync(path.join(CSV_DIR, filename), "utf-8");
  return csvToRecords(text);
}

/** Resolves a semicolon-separated Webflow URL list into deduped local /uploads paths. */
export function resolveImages(cell: string | undefined): string[] {
  if (!cell) return [];
  const urls = cell.split(";").map((u) => u.trim()).filter(Boolean);
  const local = urls.map((u) => assetMap[u]).filter((u): u is string => Boolean(u));
  return [...new Set(local)];
}

export function resolveAsset(url: string | undefined): string | null {
  if (!url) return null;
  return assetMap[url.trim()] ?? null;
}

/** "1 800 000 Ft" / "2.650.000.- Ft" / "Hamarosan" -> number | null (space or dot as thousands sep). */
export function parseHufPrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const s = raw.trim();
  if (!/\d/.test(s)) return null; // "Hamarosan" etc — no digits at all
  const digits = s.replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number(digits);
}

/** Ecommerce "Ft46\xa0290,00" -> 46290 (comma is the decimal separator here). */
export function parseEcommercePrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/^Ft/i, "").replace(/[\s ]/g, "");
  if (!cleaned) return null;
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n) : null;
}

// Webflow strips Hungarian accents from uploaded filenames (e.g. "lámpa" ->
// "lampa"), so a purely mechanical humanizer loses them — this maps the
// known sauna-feature icon stems to their correct accented Hungarian label.
const ICON_LABELS: Record<string, string> = {
  szauna: "Szauna",
  labracs: "Lábrács",
  lampa: "Lámpa",
  szaunaszett: "Szaunaszett",
  szaunako: "Szaunakő",
  terasz: "Terasz",
  szauna_audio: "Szauna audio",
  oltozo: "Öltöző",
};

/** "ico_kalyha-9kw.svg" (from its full URL) -> "Kályha 9kW" */
export function humanizeIconLabel(url: string): string {
  const filename = url.split("/").pop() ?? "";
  const stem = filename.replace(/\.[^.]+$/, "");
  const afterPrefix = stem.replace(/^[a-f0-9]+_ico_/i, "").replace(/^ico_/i, "");

  if (ICON_LABELS[afterPrefix]) return ICON_LABELS[afterPrefix];

  const words = afterPrefix.split(/[-_]/).filter(Boolean);
  return words
    .map((w) => {
      if (w === "kalyha") return "Kályha";
      if (w === "padlo") return "Padló";
      if (w === "teto") return "Tető";
      if (w === "price") return "";
      const kwMatch = w.match(/^(\d+(?:\.\d+)?)kw$/i);
      if (kwMatch) return `${kwMatch[1]}kW`;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .filter(Boolean)
    .join(" ");
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
