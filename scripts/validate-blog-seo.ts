import type { BlogPost } from "../src/services/cms/types";
import {
  createBlogPostingJsonLd,
  createBlogSitemapEntries,
  createBreadcrumbJsonLd,
  createRssXml,
  getBlogIndexMetadata,
  getPostCanonicalUrl,
  getPostMetadata,
  serializeJsonLd,
} from "../src/services/blog/seo";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const post: BlogPost = {
  canonicalUrl: "https://www.sebastianlevano.com/blog/arquitectura-canonica",
  category: { id: 7, name: "Arquitectura & plataformas", slug: "arquitectura" },
  content: { type: "root" },
  contentType: "article",
  coverImage: { alt: "Diagrama <seguro>", url: "https://media.example.test/media/diagram.png" },
  excerpt: "Resumen con <caracteres> & comillas \"seguras\".",
  id: 42,
  noIndex: false,
  publishedAt: "2026-10-01T12:00:00.000Z",
  seoDescription: "Descripción SEO con <caracteres> & comillas \"seguras\".",
  seoTitle: "Título SEO seguro",
  slug: "arquitectura-resiliente",
  tags: [{ id: 9, name: "Next.js", slug: "nextjs" }],
  title: "Título </script><script>alert(1)</script>",
  updatedAt: "2026-10-02T12:00:00.000Z",
};

const noIndexPost: BlogPost = { ...post, id: 43, noIndex: true, slug: "privado-publicado", title: "No index" };
const unsafeCanonicalPost: BlogPost = { ...post, canonicalUrl: "https://attacker.example/blog/forged" };
const trailingSlashCanonicalPost: BlogPost = { ...post, canonicalUrl: "https://www.sebastianlevano.com/blog/arquitectura-resiliente/" };

assert(
  getPostCanonicalUrl(post) === "https://www.sebastianlevano.com/blog/arquitectura-canonica",
  "Same-origin HTTPS canonical override should be honored.",
);
assert(
  getPostCanonicalUrl(unsafeCanonicalPost) === "https://www.sebastianlevano.com/blog/arquitectura-resiliente",
  "Cross-origin canonical override should be ignored.",
);
assert(
  getPostCanonicalUrl(trailingSlashCanonicalPost) === "https://www.sebastianlevano.com/blog/arquitectura-resiliente",
  "Trailing-slash canonical override should be ignored.",
);

const metadata = getPostMetadata(post);
assert(metadata.title === post.seoTitle, "SEO title should be preferred in metadata.");
assert(metadata.description === post.seoDescription, "SEO description should be preferred in metadata.");
assert(JSON.stringify(metadata.alternates).includes("blog/rss.xml"), "RSS discovery link is missing from article metadata.");
const paginatedRobots = getBlogIndexMetadata(2).robots;
assert(
  typeof paginatedRobots === "object" && paginatedRobots !== null && !Array.isArray(paginatedRobots) && paginatedRobots.index === false,
  "Paginated indexes must be noindex.",
);

const jsonLd = serializeJsonLd([createBlogPostingJsonLd(post), createBreadcrumbJsonLd([{ name: "Blog", path: "/blog" }])]);
assert(!jsonLd.includes("</script>"), "JSON-LD serialization must escape script delimiters.");
assert(jsonLd.includes("\\u003c"), "JSON-LD serialization should escape angle brackets.");

const sitemap = createBlogSitemapEntries([post, noIndexPost]);
assert(sitemap.some((entry) => entry.url.endsWith("/blog/arquitectura-canonica")), "Indexable canonical post is missing from sitemap.");
assert(!sitemap.some((entry) => entry.url.includes("privado-publicado")), "noIndex post leaked into sitemap.");
assert(sitemap.filter((entry) => entry.url.includes("/blog/category/arquitectura")).length === 1, "Category sitemap entries should be unique.");
assert(
  createBlogSitemapEntries([post, { ...post, id: 44, slug: "duplicado" }]).filter((entry) => entry.url.endsWith("/blog/arquitectura-canonica")).length === 1,
  "Canonical sitemap URLs should be unique.",
);

const rss = createRssXml([post, noIndexPost]);
assert(rss.includes("application/rss+xml"), "RSS self link is missing.");
assert(rss.includes("&lt;caracteres&gt; &amp;"), "RSS text must be XML escaped.");
assert(!rss.includes("privado-publicado"), "noIndex post leaked into RSS.");
assert(!rss.includes("</script><script>"), "RSS title was not escaped.");

console.log("blog_seo_validation=pass");
