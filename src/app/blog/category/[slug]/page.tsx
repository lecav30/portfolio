import { CmsUnavailableError, findCategory, listCategories, listPublishedPosts, parseBlogPage } from "@services/cms";
import { createBreadcrumbJsonLd, getCategoryMetadata } from "@services/blog/seo";
import BlogListing from "@views/blog/components/listing";
import BlogBreadcrumbs from "@views/blog/components/breadcrumbs";
import BlogJsonLd from "@views/blog/components/jsonLd";
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

export async function generateMetadata({ params, searchParams }: Pick<PageProps, "params" | "searchParams">): Promise<Metadata> {
  const [{ slug }, { page: requestedPage }] = await Promise.all([params, searchParams]);

  try {
    const category = await findCategory(slug);
    return category
      ? getCategoryMetadata(category, parseBlogPage(requestedPage))
      : { alternates: { canonical: null }, robots: { follow: false, index: false } };
  } catch {
    return { alternates: { canonical: null }, robots: { follow: false, index: false } };
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
      <BlogJsonLd
        data={createBreadcrumbJsonLd([
          { name: "Blog", path: "/blog" },
          { name: category.name, path: `/blog/category/${category.slug}` },
        ])}
      />
      <BlogBreadcrumbs items={[{ href: "/blog", label: "Blog" }, { label: category.name }]} />
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
