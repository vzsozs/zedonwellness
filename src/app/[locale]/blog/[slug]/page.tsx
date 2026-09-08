import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getSoroArticles, getSoroArticleContent } from "@/lib/soro";
import { sanitizeArticleHtml } from "@/lib/sanitize-description";
import { BlogArticle } from "@/components/blog/blog-article";
import { jsonLdScript, localeUrl, pageMetadata, toMetaDescription } from "@/lib/seo";

/** Articles change rarely; the Soro fetch itself is cached for 5 minutes. */
export const revalidate = 900;

type Props = { params: Promise<{ locale: string; slug: string }> };

async function findArticle(slug: string) {
  const articles = await getSoroArticles();
  return articles.find((a) => a.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await findArticle(slug);
  if (!article) return {};

  return pageMetadata({
    title: article.title,
    description: toMetaDescription(article.excerpt),
    path: `/blog/${article.slug}`,
    locale,
    images: article.image ? [article.image] : undefined,
    type: "article",
  });
}

export default async function BlogArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("blog");

  const article = await findArticle(slug);
  if (!article) notFound();

  const rawContent = await getSoroArticleContent(article.id);
  // Third-party HTML rendered on our own origin — never trusted as-is.
  const content = rawContent ? sanitizeArticleHtml(rawContent) : null;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: toMetaDescription(article.excerpt, 300),
    datePublished: article.isoDate || undefined,
    image: article.image ? [article.image] : undefined,
    mainEntityOfPage: localeUrl(`/blog/${article.slug}`, locale),
    author: { "@type": "Organization", name: "Zedonwellness" },
    publisher: { "@type": "Organization", name: "Zedonwellness" },
  };

  return (
    <main className="mx-auto max-w-[1400px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(articleLd) }}
      />
      <BlogArticle article={article} content={content} backLabel={t("back")} />
    </main>
  );
}
