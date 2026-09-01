import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Heart } from "lucide-react";
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
  const categoryName = product.category
    ? localized(locale, product.category.nameHu, product.category.nameEn)
    : null;
  const orderOnly = isOrderOnly(Number(product.priceHuf), product.orderOnly);
  const badge = product.isNew ? "ÚJDONSÁG" : product.isOnSale ? "AKCIÓ" : null;
  const allImages = [product.mainImage, ...product.images].filter(
    (src): src is string => Boolean(src),
  );
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

      <div className="flex gap-14 px-16 pt-7.5 max-lg:px-6 max-lg:flex-col">
        <ProductGallery
          images={allImages}
          badge={badge}
          fallbackGradient={gradient}
        />

        {/* Info */}
        <div className="flex-1 pt-1.5">
          {product.series ? (
            <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
              {product.series.name} sorozat
            </div>
          ) : null}
          <h1 className="mt-3 text-[34px] leading-tight font-bold">{name}</h1>

          {description ? (
            <p className="mt-5.5 max-w-lg text-[15px] leading-relaxed whitespace-pre-line text-muted">
              {description}
            </p>
          ) : null}

          <div className="mt-7 text-[32px] font-extrabold text-accent">
            {formatHuf(product.priceHuf)}
          </div>

          {orderOnly ? (
            <div className="mt-5.5 max-w-md border-l-[3px] border-accent bg-paper-muted px-4.5 py-3.5 text-[13.5px] text-muted">
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
        </div>
      </div>

      {/* Specs */}
      <div className="flex gap-14 px-16 py-22 max-lg:px-6 max-lg:flex-col">
        {specs.length > 0 ? (
          <div className="w-165 shrink-0 max-lg:w-full">
            <h2 className="mb-5.5 text-2xl font-semibold">Műszaki jellemzők</h2>
            <dl>
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex justify-between border-b border-line py-3.5 text-sm"
                >
                  <dt className="text-muted">{spec.label}</dt>
                  <dd className="font-semibold">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
        <div className="flex-1">
          <h2 className="mb-5.5 text-2xl font-semibold">Kapcsolat</h2>
          <p className="max-w-lg text-sm leading-loose text-muted">
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

      {/* Configuration options — informational for now, no interactive
          picker or price recalculation yet. */}
      {product.variantOptions.length > 0 || product.threeDArUrl ? (
        <div className="px-16 pb-16 max-lg:px-6">
          {product.variantOptions.length > 0 ? (
            <div className="mb-8">
              <h2 className="mb-5.5 text-2xl font-semibold">Konfigurációs opciók</h2>
              <div className="flex flex-col gap-5">
                {product.variantOptions.map((group) => (
                  <div key={group.nameHu}>
                    <div className="mb-2.5 text-sm font-semibold">{group.nameHu}</div>
                    <div className="flex flex-wrap gap-3">
                      {group.choices.map((choice) => (
                        <div key={choice.nameHu} className="w-20">
                          {choice.imageUrl ? (
                            <div className="h-16 w-20 overflow-hidden border border-line">
                              <img
                                src={choice.imageUrl}
                                alt={choice.nameHu}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-16 w-20 border border-line bg-paper-muted" />
                          )}
                          <div className="mt-1 text-center text-[11px] text-muted">
                            {choice.nameHu}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {product.threeDArUrl ? (
            <a
              href={product.threeDArUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border-[1.5px] border-ink px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-white"
            >
              3D / AR megtekintés
            </a>
          ) : null}
        </div>
      ) : null}

      {/* Extras — same card layout as the homepage section */}
      {extras.length > 0 ? (
        <div className="bg-white px-16 py-22 max-lg:px-6">
          <h2 className="mb-7.5 text-2xl font-semibold">Rendelhető extrák</h2>
          <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2">
            {extras.map((extra) => (
              <ExtraCard
                key={extra.id}
                extra={extra}
                name={localized(locale, extra.nameHu, extra.nameEn)}
              />
            ))}
          </div>
        </div>
      ) : null}

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
