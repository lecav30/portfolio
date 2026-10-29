import { CmsUnavailableError, findCategory, listCategories, listPublishedPosts, parseBlogPage } from "@services/cms";
import BlogListing from "@views/blog/components/listing";
import BlogShell from "@views/blog/components/shell";
import BlogUnavailable from "@views/blog/components/unavailable";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

const loadCategory = async (slug: string) => {
  try {
    return { category: await findCategory(slug) };
  } catch (error) {
    if (error instanceof CmsUnavailableError) return { category: undefined, unavailable: true };
    throw error;
  }
};

export async function generateMetadata({ params }: Pick<PageProps, "params">): Promise<Metadata> {
  const { slug } = await params;

  try {
    const category = await findCategory(slug);
    return category
      ? {
          title: `${category.name} | Blog técnico | Sebastian Lévano`,
          description: category.description ?? `Artículos de la categoría ${category.name}.`,
        }
      : {};
  } catch {
    return {};
  }
}

export default async function BlogCategoryPage({ params, searchParams }: PageProps) {
  const [{ slug }, { page: requestedPage }] = await Promise.all([params, searchParams]);
  const page = parseBlogPage(requestedPage);

  const categoryResult = await loadCategory(slug);
  if (categoryResult.unavailable) {
    return (
      <BlogShell>
        <BlogUnavailable />
      </BlogShell>
    );
  }
  if (!categoryResult.category) notFound();

  const category = categoryResult.category;
  const [postsResult, categoriesResult] = await Promise.allSettled([
    listPublishedPosts({ category, page }),
    listCategories(),
  ]);

  if (postsResult.status === "rejected") {
    return (
      <BlogShell>
        <BlogUnavailable />
      </BlogShell>
    );
  }

  return (
    <BlogShell>
      <BlogListing
        basePath={`/blog/category/${category.slug}`}
        categories={categoriesResult.status === "fulfilled" ? categoriesResult.value : [category]}
        description={category.description ?? `Artículos publicados en ${category.name}.`}
        heading={category.name}
        posts={postsResult.value}
        selectedCategory={category}
      />
    </BlogShell>
  );
}
