import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getSoroArticles } from "@/lib/soro";
import { BlogList } from "@/components/blog/blog-list";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 900;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ post?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return pageMetadata({
    title: t("title"),
    description: t("metaDescription"),
    path: "/blog",
    locale,
  });
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("blog");

  // Articles used to live at /blog?post=<slug>. They have their own route
  // now (better for indexing and sharing); this keeps every old link and
  // any already-indexed URL working.
  const { post } = await searchParams;
  if (post) redirect(`/blog/${post}`);

  const articles = await getSoroArticles();

  return (
    <main className="mx-auto max-w-[1400px]">
      <div className="px-16 pt-16 pb-10 text-center max-lg:px-6">
        <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
          {t("eyebrow")}
        </div>
        <h1 className="mt-3.5 text-4xl font-bold max-lg:text-3xl">{t("title")}</h1>
      </div>

      <div className="px-16 pb-25 max-lg:px-6">
        {articles.length > 0 ? (
          <BlogList articles={articles} />
        ) : (
          <p className="text-center text-muted">{t("empty")}</p>
        )}
      </div>
    </main>
  );
}
