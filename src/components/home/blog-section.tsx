import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getSoroArticles } from "@/lib/soro";
import Image from "next/image";
import { Container } from "@/components/layout/container";

export async function BlogSection() {
  const t = await getTranslations("home");
  const posts = (await getSoroArticles()).slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section className="bg-white py-22">
      <Container>
        <div className="mb-11 flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-start">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-coprBlue/30 bg-coprBlue/10 px-4 py-1.5 text-[11.5px] font-bold tracking-[0.1em] text-coprBlue uppercase">
              {t("blogEyebrow")}
            </div>
            <h2 className="text-[42px] leading-tight font-bold tracking-[-0.01em] text-ink max-lg:text-3xl">
              {t("blogTitle")}
            </h2>
          </div>
          <Link
            href="/blog"
            className="rounded-control inline-flex shrink-0 items-center gap-2 border-[1.5px] border-ink px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
          >
            {t("blogViewAll")}
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-7 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {posts.map((post) => (
            <Link
              key={post.slug}
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
                  <time
                    dateTime={post.isoDate}
                    className="rounded-control absolute top-4 right-4 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink backdrop-blur-sm"
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
          ))}
        </div>
      </Container>
    </section>
  );
}
