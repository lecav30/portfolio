import { CmsUnavailableError, findPublishedPost } from "@services/cms";
import BlogArticle from "@views/blog/components/article";
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
    if (!post) return {};

    return {
      title: post.seoTitle ?? `${post.title} | Sebastian Lévano`,
      description: post.seoDescription ?? post.excerpt,
      robots: post.noIndex ? { index: false, follow: false } : undefined,
    };
  } catch (error) {
    if (error instanceof CmsUnavailableError) return {};
    return {};
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
      <BlogArticle post={result.post} />
    </BlogShell>
  );
}
