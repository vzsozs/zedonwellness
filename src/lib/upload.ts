import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Kept outside public/ on purpose: Next's standalone server only serves
// public/ files that existed at boot (it caches the directory listing),
// so anything uploaded while the app is running would 404 until a
// restart. Files here are instead served dynamically by
// src/app/uploads/[...path]/route.ts, which reads from disk on every
// request. Mounted as a persistent Docker volume in production.
export const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

// SVGs are only ever referenced via <img src="..."> throughout this app
// (gallery previews, variant swatches, extras cards) — browsers don't
// execute embedded <script> tags in SVGs loaded that way (unlike via
// <iframe>/<object> or direct navigation), so this stays safe as long as
// that stays true. Don't link to an uploaded SVG directly or embed it
// another way without revisiting this.
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Low-level writer shared by saveUploadedImage/saveUploadedDocument, and
 * reusable directly by one-off migration/import scripts that already have a
 * Buffer (e.g. downloaded from an external URL) rather than a browser File.
 */
export async function writeUpload(buffer: Buffer, ext: string, subdir: string): Promise<string> {
  const filename = `${randomUUID()}.${ext}`;
  const dir = path.join(UPLOADS_ROOT, subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${subdir}/${filename}`;
}

/**
 * Saves an uploaded image file to uploads/<subdir>/ and returns its public
 * URL path (served via the /uploads/[...path] route handler).
 */
export async function saveUploadedImage(file: File, subdir: string): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new Error("Csak JPG, PNG, WEBP, AVIF vagy SVG kép tölthető fel.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("A kép mérete legfeljebb 8 MB lehet.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return writeUpload(buffer, ext, subdir);
}

const MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Saves an uploaded PDF document (spec sheet, assembly guide, ...) to
 * uploads/<subdir>/ and returns its public URL path.
 */
export async function saveUploadedDocument(file: File, subdir: string): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Csak PDF fájl tölthető fel.");
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    throw new Error("A fájl mérete legfeljebb 20 MB lehet.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return writeUpload(buffer, "pdf", subdir);
}
