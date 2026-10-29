import type { BlogPost } from "@services/cms";
import Link from "next/link";

import LexicalContent from "../lexicalContent";
import { formatBlogDate } from "../postCard";

export default function BlogArticle({ post }: { post: BlogPost }) {
  const publishedDate = formatBlogDate(post.publishedAt);
  const updatedDate = formatBlogDate(post.updatedAt);

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Link className="inline-flex font-semibold text-main hover:underline" href="/blog">
        ← Volver al blog
      </Link>
      <header className="space-y-4">
        <Link className="font-semibold text-main hover:underline" href={`/blog/category/${post.category.slug}`}>
          {post.category.name}
        </Link>
        <h1 className="text-4xl font-bold leading-tight text-slate-950 sm:text-5xl dark:text-white">{post.title}</h1>
        {post.excerpt ? <p className="text-xl leading-8 text-slate-700 dark:text-slate-200">{post.excerpt}</p> : null}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
          {publishedDate ? <time dateTime={post.publishedAt}>Publicado el {publishedDate}</time> : null}
          {updatedDate && updatedDate !== publishedDate ? <time dateTime={post.updatedAt}>Actualizado el {updatedDate}</time> : null}
        </div>
      </header>

      {post.coverImage ? (
        /* CMS Media URLs are validated server-side. Remote optimization waits for the final production hostname. */
        /* eslint-disable-next-line @next/next/no-img-element */
        <img alt={post.coverImage.alt} className="h-auto w-full rounded-2xl border border-slate-200 dark:border-slate-800" src={post.coverImage.url} />
      ) : null}

      {post.tags.length ? (
        <ul aria-label="Etiquetas" className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li className="rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800" key={tag.id}>
              {tag.name}
            </li>
          ))}
        </ul>
      ) : null}

      <LexicalContent content={post.content} />
    </article>
  );
}
