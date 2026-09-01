import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  products,
  getProduct,
  getRelatedProducts,
  getCategory,
  formatHuf,
} from "@/lib/catalog";
import { isOrderOnly } from "@/lib/config";
import { ProductCard } from "@/components/product-card";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.categorySlug);
  const nav = await getTranslations("nav");
  const related = getRelatedProducts(product);
  const orderOnly = !product.customQuote && isOrderOnly(product.priceHuf);

  return (
    <main>
      <div className="px-16 pt-7 text-[13px] text-muted/80 max-lg:px-6">
        <Link href="/" className="hover:text-accent">
          Főoldal
        </Link>{" "}
        /{" "}
        <Link href={`/${product.categorySlug}`} className="hover:text-accent">
          {category ? nav(category.navKey) : product.categorySlug}
        </Link>{" "}
        / {product.series} / <span className="font-semibold text-ink">{product.nameHu}</span>
      </div>

      <div className="flex gap-14 px-16 pt-7.5 max-lg:px-6 max-lg:flex-col">
        {/* Gallery */}
        <div className="w-165 shrink-0 max-lg:w-full">
          <div
            className={`relative flex h-130 items-center justify-center bg-gradient-to-br ${product.gradient} max-lg:h-80`}
          >
            {product.badge ? (
              <span className="absolute top-4 left-4 bg-ink px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-white">
                {product.badge.label}
              </span>
            ) : null}
          </div>
          <div className="mt-3.5 flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-20 w-25 bg-gradient-to-br ${product.gradient} ${
                  i === 0 ? "border-2 border-accent" : "opacity-70"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 pt-1.5">
          <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
            {product.series} sorozat
          </div>
          <h1 className="mt-3 text-[34px] leading-tight font-bold">
            {product.nameHu}
          </h1>

          <p className="mt-5.5 max-w-lg text-[15px] leading-relaxed whitespace-pre-line text-muted">
            {product.descriptionHu}
          </p>

          <div className="mt-7 text-[32px] font-extrabold text-accent">
            {product.customQuote ? "Egyedi ajánlat" : formatHuf(product.priceHuf)}
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
              {product.customQuote || orderOnly
                ? "Megrendelés leadása"
                : "Kosárba"}
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
        <div className="w-165 shrink-0 max-lg:w-full">
          <h2 className="mb-5.5 text-2xl font-semibold">Műszaki jellemzők</h2>
          <dl>
            {product.specs.map((spec) => (
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
