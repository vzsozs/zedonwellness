import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";

/**
 * Branded 404 inside the locale layout, so it keeps the header, footer and
 * navigation. Matters more than usual here: the Webflow migration leaves a
 * long tail of old URLs, and a bare framework 404 is a dead end for both
 * visitors and crawlers.
 */
export default async function NotFound() {
  const t = await getTranslations("notFound");
  const nav = await getTranslations("nav");

  const links = [
    { href: "/jakuzzik", label: nav("jacuzzis") },
    { href: "/szaunak", label: nav("saunas") },
    { href: "/kiegeszitok", label: nav("accessories") },
    { href: "/grillek", label: nav("grills") },
    { href: "/blog", label: nav("blog") },
    { href: "/a-ceg", label: nav("company") },
  ];

  return (
    <Container as="main" width="prose" className="pt-24 pb-32 text-center">
      <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">404</div>
      <h1 className="mt-3.5 text-4xl font-bold max-lg:text-3xl">{t("title")}</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
        {t("description")}
      </p>

      <Link
        href="/"
        className="rounded-control mt-8 inline-block bg-ink px-8 py-3.5 text-sm font-semibold text-white hover:bg-accent-dark"
      >
        {t("backHome")}
      </Link>

      <div className="mt-14 border-t border-line pt-10">
        <div className="text-xs font-bold tracking-wide text-muted uppercase">
          {t("popularHeading")}
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-control border border-line px-5 py-2.5 text-sm font-semibold hover:border-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
