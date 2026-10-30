export const BLOG_PAGE_SIZE = 9;

export type BlogCategory = {
  description?: string;
  id: number;
  name: string;
  slug: string;
};

export type BlogMedia = {
  alt: string;
  height?: number;
  url: string;
  width?: number;
};

export type LexicalNode = {
  children?: LexicalNode[];
  fields?: Record<string, unknown>;
  format?: number | string;
  listType?: string;
  tag?: string;
  text?: string;
  type: string;
  url?: string;
  value?: unknown;
};

export type BlogPost = {
  canonicalUrl?: string;
  category: BlogCategory;
  content: LexicalNode;
  contentType: "tutorial" | "review" | "opinion" | "news" | "article";
  coverImage?: BlogMedia;
  excerpt?: string;
  id: number;
  noIndex: boolean;
  publishedAt?: string;
  seoDescription?: string;
  seoTitle?: string;
  slug: string;
  tags: BlogTag[];
  title: string;
  updatedAt?: string;
};

export type BlogTag = {
  id: number;
  name: string;
  slug: string;
};

export type Paginated<T> = {
  docs: T[];
  page: number;
  totalDocs: number;
  totalPages: number;
};

type RecordValue = Record<string, unknown>;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const contentTypes = new Set<BlogPost["contentType"]>([
  "tutorial",
  "review",
  "opinion",
  "news",
  "article",
]);

const isRecord = (value: unknown): value is RecordValue =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asFiniteNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const asNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const asDateString = (value: unknown): string | undefined => {
  const date = asNonEmptyString(value);
  return date && !Number.isNaN(Date.parse(date)) ? date : undefined;
};

export const isSafeSlug = (value: unknown): value is string =>
  typeof value === "string" && slugPattern.test(value);

export const toSafeHttpUrl = (value: unknown): string | undefined => {
  const url = asNonEmptyString(value);
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.toString()
      : undefined;
  } catch {
    return undefined;
  }
};

const normalizeLexicalNode = (value: unknown): LexicalNode | undefined => {
  if (!isRecord(value) || typeof value.type !== "string") return undefined;

  const children = Array.isArray(value.children)
    ? value.children
        .map(normalizeLexicalNode)
        .filter((child): child is LexicalNode => Boolean(child))
    : undefined;

  return {
    children,
    fields: isRecord(value.fields) ? value.fields : undefined,
    format:
      typeof value.format === "number" || typeof value.format === "string"
        ? value.format
        : undefined,
    listType: typeof value.listType === "string" ? value.listType : undefined,
    tag: typeof value.tag === "string" ? value.tag : undefined,
    text: typeof value.text === "string" ? value.text : undefined,
    type: value.type,
    url: typeof value.url === "string" ? value.url : undefined,
    value: value.value,
  };
};

const normalizeCategory = (value: unknown): BlogCategory | undefined => {
  if (!isRecord(value)) return undefined;

  const id = asFiniteNumber(value.id);
  const name = asNonEmptyString(value.name);
  const slug = value.slug;

  if (id === undefined || !name || !isSafeSlug(slug)) return undefined;

  return {
    description: asNonEmptyString(value.description),
    id,
    name,
    slug,
  };
};

const normalizeTag = (value: unknown): BlogTag | undefined => {
  if (!isRecord(value)) return undefined;

  const id = asFiniteNumber(value.id);
  const name = asNonEmptyString(value.name);
  const slug = value.slug;

  return id !== undefined && name && isSafeSlug(slug) ? { id, name, slug } : undefined;
};

const normalizeMedia = (value: unknown): BlogMedia | undefined => {
  if (!isRecord(value)) return undefined;

  const alt = asNonEmptyString(value.alt);
  const url = toSafeHttpUrl(value.url);

  if (!alt || !url) return undefined;

  return {
    alt,
    height: asFiniteNumber(value.height),
    url,
    width: asFiniteNumber(value.width),
  };
};

export const normalizePost = (value: unknown): BlogPost | undefined => {
  if (!isRecord(value) || value._status !== "published") return undefined;

  const id = asFiniteNumber(value.id);
  const title = asNonEmptyString(value.title);
  const slug = value.slug;
  const category = normalizeCategory(value.category);
  const content = normalizeLexicalNode(isRecord(value.content) ? value.content.root : undefined);
  const contentType = value.contentType;

  if (
    id === undefined ||
    !title ||
    !isSafeSlug(slug) ||
    !category ||
    !content ||
    content.type !== "root" ||
    !contentTypes.has(contentType as BlogPost["contentType"])
  ) {
    return undefined;
  }

  return {
    canonicalUrl: toSafeHttpUrl(value.canonicalUrl),
    category,
    content,
    contentType: contentType as BlogPost["contentType"],
    coverImage: normalizeMedia(value.coverImage),
    excerpt: asNonEmptyString(value.excerpt),
    id,
    noIndex: value.noIndex === true,
    publishedAt: asDateString(value.publishedAt),
    seoDescription: asNonEmptyString(value.seoDescription),
    seoTitle: asNonEmptyString(value.seoTitle),
    slug,
    tags: Array.isArray(value.tags)
      ? value.tags
          .map(normalizeTag)
          .filter((tag): tag is BlogTag => Boolean(tag))
      : [],
    title,
    updatedAt: asDateString(value.updatedAt),
  };
};

const normalizePagination = <T>(value: unknown, normalizer: (document: unknown) => T | undefined): Paginated<T> => {
  if (!isRecord(value) || !Array.isArray(value.docs)) {
    throw new Error("The CMS response did not contain a document list.");
  }

  const docs = value.docs
    .map(normalizer)
    .filter((document): document is T => Boolean(document));

  // Never use an untrusted total as a side channel when any returned document
  // failed the public projection checks (for example, an unexpected draft).
  if (docs.length !== value.docs.length) {
    return { docs: [], page: 1, totalDocs: 0, totalPages: 0 };
  }

  const page = Math.max(1, asFiniteNumber(value.page) ?? 1);
  const totalDocs = Math.max(0, asFiniteNumber(value.totalDocs) ?? docs.length);
  const totalPages = Math.max(0, asFiniteNumber(value.totalPages) ?? (totalDocs ? 1 : 0));

  return { docs, page, totalDocs, totalPages };
};

export const normalizePostList = (value: unknown): Paginated<BlogPost> =>
  normalizePagination(value, normalizePost);

export const normalizeCategoryList = (value: unknown): Paginated<BlogCategory> =>
  normalizePagination(value, normalizeCategory);

export const parseBlogPage = (value: string | string[] | undefined): number => {
  const candidate = Array.isArray(value) ? value[0] : value;
  const page = Number(candidate);

  return Number.isInteger(page) && page > 0 && page <= 10000 ? page : 1;
};

export const createPostQuery = ({
  categoryID,
  limit = BLOG_PAGE_SIZE,
  page,
  slug,
}: {
  categoryID?: number;
  limit?: number;
  page: number;
  slug?: string;
}): URLSearchParams => {
  const query = new URLSearchParams({
    depth: "2",
    limit: String(limit),
    page: String(page),
    sort: "-publishedAt",
    "where[_status][equals]": "published",
  });

  if (categoryID !== undefined) query.set("where[category][equals]", String(categoryID));
  if (slug) query.set("where[slug][equals]", slug);

  return query;
};
