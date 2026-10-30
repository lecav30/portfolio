import {
  BLOG_PAGE_SIZE,
  createPostQuery,
  normalizeCategoryList,
  normalizePostList,
  parseBlogPage,
  toSafeHttpUrl,
} from "../src/services/cms/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const category = {
  createdAt: "2026-01-01T00:00:00.000Z",
  id: 7,
  name: "Arquitectura",
  slug: "arquitectura",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const publishedPost = {
  _status: "published",
  category,
  content: {
    root: {
      children: [
        {
          children: [{ text: "Contenido publicado.", type: "text", version: 1 }],
          type: "paragraph",
          version: 1,
        },
      ],
      type: "root",
      version: 1,
    },
  },
  contentType: "article",
  coverImage: {
    alt: "Diagrama de arquitectura",
    height: 675,
    id: 11,
    url: "https://media.example.test/media/diagram.png",
    width: 1200,
  },
  id: 42,
  canonicalUrl: "https://www.sebastianlevano.com/blog/arquitectura-resiliente",
  noIndex: false,
  publishedAt: "2026-10-01T12:00:00.000Z",
  slug: "arquitectura-resiliente",
  tags: [{ id: 9, name: "Next.js", slug: "nextjs" }],
  title: "Arquitectura resiliente",
  updatedAt: "2026-10-02T12:00:00.000Z",
};

const publishedList = normalizePostList({
  docs: [publishedPost],
  page: 2,
  totalDocs: 10,
  totalPages: 2,
});
assert(publishedList.docs.length === 1, "Published post should be normalized.");
assert(publishedList.docs[0]?.coverImage?.url === publishedPost.coverImage.url, "Public Media URL should survive normalization.");
assert(publishedList.docs[0]?.canonicalUrl === publishedPost.canonicalUrl, "Canonical URL should survive normalization.");
assert(publishedList.page === 2 && publishedList.totalPages === 2, "Pagination metadata should be retained for valid public results.");

const draftList = normalizePostList({
  docs: [{ ...publishedPost, _status: "draft" }],
  page: 1,
  totalDocs: 1,
  totalPages: 1,
});
assert(draftList.docs.length === 0 && draftList.totalDocs === 0, "Draft data or its count must not reach the public projection.");

const categoryList = normalizeCategoryList({ docs: [category], page: 1, totalDocs: 1, totalPages: 1 });
assert(categoryList.docs[0]?.slug === "arquitectura", "Category slug should be retained.");

const query = createPostQuery({ categoryID: category.id, page: 2, slug: publishedPost.slug });
assert(query.get("page") === "2" && query.get("limit") === String(BLOG_PAGE_SIZE), "Post pagination query is incorrect.");
assert(query.get("where[_status][equals]") === "published", "Published status filter is required.");
assert(query.get("where[category][equals]") === "7", "Category filter is required.");
assert(query.get("where[slug][equals]") === publishedPost.slug, "Slug filter is required.");
assert(createPostQuery({ limit: 100, page: 1 }).get("limit") === "100", "Discovery pagination limit is incorrect.");

assert(parseBlogPage("3") === 3 && parseBlogPage("0") === 1 && parseBlogPage(["2", "3"]) === 2, "Page parsing is unsafe.");
assert(toSafeHttpUrl("javascript:alert(1)") === undefined, "Unsafe URLs must be rejected.");
assert(toSafeHttpUrl("https://media.example.test/image.png"), "HTTPS Media URL should be accepted.");

console.log("blog_contract_validation=pass");
