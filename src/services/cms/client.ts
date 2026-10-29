import "server-only";

import {
  createPostQuery,
  type BlogCategory,
  type BlogPost,
  isSafeSlug,
  normalizeCategoryList,
  normalizePostList,
  type Paginated,
} from "./types";

const CMS_TIMEOUT_MS = 5000;
const CMS_MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const CMS_REVALIDATE_SECONDS = 300;

export class CmsUnavailableError extends Error {
  constructor() {
    super("The CMS is unavailable.");
    this.name = "CmsUnavailableError";
  }
}

const getCmsOrigin = (): string => {
  const value = process.env.PAYLOAD_CMS_URL;

  if (!value) throw new CmsUnavailableError();

  try {
    const url = new URL(value);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password ||
      (url.pathname !== "/" && url.pathname !== "") ||
      url.search ||
      url.hash
    ) {
      throw new Error("Invalid CMS origin");
    }

    return url.origin;
  } catch {
    throw new CmsUnavailableError();
  }
};

const readJsonWithLimit = async (response: Response): Promise<unknown> => {
  const advertisedLength = Number(response.headers.get("content-length"));

  if (Number.isFinite(advertisedLength) && advertisedLength > CMS_MAX_RESPONSE_BYTES) {
    throw new CmsUnavailableError();
  }

  const reader = response.body?.getReader();
  if (!reader) throw new CmsUnavailableError();

  const chunks: Uint8Array[] = [];
  let length = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      length += value.byteLength;
      if (length > CMS_MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new CmsUnavailableError();
      }

      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof CmsUnavailableError) throw error;
    throw new CmsUnavailableError();
  }

  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(body));
  } catch {
    throw new CmsUnavailableError();
  }
};

const request = async (path: string, query: URLSearchParams, tags: string[]): Promise<unknown> => {
  const url = new URL(path, getCmsOrigin());
  url.search = query.toString();

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "force-cache",
      headers: { accept: "application/json" },
      next: { revalidate: CMS_REVALIDATE_SECONDS, tags },
      signal: AbortSignal.timeout(CMS_TIMEOUT_MS),
    });
  } catch {
    throw new CmsUnavailableError();
  }

  if (!response.ok) throw new CmsUnavailableError();
  return readJsonWithLimit(response);
};

const normalizeResponse = <T>(operation: () => T): T => {
  try {
    return operation();
  } catch {
    throw new CmsUnavailableError();
  }
};

export const listPublishedPosts = async ({
  category,
  page,
}: {
  category?: BlogCategory;
  page: number;
}): Promise<Paginated<BlogPost>> => {
  const response = await request(
    "/api/posts",
    createPostQuery({ categoryID: category?.id, page }),
    category ? ["blog:posts", `blog:category:${category.slug}`] : ["blog:posts"],
  );

  return normalizeResponse(() => normalizePostList(response));
};

export const findPublishedPost = async (slug: string): Promise<BlogPost | undefined> => {
  if (!isSafeSlug(slug)) return undefined;

  const response = await request(
    "/api/posts",
    createPostQuery({ page: 1, slug }),
    ["blog:posts", `blog:post:${slug}`],
  );
  const posts = normalizeResponse(() => normalizePostList(response));

  return posts.docs[0];
};

export const listCategories = async (): Promise<BlogCategory[]> => {
  const response = await request(
    "/api/categories",
    new URLSearchParams({ depth: "0", limit: "100", page: "1", sort: "name" }),
    ["blog:categories"],
  );

  return normalizeResponse(() => normalizeCategoryList(response).docs);
};

export const findCategory = async (slug: string): Promise<BlogCategory | undefined> => {
  if (!isSafeSlug(slug)) return undefined;

  const response = await request(
    "/api/categories",
    new URLSearchParams({
      depth: "0",
      limit: "1",
      page: "1",
      "where[slug][equals]": slug,
    }),
    ["blog:categories", `blog:category:${slug}`],
  );

  return normalizeResponse(() => normalizeCategoryList(response).docs[0]);
};
