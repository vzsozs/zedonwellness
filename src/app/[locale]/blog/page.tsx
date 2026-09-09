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
    <main className="mx-auto max-w-[1480px]">
      <div className="mx-auto max-w-[760px] px-[5%] pt-16 pb-10 text-center max-lg:px-6">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-coprBlue/30 bg-coprBlue/10 px-4 py-1.5 text-[11.5px] font-bold tracking-[0.1em] text-coprBlue uppercase">
          {t("eyebrow")}
        </div>
        <h1 className="text-[42px] leading-tight font-bold tracking-[-0.01em] text-ink max-lg:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-[17px] leading-[1.7] text-muted">{t("metaDescription")}</p>
      </div>

      <div className="px-[5%] pb-25 max-lg:px-6">
        {articles.length > 0 ? (
          <BlogList articles={articles} />
        ) : (
          <p className="text-center text-muted">{t("empty")}</p>
        )}
      </div>
    </main>
  );
}
