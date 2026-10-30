import { listCategories, listPublishedPosts, parseBlogPage } from "@services/cms";
import { getBlogIndexMetadata } from "@services/blog/seo";
import BlogListing from "@views/blog/components/listing";
import BlogShell from "@views/blog/components/shell";
import BlogUnavailable from "@views/blog/components/unavailable";
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}): Promise<Metadata> {
  const { page: requestedPage } = await searchParams;
  return getBlogIndexMetadata(parseBlogPage(requestedPage));
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { page: requestedPage } = await searchParams;
  const page = parseBlogPage(requestedPage);
  const [postsResult, categoriesResult] = await Promise.allSettled([
    listPublishedPosts({ page }),
    listCategories(),
  ]);

  if (postsResult.status === "rejected") {
    return (
      <BlogShell>
        <BlogUnavailable />
      </BlogShell>
    );
  }

  // Categories enhance navigation but a temporary category-list outage should
  // not hide an otherwise valid published-post listing.
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

  return (
    <BlogShell>
      <BlogListing
        basePath="/blog"
        categories={categories}
        description="Tutoriales, opiniones, reviews y notas sobre desarrollo de software."
        heading="Artículos técnicos"
        posts={postsResult.value}
      />
    </BlogShell>
  );
}
