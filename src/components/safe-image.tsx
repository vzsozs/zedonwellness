import Image, { type ImageProps } from "next/image";

/**
 * next/image for anything we host, a plain <img> for anything else.
 *
 * `next/image` **throws** on a remote host that isn't listed in
 * `images.remotePatterns`, which takes down the whole page. Catalogue image
 * URLs are admin-entered data, and the database still contains leftover
 * Webflow CDN links from the migration — one stale row must not 500 a
 * category listing.
 *
 * Local paths (`/uploads/...`, `/brand/...`) go through the optimizer and
 * get the full srcset/AVIF treatment; unknown remote hosts are rendered
 * as-is, unoptimized but working.
 */
function isLocal(src: string): boolean {
  return src.startsWith("/");
}

export function SafeImage({
  src,
  alt,
  ...rest
}: Omit<ImageProps, "src"> & { src: string }) {
  if (isLocal(src)) {
    return <Image src={src} alt={alt} {...rest} />;
  }

  const { className, fill, width, height, sizes, priority, ...imgRest } = rest;
  void sizes;
  void priority;
  void imgRest;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- deliberate fallback, see above
    <img
      src={src}
      alt={alt}
      width={typeof width === "number" ? width : undefined}
      height={typeof height === "number" ? height : undefined}
      loading="lazy"
      className={fill ? `absolute inset-0 h-full w-full ${className ?? ""}` : className}
    />
  );
}
