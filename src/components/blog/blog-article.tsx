import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { SoroArticle } from "@/lib/soro";

export function BlogArticle({
  article,
  content,
  backLabel,
}: {
  article: SoroArticle;
  content: string | null;
  backLabel: string;
}) {
  return (
    <article className="mx-auto max-w-3xl px-16 pb-25 max-lg:px-6">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 border border-line px-4 py-2 text-sm font-semibold hover:text-accent"
      >
        <ArrowLeft className="size-4" strokeWidth={2.2} />
        {backLabel}
      </Link>

      <h1 className="text-3xl font-bold max-lg:text-2xl">{article.title}</h1>
      <time className="mt-3 block text-sm text-muted" dateTime={article.isoDate}>
        {article.date}
      </time>

      {article.image ? (
        <img
          src={article.image}
          alt={article.title}
          className="mt-8 w-full object-cover"
        />
      ) : null}

      {content ? (
        <div
          className="blog-article-content mt-8"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : null}
    </article>
  );
}
