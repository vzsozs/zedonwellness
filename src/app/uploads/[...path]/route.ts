import { readFile, stat } from "fs/promises";
import path from "path";
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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const filePath = path.join(UPLOADS_ROOT, ...segments);

  // Reject path traversal outside the uploads root.
  if (!filePath.startsWith(UPLOADS_ROOT)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("not a file");
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
  const buffer = await readFile(filePath);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      // Defense in depth for uploaded SVGs: never sniff as HTML, never run
      // a script even if one somehow got embedded and this got loaded in a
      // context browsers do execute scripts in.
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "script-src 'none'",
    },
  });
}
