import type { BlogRevalidationEvent } from "./contract";

export type RevalidationTargets = {
  paths: string[];
  tags: string[];
};

export type CacheInvalidator = {
  revalidatePath: (path: string) => void;
  revalidateTag: (tag: string, profile: "max") => void;
};

export const getBlogRevalidationTargets = (event: BlogRevalidationEvent): RevalidationTargets => {
  const slugs = new Set([event.post.slug, event.post.previousSlug].filter((value): value is string => Boolean(value)));
  const categorySlugs = new Set(
    [event.post.categorySlug, event.post.previousCategorySlug].filter((value): value is string => Boolean(value)),
  );

  return {
    paths: [
      "/blog",
      "/blog/rss.xml",
      "/sitemap.xml",
      ...[...slugs].map((slug) => `/blog/${slug}`),
      ...[...categorySlugs].map((slug) => `/blog/category/${slug}`),
    ],
    tags: [
      "blog:posts",
      "blog:categories",
      ...[...slugs].map((slug) => `blog:post:${slug}`),
      ...[...categorySlugs].map((slug) => `blog:category:${slug}`),
    ],
  };
};

export const invalidateBlogCaches = (event: BlogRevalidationEvent, cache: CacheInvalidator): RevalidationTargets => {
  const targets = getBlogRevalidationTargets(event);

  for (const tag of targets.tags) cache.revalidateTag(tag, "max");
  for (const path of targets.paths) cache.revalidatePath(path);

  return targets;
};
