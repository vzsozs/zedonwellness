import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
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
