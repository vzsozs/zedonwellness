import { readdir, stat, unlink } from "fs/promises";
import path from "path";
import { db } from "@/db";
import { UPLOADS_ROOT } from "@/lib/upload";

/**
 * Finds uploaded files no database row points at any more.
 *
 * Nothing ever deleted an upload: replacing a product photo, removing a
 * gallery image or deleting a product all left the file on disk forever
 * (the volume was already at ~136 MB). Deleting eagerly at those points
 * would be wrong — the same URL can be referenced by several rows (a
 * product's `images`, `mainImage` and `cardImage` are the same files) — so
 * this reconciles the whole volume against the whole database instead, and
 * the admin confirms before anything is removed.
 */

export type OrphanFile = {
  /** Public path, e.g. /uploads/products/<uuid>.webp */
  url: string;
  sizeBytes: number;
  modifiedAt: Date;
};

/** Every /uploads/... path referenced anywhere in the database. */
async function collectReferencedUrls(): Promise<Set<string>> {
  const [productRows, extraRows, featureRows, variantRows, categoryRows] = await Promise.all([
    db.query.products.findMany({
      columns: {
        images: true,
        mainImage: true,
        cardImage: true,
        variantOptions: true,
        documents: true,
      },
    }),
    db.query.extras.findMany({ columns: { imageUrl: true } }),
    db.query.productFeatures.findMany({ columns: { iconUrl: true } }),
    db.query.productVariants.findMany({ columns: { imageUrl: true } }),
    db.query.categories.findMany({ columns: { imageUrl: true } }),
  ]);

  const referenced = new Set<string>();
  const add = (value: string | null | undefined) => {
    if (value && value.startsWith("/uploads/")) referenced.add(value);
  };

  for (const p of productRows) {
    p.images.forEach(add);
    add(p.mainImage);
    add(p.cardImage);
    for (const group of p.variantOptions) {
      for (const choice of group.choices) add(choice.imageUrl);
    }
    for (const doc of p.documents) add(doc.url);
  }
  extraRows.forEach((r) => add(r.imageUrl));
  featureRows.forEach((r) => add(r.iconUrl));
  variantRows.forEach((r) => add(r.imageUrl));
  categoryRows.forEach((r) => add(r.imageUrl));

  return referenced;
}

/** Walks the uploads volume, returning every file as a public URL path. */
async function walkUploads(dir = UPLOADS_ROOT, prefix = ""): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files: string[] = [];
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await walkUploads(path.join(dir, entry.name), relative)));
    } else if (entry.isFile()) {
      files.push(`/uploads/${relative}`);
    }
  }
  return files;
}

export async function findOrphanUploads(): Promise<OrphanFile[]> {
  const [referenced, allFiles] = await Promise.all([collectReferencedUrls(), walkUploads()]);

  const orphans: OrphanFile[] = [];
  for (const url of allFiles) {
    if (referenced.has(url)) continue;
    try {
      const info = await stat(path.join(UPLOADS_ROOT, url.replace("/uploads/", "")));
      orphans.push({ url, sizeBytes: info.size, modifiedAt: new Date(info.mtimeMs) });
    } catch {
      // Vanished between listing and stat — nothing to report.
    }
  }
  return orphans.sort((a, b) => b.sizeBytes - a.sizeBytes);
}

/**
 * Deletes the given orphans. Re-checks each one against the database first:
 * a product could have been saved between listing and confirming, and a
 * stale list must never delete a file that is now in use.
 */
export async function deleteOrphanUploads(urls: string[]): Promise<{ deleted: number; freedBytes: number }> {
  const referenced = await collectReferencedUrls();
  let deleted = 0;
  let freedBytes = 0;

  for (const url of urls) {
    if (!url.startsWith("/uploads/") || referenced.has(url)) continue;

    const relative = url.replace("/uploads/", "");
    const filePath = path.resolve(UPLOADS_ROOT, relative);
    const root = UPLOADS_ROOT.endsWith(path.sep) ? UPLOADS_ROOT : UPLOADS_ROOT + path.sep;
    if (!filePath.startsWith(root)) continue;

    try {
      const info = await stat(filePath);
      await unlink(filePath);
      deleted += 1;
      freedBytes += info.size;
    } catch {
      // Already gone — count it as done.
    }
  }

  return { deleted, freedBytes };
}
