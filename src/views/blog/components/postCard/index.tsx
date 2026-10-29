import type { BlogPost } from "@services/cms";
import Link from "next/link";

export const formatBlogDate = (value: string | undefined): string | undefined => {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? undefined
    : new Intl.DateTimeFormat("es-PE", { dateStyle: "long" }).format(date);
};

export default function PostCard({ post }: { post: BlogPost }) {
  const date = formatBlogDate(post.publishedAt);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-dark">
      {post.coverImage ? (
        /* CMS Media URLs are validated server-side. Remote optimization waits for the final production hostname. */
        /* eslint-disable-next-line @next/next/no-img-element */
        <img alt={post.coverImage.alt} className="aspect-[16/9] w-full object-cover" loading="lazy" src={post.coverImage.url} />
      ) : null}
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          <Link className="font-semibold text-main hover:underline" href={`/blog/category/${post.category.slug}`}>
            {post.category.name}
          </Link>
          {date ? <time dateTime={post.publishedAt}>{date}</time> : null}
        </div>
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
          <Link className="hover:text-main" href={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? <p className="leading-7 text-slate-700 dark:text-slate-200">{post.excerpt}</p> : null}
        <Link className="inline-flex font-semibold text-main hover:underline" href={`/blog/${post.slug}`}>
          Leer artículo<span aria-hidden="true"> →</span>
        </Link>
      </div>
    </article>
  );
}
