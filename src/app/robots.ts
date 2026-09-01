import type { MetadataRoute } from "next";

const isStaging = process.env.NEXT_PUBLIC_STAGING_NOINDEX === "true";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  if (isStaging) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
