import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { eq, asc } from "drizzle-orm";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { db } from "@/db";
import { categories, products, productSeries } from "@/db/schema";
import { localized } from "@/lib/localized";
import { CategoryBrowser } from "./category-browser";
import { SaunaBanner } from "@/components/category/sauna-banner";
import { jsonLdScript, localeUrl, pageMetadata, toMetaDescription } from "@/lib/seo";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string; category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  });
  if (!category) return {};

  return pageMetadata({
    title: localized(locale, category.nameHu, category.nameEn),
    description: toMetaDescription(
      localized(locale, category.descriptionHu ?? "", category.descriptionEn),
    ),
    path: `/${category.slug}`,
    locale,
    images: category.imageUrl ? [category.imageUrl] : undefined,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { locale, category: categorySlug } = await params;
  setRequestLocale(locale as Locale);
  const tc = await getTranslations("common");

  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  });
  if (!category) notFound();

  // The whole category's products load once and are filtered/sorted live
  // in the browser (small catalog sizes make this simpler and snappier
  // than a server round-trip per filter change).
  const [productList, seriesList] = await Promise.all([
    db.query.products.findMany({
      where: eq(products.categoryId, category.id),
      orderBy: [asc(products.nameHu)],
      columns: {
        id: true,
        slug: true,
        nameHu: true,
        nameEn: true,
        shortDescriptionHu: true,
        shortDescriptionEn: true,
        priceHuf: true,
        priceEur: true,
        priceOnRequest: true,
        capacity: true,
        seriesId: true,
        cardImage: true,
        mainImage: true,
        images: true,
        inStock: true,
        isNew: true,
        isOnSale: true,
      },
      with: { series: true },
    }),
    db.query.productSeries.findMany({
      where: eq(productSeries.categoryId, category.id),
      orderBy: [asc(productSeries.sortOrder), asc(productSeries.name)],
    }),
  ]);

  const name = localized(locale, category.nameHu, category.nameEn);
  const description = localized(locale, category.descriptionHu ?? "", category.descriptionEn);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tc("home"), item: localeUrl("/", locale) },
      {
        "@type": "ListItem",
        position: 2,
        name,
        item: localeUrl(`/${categorySlug}`, locale),
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }}
      />
      <div className="px-[5%] pt-10 max-lg:px-6">
        <div className="text-[13px] text-muted/80">
          <Link href="/" className="hover:text-accent">
            {tc("home")}
          </Link>{" "}
          / {tc("products")} / <span className="font-semibold text-ink">{name}</span>
        </div>
      </div>

      <CategoryBrowser
        name={name}
        description={description}
        products={productList}
        seriesList={seriesList}
        banner={categorySlug === "szaunak" ? <SaunaBanner /> : null}
      />
    </main>
  );
}
