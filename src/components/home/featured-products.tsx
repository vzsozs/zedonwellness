import { getTranslations } from "next-intl/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/product-card";

export async function FeaturedProducts() {
  const t = await getTranslations("home");
  const featured = await db.query.products.findMany({
    where: eq(products.isFeatured, true),
    orderBy: [desc(products.createdAt)],
    limit: 3,
    with: { series: true },
  });

  if (featured.length === 0) return null;

  return (
    <section className="px-16 py-22 max-lg:px-6">
      <div className="mb-11 flex items-end justify-between max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <div>
          <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
            {t("featuredEyebrow")}
          </div>
          <h2 className="mt-3.5 text-3xl font-semibold">{t("featuredTitle")}</h2>
        </div>
        <Link href="/jakuzzik" className="text-sm font-bold hover:text-accent">
          {t("viewAll")} →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-7 max-lg:grid-cols-1">
        {featured.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
