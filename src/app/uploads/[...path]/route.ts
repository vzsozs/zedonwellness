import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { UPLOADS_ROOT } from "@/lib/upload";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

const SECURITY_HEADERS = {
  // Defense in depth for uploaded SVGs: never sniff as HTML, never run a
  // script even if one somehow got embedded and this got loaded in a
  // context browsers do execute scripts in.
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "script-src 'none'; sandbox",
} as const;

/** Resolves a request path inside the uploads directory, or null if it
 * would escape it. */
function resolveWithinUploads(segments: string[]): string | null {
  const filePath = path.resolve(UPLOADS_ROOT, ...segments);
  // Compared with the separator appended: a bare `startsWith(UPLOADS_ROOT)`
  // also accepts a sibling directory like `/app/uploads-backup`.
  const root = UPLOADS_ROOT.endsWith(path.sep) ? UPLOADS_ROOT : UPLOADS_ROOT + path.sep;
  return filePath.startsWith(root) ? filePath : null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const filePath = resolveWithinUploads(segments);
  if (!filePath) return new Response("Not found", { status: 404 });

  let info;
  try {
    info = await stat(filePath);
    if (!info.isFile()) throw new Error("not a file");
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext];
  // Only the formats the uploader accepts are served — an unexpected file
  // sitting in the volume shouldn't be handed out as octet-stream.
  if (!contentType) return new Response("Not found", { status: 404 });

  // Uploads are content-addressed by UUID and never rewritten in place, so
  // size+mtime is a sound validator. Lets browsers and the Next image
  // optimizer revalidate with a 304 instead of re-downloading a 4 MB PDF.
  const etag = `"${info.size.toString(16)}-${info.mtimeMs.toString(16)}"`;
  if (req.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag, ...SECURITY_HEADERS } });
  }

  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Length": String(info.size),
    "Cache-Control": "public, max-age=31536000, immutable",
    ETag: etag,
    "Last-Modified": new Date(info.mtimeMs).toUTCString(),
    ...SECURITY_HEADERS,
  });

  // Streamed rather than read into memory — some product PDFs are 5+ MB,
  // and a burst of requests would otherwise hold all of them in the heap
  // at once.
  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream<Uint8Array>;
  return new Response(stream, { headers });
}
