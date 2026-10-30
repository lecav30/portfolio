# Phase 5A: signed portfolio revalidation endpoint

## Result

The portfolio exposes a server-only, POST-only receiver at
`/api/internal/revalidate`. It authenticates compact CMS publication events
before invalidating the existing Payload fetch tags and affected blog paths.
No CMS hook, webhook sender, provider configuration, or public content behavior
was changed in this phase.

## Required environment

Set this server-only value independently in each deployment environment:

```text
BLOG_REVALIDATION_SECRET=<at-least-32-random-bytes>
```

The route fails closed with HTTP 503 when the value is absent, blank, or less
than 32 UTF-8 bytes. It is documented in `.env.example`, has no `NEXT_PUBLIC_`
prefix, and is never returned, logged, or included in a client bundle.

## Phase 5B webhook contract

### HTTP request

```text
POST /api/internal/revalidate
Content-Type: application/json; charset=utf-8
X-Blog-Revalidation-Timestamp: <10-digit Unix epoch seconds>
X-Blog-Revalidation-Signature: sha256=<64-lowercase-hex-characters>
```

The signing bytes are exactly the UTF-8 bytes of:

```text
<timestamp>.<raw request-body bytes>
```

The dot is literal. The CMS must serialize JSON once, sign those exact emitted
bytes with HMAC-SHA256 using `BLOG_REVALIDATION_SECRET`, and send those exact
bytes unchanged. It must not sign a parsed/reformatted JSON representation.

The receiver accepts timestamps at most 300 seconds old and at most 60 seconds
in the future. It accepts a maximum raw body size of 8 KiB, requires
`application/json`, and validates the HMAC with a length check plus
timing-safe comparison. It does not depend on Origin, CORS, query parameters,
or a browser cookie.

### Version 1 event body

```json
{
  "version": 1,
  "eventId": "11111111-1111-4111-8111-111111111111",
  "operation": "update",
  "post": {
    "id": 42,
    "slug": "slug-nueva",
    "categorySlug": "arquitectura-nueva",
    "previousSlug": "slug-anterior",
    "previousCategorySlug": "arquitectura-anterior"
  }
}
```

- `version` is the number `1`.
- `eventId` is a lowercase UUIDv4. It is retained for sender/receiver
  observability; this phase intentionally has no durable replay-event store.
  A correctly signed replay inside the timestamp window can cause only
  redundant invalidation.
- `operation` is exactly `publish`, `update`, `unpublish`, or `delete`.
- `post.id` is a positive safe integer.
- Every supplied slug must match lowercase `a-z`, digits, and single hyphens,
  and be at most 160 characters. Arrays, nulls, additional fields, unknown
  operations, and malformed identifiers are rejected.
- `publish` and `update` require `slug` and `categorySlug`.
- `unpublish` and `delete` require `previousSlug` and
  `previousCategorySlug`, because those are the last public locations.
- For `update`, include the previous fields whenever a slug or category changed.
  Omit them only when that value did not change.

The success response is `204 No Content`. Generic rejections are `401` for
timestamp/signature failures, `400` for signed but invalid JSON/schema, `413`
for an oversized body, `415` for a non-JSON content type, and `503` for missing
or weak receiver configuration. Undefined methods receive Next's `405` route
handler response.

### Secret rotation

Version 1 accepts one active secret. Rotate by deploying the portfolio receiver
with the new secret before configuring the CMS sender to use it, then retire the
old secret after the sender deployment is complete. Dual-secret acceptance is
not implemented because it is not needed before the CMS sender exists.

## Cache invalidation matrix

The existing CMS readers use these tags: `blog:posts`, `blog:categories`,
`blog:post:<slug>`, and `blog:category:<slug>`. The receiver calls
`revalidateTag(tag, "max")`, the installed Next 16 route-handler-compatible
API, and `revalidatePath` for the listed concrete paths.

| Event | Tags | Paths |
| --- | --- | --- |
| Publish | Generic posts/categories, current post/category tags | `/blog`, current post path, current category path |
| Update, unchanged URL/category | Generic posts/categories, current post/category tags | `/blog`, current post/category paths |
| Update, slug/category changed | Generic tags, current and previous post/category tags | `/blog`, current and previous post/category paths |
| Unpublish/Delete | Generic tags, previous post/category tags (and any supplied current tags) | `/blog`, previous post/category paths (and any supplied current paths) |

`updateTag` was not selected: the installed Next types state it is Server
Action-only. `revalidateTag(..., "max")` provides the documented stale-while-
revalidate profile. `revalidatePath` marks the route-handler paths for refresh
on the next visit; this phase does not claim an immediate global rerender.

There is no dynamic sitemap cache in the current portfolio: sitemap ownership
remains a static Phase 6 concern. Phase 6 must add sitemap-specific tag/path
coverage when it introduces CMS-backed sitemap/RSS/metadata routes.

The root layout still awaits `cookies()`, so blog pages are request-rendered.
This endpoint preserves the existing five-minute fetch fallback and does not
make any route static or implement preview behavior.

## Files changed

- `src/app/api/internal/revalidate/route.ts` — Node-runtime POST receiver and
  cache invocation.
- `src/services/blogRevalidation/**` — pure event contract, HMAC verification,
  bounded raw-body reader, and tag/path mapping reusable by tests.
- `scripts/validate-blog-revalidation.ts` — deterministic no-network contract
  and invalidation-target test.
- `.env.example`, `package.json`, and this report — operator contract and
  validation entry point.

## Validation matrix

| Check | Result | Evidence |
| --- | --- | --- |
| Valid HMAC/event and target mapping | PASS | Deterministic validator confirmed signature acceptance and exact generic/current/previous tags and paths. |
| Invalid signature/tampered body | PASS | Deterministic test rejected both. Local HTTP endpoint returned 401 for invalid and missing signatures. |
| Weak/missing secret | PASS (unit) | `hasStrongRevalidationSecret` rejects short and undefined values; the route returns 503 before reading a request. |
| Stale/future/malformed timestamp | PASS | Deterministic validator rejected all; local HTTP expired request returned 401. |
| Malformed, unsupported, invalid-slug body | PASS | Local signed requests returned 400. |
| Oversized body | PASS | Deterministic stream test and local HTTP request returned 413. |
| Content type / method | PASS | Local HTTP request returned 415 for text/plain and 405 for GET. |
| Local valid route invocation | PASS | Ephemeral loopback Next server used an in-memory disposable secret; valid signed request returned 204. |
| Published-only blog behavior | NOT RETESTED | No CMS/database fixture was created in Phase 5A; Phase 4B remains the live validation record. |

The local HTTP smoke test created no persistent secret or fixture and stopped its
temporary server automatically.

## Phase 5B handoff

The CMS sender must implement the contract above, source the same per-
environment secret, send only after a committed publication state change, and
retry bounded transient failures. It must capture current and previous public
slug/category values before mutation where required. It should log only event
IDs/statuses, never the secret or signature. Once implemented, test against a
non-production portfolio deployment with the final CMS origin and production
cache platform behavior.

## Git

The local commit containing this endpoint, tests, and report is recorded in the
final task handoff. No push is performed.
