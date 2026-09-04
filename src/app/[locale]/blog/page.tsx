import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getSoroArticles, getSoroArticleContent } from "@/lib/soro";
import { BlogList } from "@/components/blog/blog-list";
import { BlogArticle } from "@/components/blog/blog-article";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ post?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { post } = await searchParams;
  if (!post) return {};

  const articles = await getSoroArticles();
  const article = articles.find((a) => a.slug === post);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: article.image
      ? { title: article.title, description: article.excerpt, images: [article.image] }
      : { title: article.title, description: article.excerpt },
  };
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("blog");

  const { post } = await searchParams;
  const articles = await getSoroArticles();
  const article = post ? articles.find((a) => a.slug === post) : undefined;
  const content = article ? await getSoroArticleContent(article.id) : null;

  return (
    <main className="mx-auto max-w-[1400px]">
      <div className="px-16 pt-16 pb-10 text-center max-lg:px-6">
        <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
          {t("eyebrow")}
        </div>
        <h1 className="mt-3.5 text-4xl font-bold max-lg:text-3xl">{t("title")}</h1>
      </div>

      {article ? (
        <BlogArticle article={article} content={content} backLabel={t("back")} />
      ) : (
        <div className="px-16 pb-25 max-lg:px-6">
          {articles.length > 0 ? (
            <BlogList articles={articles} />
          ) : (
            <p className="text-center text-muted">{t("empty")}</p>
          )}
        </div>
      )}
    </main>
  );
}
