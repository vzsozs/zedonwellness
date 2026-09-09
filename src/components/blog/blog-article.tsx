import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { SoroArticle } from "@/lib/soro";
import Image from "next/image";

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
    <article className="mx-auto max-w-3xl px-[5%] pt-12 pb-25 max-lg:px-6 max-lg:pt-8">
      <Link
        href="/blog"
        className="rounded-control mb-8 inline-flex items-center gap-2 border-[1.5px] border-ink px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
      >
        <ArrowLeft className="size-4" strokeWidth={2.2} />
        {backLabel}
      </Link>

      <h1 className="text-[42px] leading-tight font-bold tracking-[-0.01em] text-ink max-lg:text-3xl">
        {article.title}
      </h1>
      <time className="mt-3 block text-sm text-muted" dateTime={article.isoDate}>
        {article.date}
      </time>

      {article.image ? (
        <Image
          src={article.image}
          alt={article.title}
          width={1000}
          height={560}
          sizes="(max-width: 1024px) 100vw, 768px"
          className="rounded-card mt-8 h-auto w-full object-cover"
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
