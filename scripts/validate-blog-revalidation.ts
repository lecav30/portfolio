import { invalidateBlogCaches } from "../src/services/blogRevalidation/cache";
import {
  BLOG_REVALIDATION_VERSION,
  MAX_REVALIDATION_BODY_BYTES,
  parseBlogRevalidationEvent,
  validateRevalidationTimestamp,
} from "../src/services/blogRevalidation/contract";
import {
  hasStrongRevalidationSecret,
  signRevalidationBody,
  verifyRevalidationSignature,
} from "../src/services/blogRevalidation/crypto";
import { readRawRevalidationBody, RevalidationBodyTooLargeError } from "../src/services/blogRevalidation/request";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const secret = "0123456789abcdef0123456789abcdef";
const timestamp = String(Math.floor(Date.now() / 1000));
const validPayload = {
  eventId: "11111111-1111-4111-8111-111111111111",
  operation: "update",
  post: {
    categorySlug: "arquitectura-nueva",
    id: 42,
    previousCategorySlug: "arquitectura-anterior",
    previousSlug: "slug-anterior",
    slug: "slug-nueva",
  },
  version: BLOG_REVALIDATION_VERSION,
};
const body = new TextEncoder().encode(JSON.stringify(validPayload));
const event = parseBlogRevalidationEvent(validPayload);

assert(event, "Valid revalidation event was rejected.");
assert(hasStrongRevalidationSecret(secret), "Strong secret was rejected.");
assert(!hasStrongRevalidationSecret("short"), "Weak secret was accepted.");
assert(!hasStrongRevalidationSecret(" ".repeat(32)), "Whitespace-only secret was accepted.");
assert(!hasStrongRevalidationSecret(undefined), "Missing secret was accepted.");

const signature = signRevalidationBody(secret, timestamp, body);
assert(verifyRevalidationSignature({ body, secret, signature, timestamp }), "Valid signature was rejected.");
assert(!verifyRevalidationSignature({ body, secret, signature: "sha256=" + "0".repeat(64), timestamp }), "Invalid signature was accepted.");
assert(
  !verifyRevalidationSignature({ body: new TextEncoder().encode("tampered"), secret, signature, timestamp }),
  "Tampered body was accepted.",
);
assert(validateRevalidationTimestamp(timestamp, Number(timestamp) * 1000), "Current timestamp was rejected.");
assert(!validateRevalidationTimestamp(String(Number(timestamp) - 301), Number(timestamp) * 1000), "Expired timestamp was accepted.");
assert(!validateRevalidationTimestamp(String(Number(timestamp) + 61), Number(timestamp) * 1000), "Future timestamp was accepted.");
assert(!validateRevalidationTimestamp("not-a-timestamp"), "Malformed timestamp was accepted.");

assert(!parseBlogRevalidationEvent({ ...validPayload, operation: "preview" }), "Unknown operation was accepted.");
assert(
  !parseBlogRevalidationEvent({ ...validPayload, post: { ...validPayload.post, previousSlug: "INVALID SLUG" } }),
  "Invalid previous slug was accepted.",
);
assert(
  !parseBlogRevalidationEvent({ ...validPayload, operation: "delete", post: { id: 42 } }),
  "Deletion without prior location was accepted.",
);

const tags: string[] = [];
const paths: string[] = [];
invalidateBlogCaches(event, {
  revalidatePath: (path) => paths.push(path),
  revalidateTag: (tag) => tags.push(tag),
});
assert(
  JSON.stringify(tags) ===
    JSON.stringify([
      "blog:posts",
      "blog:categories",
      "blog:post:slug-nueva",
      "blog:post:slug-anterior",
      "blog:category:arquitectura-nueva",
      "blog:category:arquitectura-anterior",
    ]),
  "Targeted cache tags were incorrect.",
);
assert(
  JSON.stringify(paths) ===
    JSON.stringify([
      "/blog",
      "/blog/slug-nueva",
      "/blog/slug-anterior",
      "/blog/category/arquitectura-nueva",
      "/blog/category/arquitectura-anterior",
    ]),
  "Targeted paths were incorrect.",
);

try {
  await readRawRevalidationBody(
    new Request("http://localhost", {
      body: new Uint8Array(MAX_REVALIDATION_BODY_BYTES + 1),
      headers: { "content-type": "application/json" },
      method: "POST",
    }),
  );
  throw new Error("Oversized body was accepted.");
} catch (error) {
  assert(error instanceof RevalidationBodyTooLargeError, "Oversized body returned the wrong error.");
}

console.log("blog_revalidation_validation=pass");
