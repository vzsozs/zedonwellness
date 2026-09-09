import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { SoroArticle } from "@/lib/soro";

/**
 * One article card — shared by the homepage teaser and the blog listing,
 * so the two can't drift apart.
 */
export function BlogCard({ post }: { post: SoroArticle }) {
  const t = useTranslations("home");

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="rounded-card group flex flex-col overflow-hidden border border-line bg-white transition-all duration-300 hover:-translate-y-[3px] hover:border-accent hover:shadow-[0_16px_40px_-6px_rgba(15,45,80,0.14)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-paper-muted">
        {post.image ? (
          <Image
            src={post.image}
            alt=""
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 420px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : null}
        {post.date ? (
          // Non-token colour: the badge sits on the photo, so it must stay
          // dark-on-white whatever the page theme does with `text-ink`.
          <time
            dateTime={post.isoDate}
            className="rounded-control absolute top-4 right-4 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-neutral-900 backdrop-blur-sm"
          >
            {post.date}
          </time>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-[17px] leading-snug font-bold text-ink group-hover:text-accent">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-[1.55] text-muted">
            {post.excerpt}
          </p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-semibold text-accent transition-transform group-hover:translate-x-1">
          {t("blogReadMore")}
          <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  );
}
