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
    with: { category: true },
  });
  if (!product) notFound();

  const related = await db.query.products.findMany({
    where: and(
      eq(products.categoryId, product.categoryId),
      ne(products.id, product.id),
    ),
    orderBy: [desc(products.createdAt)],
    limit: 4,
  });

  const name = localized(locale, product.nameHu, product.nameEn);
  const description = localized(locale, product.descriptionHu ?? "", product.descriptionEn);
  const categoryName = product.category
    ? localized(locale, product.category.nameHu, product.category.nameEn)
    : null;
  const orderOnly = isOrderOnly(Number(product.priceHuf), product.orderOnly);
  const badge = product.isNew ? "ÚJDONSÁG" : product.isOnSale ? "AKCIÓ" : null;
  const gallery = product.images.length > 0 ? product.images : null;
  const gradient = getProductGradient(product.id);
  const specs = Object.entries(product.specs);

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
        {product.series ? <>{product.series} / </> : null}
        <span className="font-semibold text-ink">{name}</span>
      </div>

      <div className="flex gap-14 px-16 pt-7.5 max-lg:px-6 max-lg:flex-col">
        {/* Gallery */}
        <div className="w-165 shrink-0 max-lg:w-full">
          <div
            className={
              gallery
                ? "relative flex h-130 items-center justify-center bg-cover bg-center max-lg:h-80"
                : `relative flex h-130 items-center justify-center bg-gradient-to-br ${gradient} max-lg:h-80`
            }
            style={gallery ? { backgroundImage: `url(${gallery[0]})` } : undefined}
          >
            {badge ? (
              <span className="absolute top-4 left-4 bg-ink px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-white">
                {badge}
              </span>
            ) : null}
          </div>
          {gallery && gallery.length > 1 ? (
            <div className="mt-3.5 flex gap-3">
              {gallery.map((src, i) => (
                <div
                  key={src}
                  className="h-20 w-25 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${src})`,
                    ...(i === 0 ? { outline: "2px solid #0E8C9A" } : { opacity: 0.7 }),
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className="flex-1 pt-1.5">
          {product.series ? (
            <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
              {product.series} sorozat
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
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between border-b border-line py-3.5 text-sm"
                >
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
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
