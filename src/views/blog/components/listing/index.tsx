import type { BlogCategory, BlogPost, Paginated } from "@services/cms/types";
import Link from "next/link";

import PostCard from "../postCard";

const pageHref = (basePath: string, page: number): string => (page <= 1 ? basePath : `${basePath}?page=${page}`);

export default function BlogListing({
  basePath,
  categories,
  description,
  heading,
  posts,
  selectedCategory,
}: {
  basePath: string;
  categories: BlogCategory[];
  description: string;
  heading: string;
  posts: Paginated<BlogPost>;
  selectedCategory?: BlogCategory;
}) {
  return (
    <section aria-labelledby="blog-heading" className="space-y-10">
      <div className="max-w-3xl space-y-3">
        <p className="font-semibold uppercase tracking-[0.2em] text-main">Blog</p>
        <h1 id="blog-heading" className="text-4xl font-bold text-slate-950 sm:text-5xl dark:text-white">
          {heading}
        </h1>
        <p className="text-lg leading-8 text-slate-700 dark:text-slate-200">{description}</p>
      </div>

      <nav aria-label="Categorías del blog" className="flex flex-wrap gap-3">
        <Link
          aria-current={!selectedCategory ? "page" : undefined}
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${!selectedCategory ? "border-main bg-main text-white" : "border-slate-300 hover:border-main dark:border-slate-700"}`}
          href="/blog"
        >
          Todas
        </Link>
        {categories.map((category) => (
          <Link
            aria-current={selectedCategory?.slug === category.slug ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${selectedCategory?.slug === category.slug ? "border-main bg-main text-white" : "border-slate-300 hover:border-main dark:border-slate-700"}`}
            href={`/blog/category/${category.slug}`}
            key={category.id}
          >
            {category.name}
          </Link>
        ))}
      </nav>

      {posts.docs.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.docs.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-slate-700 dark:border-slate-200 dark:text-slate-200">
          {selectedCategory
            ? "Aún no hay artículos publicados en esta categoría."
            : "Aún no hay artículos publicados. Vuelve pronto para encontrar contenido técnico nuevo."}
        </div>
      )}

      {posts.totalPages > 1 ? (
        <nav aria-label="Paginación del blog" className="flex items-center justify-between gap-4">
          {posts.page > 1 ? (
            <Link className="font-semibold text-main hover:underline" href={pageHref(basePath, posts.page - 1)}>
              ← Anterior
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          <p aria-live="polite" className="text-sm text-slate-600 dark:text-slate-300">
            Página {posts.page} de {posts.totalPages}
          </p>
          {posts.page < posts.totalPages ? (
            <Link className="font-semibold text-main hover:underline" href={pageHref(basePath, posts.page + 1)}>
              Siguiente →
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>
      ) : null}
    </section>
  );
}
