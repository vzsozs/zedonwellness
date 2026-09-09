import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Uploaded photos come straight from the camera — several MB at full
    // resolution — but are shown in ~300px cards. These sizes let
    // next/image emit a srcset that matches the real display size.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [420, 640, 828, 1080, 1200, 1600, 1920],
    imageSizes: [64, 96, 128, 200, 256, 320, 420],
    // Uploads are served by our own route handler, so they're same-origin
    // and need no remotePatterns entry. The blog's article photos are not.
    remotePatterns: [
      // Soro serves article images from its Supabase storage bucket, not
      // from its own domain.
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "app.trysoro.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // Baseline security headers. The site had none — no clickjacking
  // protection, no HSTS, no referrer policy.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), payment=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  experimental: {
    // Default is 1 MB — the admin's image upload forms (product gallery,
    // variant swatches) send real photos as multipart Server Action bodies,
    // which blow past that and fail with an opaque "unexpected response"
    // error on the client. Matches the 8 MB per-file cap in src/lib/upload.ts
    // (a form can carry several files, hence the higher total).
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default withNextIntl(nextConfig);
