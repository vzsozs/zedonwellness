import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Heart, Box } from "lucide-react";
import { eq, and, ne, desc } from "drizzle-orm";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { db } from "@/db";
import { products } from "@/db/schema";
import { formatHuf, isOrderOnly } from "@/lib/config";
import { localized } from "@/lib/localized";
import { getProductGradient } from "@/lib/visuals";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ExtraCard } from "@/components/extra-card";
import { VariantOptionGroup } from "@/components/variant-option-group";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: { category: true, series: true, extras: { with: { extra: true } } },
  });
  if (!product) notFound();

  const related = await db.query.products.findMany({
    where: and(
      eq(products.categoryId, product.categoryId),
      ne(products.id, product.id),
    ),
    orderBy: [desc(products.createdAt)],
    limit: 4,
    with: { series: true },
  });

  const name = localized(locale, product.nameHu, product.nameEn);
  const description = localized(locale, product.descriptionHu ?? "", product.descriptionEn);
  const shortDescription = localized(
    locale,
    product.shortDescriptionHu ?? "",
    product.shortDescriptionEn,
  );
  const categoryName = product.category
    ? localized(locale, product.category.nameHu, product.category.nameEn)
    : null;
  const orderOnly = isOrderOnly(Number(product.priceHuf), product.orderOnly);
  const badge = product.isNew ? "ÚJDONSÁG" : product.isOnSale ? "AKCIÓ" : null;
  const allImages = [...new Set(
    [product.mainImage, ...product.images].filter(
      (src): src is string => Boolean(src),
    ),
  )];
  const gradient = getProductGradient(product.id);
  const specs = product.specs;
  const extras = product.extras.map((pe) => pe.extra);

  return (
    <main>
      <div className="px-16 pt-7 text-[13px] text-muted/80 max-lg:px-6">
        <Link href="/" className="hover:text-accent">
          Főoldal
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

      <div className="grid grid-cols-2 gap-14 px-16 pt-7.5 max-lg:grid-cols-1 max-lg:px-6">
        {/* Visuals: gallery, 3D/AR, variant options, extras — stacked */}
        <div className="order-2 flex min-w-0 flex-col gap-10 max-lg:order-1">
          <ProductGallery
            images={allImages}
            badge={badge}
            fallbackGradient={gradient}
          />

          {product.threeDArUrl ? (
            <div>
              <h2 className="mb-3 text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
                3D / AR (kiterjesztett valóság)
              </h2>
              <a
                href={product.threeDArUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-line bg-paper-muted px-5 py-4 text-sm font-semibold hover:border-ink"
              >
                <Box className="size-5 text-coprBlue" strokeWidth={1.8} />
                Megtekintés kiterjesztett valóságban
              </a>
            </div>
          ) : null}

          {product.variantOptions.map((group) => (
            <VariantOptionGroup key={group.nameHu} group={group} />
          ))}

          {extras.length > 0 ? (
            <div>
              <h2 className="mb-3 text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
                Rendelhető extrák
              </h2>
              <div className="flex flex-wrap gap-4">
                {extras.map((extra) => (
                  <div key={extra.id} className="w-52 max-sm:w-full">
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
          {product.series ? (
            <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
              {product.series.name} sorozat
            </div>
          ) : null}
          <h1 className="mt-3 text-[40px] leading-tight font-extrabold text-coprBlue">
            {name}
          </h1>

          {shortDescription ? (
            <p className="mt-5.5 text-[15px] leading-relaxed whitespace-pre-line text-muted">
              {shortDescription}
            </p>
          ) : null}
          {description ? (
            <p className="mt-4 text-[15px] leading-relaxed whitespace-pre-line text-muted">
              {description}
            </p>
          ) : null}

          <img
            src="/tuv_certified.webp"
            alt="TÜV Rheinland Certified"
            className="mt-6 h-14 w-auto"
          />

          <div className="mt-6 text-[32px] font-extrabold text-accent">
            {formatHuf(product.priceHuf)}
          </div>

          {orderOnly ? (
            <div className="mt-5.5 border-l-[3px] border-accent bg-paper-muted px-4.5 py-3.5 text-[13.5px] text-muted">
              Ez a termék 1.000.000 Ft feletti értékű, ezért online fizetés nem
              elérhető — a rendelés leadása után kollégáink 1 munkanapon belül
              felveszik veled a kapcsolatot az egyeztetéshez.
            </div>
          ) : null}

          <div className="mt-6.5 flex gap-3.5 max-sm:flex-col">
            <button
              className="flex-1 bg-coprBlue bg-[length:auto_140%] bg-left-bottom bg-no-repeat py-4.5 text-[15px] font-semibold text-white"
              style={{ backgroundImage: "url(/brand/button-wave.svg)" }}
            >
              {orderOnly ? "Megrendelés leadása" : "Kosárba"}
            </button>
            <button
              aria-label="Kedvencekhez adás"
              className="flex w-14 items-center justify-center border-[1.5px] border-line bg-white"
            >
              <Heart className="size-5" strokeWidth={1.8} />
            </button>
          </div>

          {specs.length > 0 ? (
            <div className="mt-10">
              <h2 className="mb-5 text-xs font-bold tracking-[0.14em] text-muted uppercase">
                Paraméterek
              </h2>
              <dl>
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex justify-between border-b border-line py-3 text-sm"
                  >
                    <dt className="text-muted">{spec.label}</dt>
                    <dd className="font-semibold">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      </div>

      {/* Contact */}
      <div className="px-16 py-22 max-lg:px-6">
        <div className="max-w-lg">
          <h2 className="mb-5.5 text-2xl font-semibold">Kapcsolat</h2>
          <p className="text-sm leading-loose text-muted">
            Kérdésed van a termékkel kapcsolatban? Kollégáink szívesen
            segítenek a választásban, a helyszíni felmérés és a telepítés
            részleteiben.
          </p>
          <Link
            href="/kapcsolat"
            className="mt-5 inline-block border-[1.5px] border-ink px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-white"
          >
            Kapcsolatfelvétel
          </Link>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 ? (
        <div className="px-16 pb-25 max-lg:px-6">
          <h2 className="mb-7.5 text-[26px] font-semibold">Hasonló termékek</h2>
          <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}
