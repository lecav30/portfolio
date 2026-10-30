import type { MetadataRoute } from "next";

import { listAllPublishedPosts } from "@services/cms";
import { createBlogSitemapEntries } from "@services/blog/seo";

// CMS-backed metadata must be requested at runtime; its underlying published
// REST fetch remains explicitly cached and receives the existing blog tags.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    return createBlogSitemapEntries(await listAllPublishedPosts());
  } catch {
    // Keep the canonical portfolio/blog roots discoverable without inventing
    // post or category URLs when the anonymous CMS is unavailable.
    return createBlogSitemapEntries([]);
  }
}
