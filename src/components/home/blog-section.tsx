import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSoroArticles } from "@/lib/soro";

export async function BlogSection() {
  const t = await getTranslations("home");
  const posts = (await getSoroArticles()).slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section className="bg-white px-16 py-22 max-lg:px-6">
      <div className="mb-11 text-center">
        <div className="text-xs font-bold tracking-[0.14em] text-coprBlue uppercase">
          {t("blogEyebrow")}
        </div>
        <h2 className="mt-3.5 text-4xl font-bold">{t("blogTitle")}</h2>
      </div>

      <div className="relative">
        <div className="flex gap-6 overflow-hidden">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog?post=${post.slug}`}
              className="group w-[38%] shrink-0 border border-line max-lg:w-[80%]"
            >
              <div className="h-44 overflow-hidden bg-paper-muted">
                {post.image ? (
                  <img
                    src={post.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="p-6">
                <h3 className="text-base font-bold group-hover:text-accent">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-white to-transparent max-lg:w-16" />
      </div>
    </section>
  );
}
