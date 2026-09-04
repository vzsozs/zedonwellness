import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { VirtualTourSection } from "@/components/home/virtual-tour-section";
import { HowWeWork } from "@/components/home/how-we-work";
import { VideoSection } from "@/components/home/video-section";
import { BlogSection } from "@/components/home/blog-section";

export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <main>
      <Hero />
      <TrustStrip />
      <CategoryGrid />
      <BlogSection />
      <FeaturedProducts />
      <VirtualTourSection />
      <VideoSection />
      <HowWeWork />
    </main>
  );
}
