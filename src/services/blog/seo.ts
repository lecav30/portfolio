import type { Metadata } from "next";

import type { BlogCategory, BlogPost } from "@services/cms";

export const SITE_URL = "https://www.sebastianlevano.com";
export const RSS_PATH = "/blog/rss.xml";

const siteOrigin = new URL(SITE_URL);
const defaultBlogDescription = "Artículos técnicos, tutoriales, opiniones, reviews y noticias de Sebastian Lévano.";

const validDate = (value: string | undefined): Date | undefined => {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const publicUrl = (path: string): string => new URL(path, siteOrigin).toString();

const pagePath = (path: string, page: number): string => (page > 1 ? `${path}?page=${page}` : path);

const rssAlternates = {
  types: {
    "application/rss+xml": [{ title: "RSS del blog técnico de Sebastian Lévano", url: publicUrl(RSS_PATH) }],
  },
};

const sameOriginCanonical = (value: string | undefined): string | undefined => {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.origin !== siteOrigin.origin ||
      !url.pathname.startsWith("/blog/") ||
      url.pathname.endsWith("/") ||
      url.search ||
      url.hash
    ) {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
};

export const getPostCanonicalUrl = (post: BlogPost): string =>
  sameOriginCanonical(post.canonicalUrl) ?? publicUrl(`/blog/${post.slug}`);

export const getPostTitle = (post: BlogPost): string => post.seoTitle ?? `${post.title} | Blog técnico | Sebastian Lévano`;

export const getPostDescription = (post: BlogPost): string =>
  post.seoDescription ?? post.excerpt ?? `Artículo técnico: ${post.title}.`;

const socialImage = (post: BlogPost) =>
  post.coverImage
    ? [{ alt: post.coverImage.alt, height: post.coverImage.height, url: post.coverImage.url, width: post.coverImage.width }]
    : undefined;

export const getBlogIndexMetadata = (page: number): Metadata => {
  const canonical = publicUrl(pagePath("/blog", page));
  const isPaginated = page > 1;
  const title = isPaginated ? `Blog técnico — página ${page} | Sebastian Lévano` : "Blog técnico | Sebastian Lévano";

  return {
    alternates: { canonical, ...rssAlternates },
    description: defaultBlogDescription,
    openGraph: { description: defaultBlogDescription, locale: "es_PE", siteName: "Sebastian Lévano", title, type: "website", url: canonical },
    robots: isPaginated ? { follow: true, index: false } : undefined,
    title,
    twitter: { card: "summary", description: defaultBlogDescription, title },
  };
};

export const getCategoryMetadata = (category: BlogCategory, page: number): Metadata => {
  const path = `/blog/category/${category.slug}`;
  const canonical = publicUrl(pagePath(path, page));
  const isPaginated = page > 1;
  const description = category.description ?? `Artículos técnicos publicados en la categoría ${category.name}.`;
  const title = isPaginated
    ? `${category.name} — página ${page} | Blog técnico | Sebastian Lévano`
    : `${category.name} | Blog técnico | Sebastian Lévano`;

  return {
    alternates: { canonical, ...rssAlternates },
    description,
    openGraph: { description, locale: "es_PE", siteName: "Sebastian Lévano", title, type: "website", url: canonical },
    robots: isPaginated ? { follow: true, index: false } : undefined,
    title,
    twitter: { card: "summary", description, title },
  };
};

export const getPostMetadata = (post: BlogPost): Metadata => {
  const canonical = getPostCanonicalUrl(post);
  const description = getPostDescription(post);
  const title = getPostTitle(post);
  const images = socialImage(post);

  return {
    alternates: { canonical, ...rssAlternates },
    description,
    openGraph: {
      description,
      images,
      locale: "es_PE",
      modifiedTime: post.updatedAt,
      publishedTime: post.publishedAt,
      siteName: "Sebastian Lévano",
      title,
      type: "article",
      url: canonical,
    },
    robots: post.noIndex ? { follow: true, index: false } : undefined,
    title,
    twitter: { card: images ? "summary_large_image" : "summary", description, images, title },
  };
};

export const createBlogPostingJsonLd = (post: BlogPost): Record<string, unknown> => {
  const image = post.coverImage?.url;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    articleSection: post.category.name,
    dateModified: post.updatedAt,
    datePublished: post.publishedAt,
    description: getPostDescription(post),
    headline: post.title,
    image,
    inLanguage: "es",
    keywords: post.tags.length ? post.tags.map((tag) => tag.name).join(", ") : undefined,
    mainEntityOfPage: { "@id": getPostCanonicalUrl(post), "@type": "WebPage" },
    url: getPostCanonicalUrl(post),
  };
};

export const createBreadcrumbJsonLd = (
  items: Array<{ name: string; path: string }>,
): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    item: publicUrl(item.path),
    name: item.name,
    position: index + 1,
  })),
});

export const serializeJsonLd = (value: unknown): string =>
  JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "\\u0026",
      "<": "\\u003c",
      ">": "\\u003e",
      "\u2028": "\\u2028",
      "\u2029": "\\u2029",
    };

    return replacements[character] ?? character;
  });

export type SitemapEntry = {
  changeFrequency: "daily" | "weekly";
  lastModified?: Date;
  priority: number;
  url: string;
};

export const createBlogSitemapEntries = (posts: BlogPost[]): SitemapEntry[] => {
  const canonicalUrls = new Set<string>();
  const indexablePosts = posts.filter((post) => {
    if (post.noIndex) return false;

    const canonical = getPostCanonicalUrl(post);
    if (canonicalUrls.has(canonical)) return false;
    canonicalUrls.add(canonical);
    return true;
  });
  const categories = new Map<string, { category: BlogCategory; lastModified?: Date }>();

  for (const post of indexablePosts) {
    const current = categories.get(post.category.slug);
    const postDate = validDate(post.updatedAt) ?? validDate(post.publishedAt);
    if (!current || (postDate && (!current.lastModified || postDate > current.lastModified))) {
      categories.set(post.category.slug, { category: post.category, lastModified: postDate });
    }
  }

  return [
    { changeFrequency: "weekly", priority: 1, url: publicUrl("/") },
    { changeFrequency: "daily", priority: 0.8, url: publicUrl("/blog") },
    ...[...categories.values()].map(({ category, lastModified }) => ({
      changeFrequency: "weekly" as const,
      lastModified,
      priority: 0.6,
      url: publicUrl(`/blog/category/${category.slug}`),
    })),
    ...indexablePosts.map((post) => ({
      changeFrequency: "weekly" as const,
      lastModified: validDate(post.updatedAt) ?? validDate(post.publishedAt),
      priority: 0.7,
      url: getPostCanonicalUrl(post),
    })),
  ];
};

const escapeXml = (value: string): string =>
  value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const createRssXml = (posts: BlogPost[]): string => {
  const items = posts
    .filter((post) => !post.noIndex)
    .sort((left, right) => (validDate(right.publishedAt)?.getTime() ?? 0) - (validDate(left.publishedAt)?.getTime() ?? 0))
    .slice(0, 100)
    .map((post) => {
      const link = getPostCanonicalUrl(post);
      const description = escapeXml(getPostDescription(post));
      const publishedAt = validDate(post.publishedAt) ?? validDate(post.updatedAt);

      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${escapeXml(link)}</link>`,
        `<guid isPermaLink=\"true\">${escapeXml(link)}</guid>`,
        `<description>${description}</description>`,
        `<category>${escapeXml(post.category.name)}</category>`,
        publishedAt ? `<pubDate>${publishedAt.toUTCString()}</pubDate>` : "",
        "</item>",
      ].join("");
    });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    "<title>Blog técnico de Sebastian Lévano</title>",
    `<link>${SITE_URL}/blog</link>`,
    `<description>${escapeXml(defaultBlogDescription)}</description>`,
    `<language>es-PE</language>`,
    `<atom:link href="${publicUrl(RSS_PATH)}" rel="self" type="application/rss+xml" />`,
    ...items,
    "</channel>",
    "</rss>",
  ].join("");
};
