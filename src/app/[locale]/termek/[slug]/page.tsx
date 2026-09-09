import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { FileText, Check, X } from "lucide-react";
import { eq, and, ne, desc } from "drizzle-orm";
import { Link } from "@/i18n/navigation";
import { ContactButton } from "@/components/contact-button";
import type { Locale } from "@/i18n/routing";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isOrderOnly } from "@/lib/config";
import { localized } from "@/lib/localized";
import { looksLikeHtml, plainTextToHtml } from "@/lib/sanitize-description";
import { getProductGradient } from "@/lib/visuals";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductActions } from "@/components/product-actions";
import { ExtraCard } from "@/components/extra-card";
import { FeatureBadgeCard } from "@/components/feature-badge-card";
import { VariantOptionGroup } from "@/components/variant-option-group";
import { GrillTheme } from "@/components/grill-theme";
import { ProductMediaProvider } from "@/lib/product-media-context";
import { normalizeArUrl } from "@/lib/ar-url";
import { jsonLdScript, localeUrl, pageMetadata, SITE_URL, toMetaDescription } from "@/lib/seo";
import Image from "next/image";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Loads the row both generateMetadata and the page itself need. Next
 * dedupes the two calls within a request, so this is one query, not two. */
async function loadProduct(slug: string) {
  return db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      category: true,
      series: true,
      extras: { with: { extra: true } },
      features: { with: { feature: true } },
      variants: { orderBy: (v, { asc }) => [asc(v.sortOrder)] },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return {};

  const name = localized(locale, product.nameHu, product.nameEn);
  const description =
    toMetaDescription(localized(locale, product.shortDescriptionHu ?? "", product.shortDescriptionEn)) ||
    toMetaDescription(localized(locale, product.descriptionHu ?? "", product.descriptionEn));
  const image = product.mainImage ?? product.cardImage ?? product.images[0];

  return pageMetadata({
    title: name,
    description,
    path: `/termek/${product.slug}`,
    locale,
    images: image ? [image] : undefined,
  });
}

export default async function ProductPage({
  params,
}: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("product");
  const tc = await getTranslations("common");

  const product = await loadProduct(slug);
  if (!product) notFound();

  const related = await db.query.products.findMany({
    where: and(
      eq(products.categoryId, product.categoryId),
      ne(products.id, product.id),
    ),
    orderBy: [desc(products.createdAt)],
    limit: 4,
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
        specs: true,
        categoryId: true,
      },
    with: { series: true },
  });

  const name = localized(locale, product.nameHu, product.nameEn);
  const descriptionRaw = localized(locale, product.descriptionHu ?? "", product.descriptionEn);
  const description = descriptionRaw
    ? looksLikeHtml(descriptionRaw)
      ? descriptionRaw
      : plainTextToHtml(descriptionRaw)
    : "";
  const categoryName = product.category
    ? localized(locale, product.category.nameHu, product.category.nameEn)
    : null;
  const orderOnly = isOrderOnly(Number(product.priceHuf), product.orderOnly);
  const badge = product.isNew ? t("badgeNew") : product.isOnSale ? t("badgeSale") : null;
  const allImages = [...new Set(
    [product.mainImage, ...product.images].filter(
      (src): src is string => Boolean(src),
    ),
  )];
  const gradient = getProductGradient(product.id);
  const specs = product.specs;
  const extras = product.extras.map((pe) => pe.extra);
  const specsOnRight =
    product.specsPosition === "right" ||
    (product.specsPosition === "auto" && product.category?.slug === "grillek");

  const specsBlock =
    specs.length > 0 ? (
      <div>
        <h2 className="mb-5 text-lg font-extrabold tracking-wide text-heading uppercase">
          {t("specsHeading")}
        </h2>
        <dl>
          {specs.map((spec, i) => (
            <div
              key={`${spec.label}-${i}`}
              className="flex items-center justify-between border-b border-line py-3 text-sm"
            >
              <dt className="text-muted">{spec.label}</dt>
              <dd className="font-semibold">
                {spec.type === "boolean" ? (
                  spec.value === "true" ? (
                    <Check className="size-4.5 text-emerald-600" strokeWidth={2.5} aria-label={tc("yes")} />
                  ) : (
                    <X className="size-4.5 text-red-600" strokeWidth={2.5} aria-label={tc("no")} />
                  )
                ) : (
                  spec.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    ) : null;

  // Structured data: lets search results show price/availability/breadcrumb
  // instead of a bare blue link — the single highest-leverage SEO addition
  // for a product page.
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: toMetaDescription(
      localized(locale, product.shortDescriptionHu ?? "", product.shortDescriptionEn) ||
        localized(locale, product.descriptionHu ?? "", product.descriptionEn),
      500,
    ),
    sku: product.sku ?? undefined,
    image: allImages.map((src) => `${SITE_URL}${src}`),
    brand: { "@type": "Brand", name: product.series?.name ?? "Zedonwellness" },
    category: categoryName ?? undefined,
    ...(product.priceOnRequest
      ? {}
      : {
          offers: {
            "@type": "Offer",
            url: localeUrl(`/termek/${product.slug}`, locale),
            price: String(Number(product.priceHuf)),
            priceCurrency: "HUF",
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: "Zedonwellness" },
          },
        }),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tc("home"), item: localeUrl("/", locale) },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: categoryName,
              item: localeUrl(`/${product.category.slug}`, locale),
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 3 : 2,
        name,
        item: localeUrl(`/termek/${product.slug}`, locale),
      },
    ],
  };

  return (
    <main className="mx-auto max-w-[1480px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }}
      />
      <GrillTheme active={product.category?.slug === "grillek"} />
      <div className="px-[5%] pt-7 text-[13px] text-muted/80 max-lg:px-6">
        <Link href="/" className="hover:text-accent">
          {tc("home")}
        </Link>{" "}
        /{" "}
        {product.category ? (
          <>
            <Link href={`/${product.category.slug}`} className="hover:text-accent">
              {categoryName}
            </Link>{" "}
            /{" "}
          </>
        ) : null}
        {product.series ? <>{product.series.name} / </> : null}
        <span className="font-semibold text-ink">{name}</span>
      </div>

      <div className="px-[5%] pt-7.5 max-lg:px-6">
        {product.series ? (
          <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
            {product.series.name} {t("seriesSuffix")}
          </div>
        ) : null}
        <h1 className="mt-3 text-[40px] leading-tight font-extrabold text-coprBlue">
          {name}
        </h1>
      </div>

      <div className="mx-16 mt-8 bg-[#f4faff] px-10 pt-10 pb-14 max-lg:mx-6 max-lg:px-5">
      <ProductMediaProvider>
      <div className="grid grid-cols-2 gap-14 max-lg:grid-cols-1">
        {/* Visuals: gallery, 3D/AR, variant options, extras — stacked */}
        <div className="order-2 flex min-w-0 flex-col gap-10 max-lg:order-1">
          <div className="-mt-26 max-lg:-mt-16">
            <ProductGallery
              images={allImages}
              badge={badge}
              fallbackGradient={gradient}
            />
          </div>

          {specsOnRight ? specsBlock : null}

          {product.documents.length > 0 ? (
            <div>
              <h2 className="mb-5 text-lg font-extrabold tracking-wide text-heading uppercase">
                {t("documentsHeading")}
              </h2>
              <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-2">
                {product.documents.map((doc) => (
                  <a
                    key={doc.url}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-card flex flex-col items-center gap-3 border border-line p-5 text-center hover:border-ink"
                  >
                    <FileText className="size-12 text-coprBlue" strokeWidth={1.5} />
                    <span className="text-sm font-semibold text-ink">{doc.label}</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {product.threeDArUrl ? (
            <div>
              <h2 className="mb-3 text-lg font-extrabold tracking-wide text-heading uppercase">
                {t("arHeading")}
              </h2>
              <div className="aspect-video w-full overflow-hidden border border-line bg-paper-muted">
                <iframe
                  src={normalizeArUrl(product.threeDArUrl)}
                  title={name}
                  className="h-full w-full"
                  allow="camera; xr-spatial-tracking; fullscreen; accelerometer; gyroscope; magnetometer"
                  allowFullScreen
                />
              </div>
            </div>
          ) : null}

          {product.variantOptions.map((group, i) => (
            <VariantOptionGroup key={`${group.nameHu}-${i}`} group={group} locale={locale} />
          ))}

          {product.features.length > 0 ? (
            <div>
              <h2 className="mb-3 text-lg font-extrabold tracking-wide text-heading uppercase">
                {t("featuresHeading")}
              </h2>
              <div className="flex flex-wrap gap-4">
                {product.features.map(({ feature }) => (
                  <div key={feature.id} className="w-44 max-sm:w-full">
                    <FeatureBadgeCard
                      name={localized(locale, feature.nameHu, feature.nameEn ?? "")}
                      iconUrl={feature.iconUrl}
                      priceHuf={feature.priceHuf !== null ? Number(feature.priceHuf) : null}
                      priceEur={feature.priceEur}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {extras.length > 0 ? (
            <div>
              <h2 className="mb-3 text-lg font-extrabold tracking-wide text-heading uppercase">
                {t("extrasHeading")}
              </h2>
              <div className="flex flex-wrap gap-4">
                {extras.map((extra) => (
                  <div key={extra.id} className="w-44 max-sm:w-full">
                    <ExtraCard
                      extra={extra}
                      name={localized(locale, extra.nameHu, extra.nameEn)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className="order-1 min-w-0 max-lg:order-2">
          {description ? (
            <div
              className="mt-5.5 space-y-3 text-[15px] leading-relaxed text-muted [&_a]:text-accent [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : null}

          {product.category?.slug === "jakuzzik" || product.category?.slug === "szaunak" ? (
            <Image
              src="/tuv_certified.webp"
              alt="TÜV Rheinland Certified"
              width={160}
              height={96}
              className="mt-6 h-24 w-auto"
            />
          ) : null}

          <ProductActions
            productId={product.id}
            slug={product.slug}
            nameHu={product.nameHu}
            nameEn={product.nameEn}
            image={allImages[0] ?? null}
            priceHuf={Number(product.priceHuf)}
            priceEur={product.priceEur}
            priceOnRequest={product.priceOnRequest}
            weightKg={product.weightKg !== null ? Number(product.weightKg) : null}
            orderOnly={orderOnly}
            inStock={product.inStock}
            variants={product.variants.map((v) => ({
              id: v.id,
              nameHu: v.nameHu,
              nameEn: v.nameEn,
              sku: v.sku,
              priceHuf: v.priceHuf !== null ? Number(v.priceHuf) : null,
              weightKg: v.weightKg !== null ? Number(v.weightKg) : null,
              imageUrl: v.imageUrl,
              isDefault: v.isDefault,
              inStock: v.inStock,
            }))}
          />

          {!specsOnRight ? <div className="mt-10">{specsBlock}</div> : null}
        </div>
      </div>
      </ProductMediaProvider>
      </div>

      {/* Contact */}
      <div className="px-[5%] py-22 max-lg:px-6">
        <div className="max-w-lg">
          <h2 className="mb-5.5 text-2xl font-semibold">{t("contactHeading")}</h2>
          <p className="text-sm leading-loose text-muted">{t("contactText")}</p>
          <ContactButton className="mt-5 inline-block border-[1.5px] border-ink px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-white">
            {t("contactCta")}
          </ContactButton>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 ? (
        <div className="px-[5%] pb-25 max-lg:px-6">
          <h2 className="mb-7.5 text-[26px] font-semibold">{t("relatedHeading")}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 max-sm:grid-cols-1">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}
