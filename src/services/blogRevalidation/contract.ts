import { isSafeSlug } from "@services/cms/types";

export const BLOG_REVALIDATION_PATH = "/api/internal/revalidate";
export const BLOG_REVALIDATION_VERSION = 1;
export const MAX_REVALIDATION_BODY_BYTES = 8 * 1024;
export const MAX_REVALIDATION_AGE_SECONDS = 300;
export const MAX_REVALIDATION_FUTURE_SECONDS = 60;

export type BlogRevalidationOperation = "publish" | "update" | "unpublish" | "delete";

export type BlogRevalidationEvent = {
  eventId: string;
  operation: BlogRevalidationOperation;
  post: {
    categorySlug?: string;
    id: number;
    previousCategorySlug?: string;
    previousSlug?: string;
    slug?: string;
  };
  version: typeof BLOG_REVALIDATION_VERSION;
};

const eventIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const timestampPattern = /^[0-9]{10}$/;
const operations = new Set<BlogRevalidationOperation>(["publish", "update", "unpublish", "delete"]);

type RecordValue = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordValue =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasOnlyKeys = (value: RecordValue, keys: string[]): boolean =>
  Object.keys(value).every((key) => keys.includes(key));

const optionalSlug = (value: unknown): string | undefined | null => {
  if (value === undefined) return undefined;
  return isSafeSlug(value) && value.length <= 160 ? value : null;
};

export const parseBlogRevalidationEvent = (value: unknown): BlogRevalidationEvent | undefined => {
  if (!isRecord(value) || !hasOnlyKeys(value, ["version", "eventId", "operation", "post"])) return undefined;
  if (value.version !== BLOG_REVALIDATION_VERSION || typeof value.eventId !== "string" || !eventIdPattern.test(value.eventId)) {
    return undefined;
  }
  if (typeof value.operation !== "string" || !operations.has(value.operation as BlogRevalidationOperation) || !isRecord(value.post)) {
    return undefined;
  }
  if (!hasOnlyKeys(value.post, ["id", "slug", "categorySlug", "previousSlug", "previousCategorySlug"])) return undefined;

  const id = value.post.id;
  const slug = optionalSlug(value.post.slug);
  const categorySlug = optionalSlug(value.post.categorySlug);
  const previousSlug = optionalSlug(value.post.previousSlug);
  const previousCategorySlug = optionalSlug(value.post.previousCategorySlug);

  if (
    typeof id !== "number" ||
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    slug === null ||
    categorySlug === null ||
    previousSlug === null ||
    previousCategorySlug === null
  ) {
    return undefined;
  }

  const operation = value.operation as BlogRevalidationOperation;
  const requiresCurrentLocation = operation === "publish" || operation === "update";
  const requiresPreviousLocation = operation === "unpublish" || operation === "delete";

  if ((requiresCurrentLocation && (!slug || !categorySlug)) || (requiresPreviousLocation && (!previousSlug || !previousCategorySlug))) {
    return undefined;
  }

  return {
    eventId: value.eventId,
    operation,
    post: { categorySlug, id, previousCategorySlug, previousSlug, slug },
    version: BLOG_REVALIDATION_VERSION,
  };
};

export const validateRevalidationTimestamp = (value: string | null, now = Date.now()): string | undefined => {
  if (!value || !timestampPattern.test(value)) return undefined;

  const seconds = Number(value);
  const deltaSeconds = seconds - Math.floor(now / 1000);

  if (deltaSeconds > MAX_REVALIDATION_FUTURE_SECONDS || deltaSeconds < -MAX_REVALIDATION_AGE_SECONDS) {
    return undefined;
  }

  return value;
};
