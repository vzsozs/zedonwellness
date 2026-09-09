import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getSoroArticles } from "@/lib/soro";
import { Container } from "@/components/layout/container";
import { BlogCard } from "@/components/blog/blog-card";

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
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </Container>
    </section>
  );
}
