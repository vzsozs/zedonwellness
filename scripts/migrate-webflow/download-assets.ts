// One-off: downloads every image/icon/PDF referenced in the Webflow CSV
// export into our own /uploads, so the migrated data has zero webflow.com
// dependencies. Produces asset-map.json mapping the original URL to the
// new local /uploads path, consumed by the import-*.ts scripts.
import { readFileSync, writeFileSync, readdirSync } from "fs";
import path from "path";
import { csvToRecords } from "../../src/lib/csv";
import { writeUpload } from "../../src/lib/upload";

const CSV_DIR = path.join(process.cwd(), "Ideiglenes/webflow_database");
const MAP_PATH = path.join(process.cwd(), "scripts/migrate-webflow/asset-map.json");

const URL_RE = /https?:\/\/[^\s,;"]+/g;

function extFromUrl(url: string): string {
  const clean = url.split("?")[0];
  const ext = clean.split(".").pop()?.toLowerCase() ?? "";
  return ext;
}

function subdirFor(ext: string): string {
  if (ext === "pdf") return "webflow-import/documents";
  if (ext === "svg") return "webflow-import/icons";
  return "webflow-import/photos";
}

async function main() {
  const files = readdirSync(CSV_DIR).filter((f) => f.endsWith(".csv"));
  const urls = new Set<string>();

  for (const file of files) {
    const text = readFileSync(path.join(CSV_DIR, file), "utf-8");
    const records = csvToRecords(text);
    for (const row of records) {
      for (const val of Object.values(row)) {
        if (val && val.includes("http")) {
          for (const m of val.match(URL_RE) ?? []) urls.add(m);
        }
      }
    }
  }

  console.log(`Found ${urls.size} unique URLs across ${files.length} files.`);

  let existingMap: Record<string, string> = {};
  try {
    existingMap = JSON.parse(readFileSync(MAP_PATH, "utf-8"));
  } catch {
    // first run
  }

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const url of urls) {
    if (existingMap[url]) {
      skipped++;
      continue;
    }
    const ext = extFromUrl(url);
    if (!ext || ext.length > 5) {
      console.warn(`  skip (no recognizable extension): ${url}`);
      continue;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const localUrl = await writeUpload(buffer, ext, subdirFor(ext));
      existingMap[url] = localUrl;
      downloaded++;
      if (downloaded % 25 === 0) console.log(`  ...${downloaded} downloaded`);
    } catch (err) {
      failed++;
      console.error(`  FAILED: ${url} — ${err instanceof Error ? err.message : err}`);
    }
  }

  writeFileSync(MAP_PATH, JSON.stringify(existingMap, null, 2));
  console.log(`Done. downloaded=${downloaded} skipped(cached)=${skipped} failed=${failed}`);
  console.log(`Map written to ${MAP_PATH}`);
}

main();
