import { CmsUnavailableError, findPublishedPost } from "@services/cms";
import { createBlogPostingJsonLd, createBreadcrumbJsonLd, getPostMetadata } from "@services/blog/seo";
import BlogArticle from "@views/blog/components/article";
import BlogJsonLd from "@views/blog/components/jsonLd";
import BlogShell from "@views/blog/components/shell";
import BlogUnavailable from "@views/blog/components/unavailable";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const loadPost = async (slug: string) => {
  try {
    return { post: await findPublishedPost(slug) };
  } catch (error) {
    if (error instanceof CmsUnavailableError) return { post: undefined, unavailable: true };
    throw error;
  }
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await findPublishedPost(slug);
    if (!post) return { alternates: { canonical: null }, robots: { follow: false, index: false } };

    return getPostMetadata(post);
  } catch (error) {
    if (error instanceof CmsUnavailableError) return { alternates: { canonical: null }, robots: { follow: false, index: false } };
    return { alternates: { canonical: null }, robots: { follow: false, index: false } };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const result = await loadPost(slug);
  if (result.unavailable) {
    return (
      <BlogShell>
        <BlogUnavailable />
      </BlogShell>
    );
  }
  if (!result.post) notFound();

  return (
    <BlogShell>
      <BlogJsonLd
        data={[
          createBlogPostingJsonLd(result.post),
          createBreadcrumbJsonLd([
            { name: "Blog", path: "/blog" },
            { name: result.post.category.name, path: `/blog/category/${result.post.category.slug}` },
            { name: result.post.title, path: `/blog/${result.post.slug}` },
          ]),
        ]}
      />
      <BlogArticle post={result.post} />
    </BlogShell>
  );
}
