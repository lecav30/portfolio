# Phase 4 public blog integration

## Summary

The portfolio now exposes server-rendered, read-only public routes:

- `/blog` — published-post listing, category navigation, bounded offset
  pagination, and a zero-post state.
- `/blog/[slug]` — published post detail with draft/missing protection,
  baseline metadata, cover image, category, tags, dates, and safe Lexical
  rendering.
- `/blog/category/[slug]` — category-specific published listing; an unknown
  category returns the blog 404 view.

All CMS reads are server-only anonymous REST requests. The portfolio does not
send an administrator token, Payload secret, R2 credential, or browser-side
CMS request. No CMS, database, Cloudflare, Vercel, or provider setting was
changed.

## Files changed

- `src/services/cms/types.ts` — explicit public projection types, runtime
  normalization, published-status guard, safe HTTP URL/slug checks, page
  parsing, and Payload query construction.
- `src/services/cms/client.ts` and `index.ts` — server-only REST boundary,
  five-second timeout, 2 MiB streaming response cap, controlled error class,
  five-minute explicit fetch cache, and future invalidation tags.
- `src/app/blog/**` — public App Router pages, route-specific metadata, and
  blog-scoped 404 behavior.
- `src/views/blog/**` — presentation shell, cards, category navigation,
  pagination, error/empty states, article layout, and safe Lexical renderer.
- `src/components/header/index.tsx` and `messages/*.json` — real `/blog`
  navigation while retaining working home-section navigation from blog pages.
- `.env.example` and `.gitignore` — documents server-only `PAYLOAD_CMS_URL`
  and ignores local `.env*` files while preserving the example.
- `scripts/validate-blog-contract.ts` and `package.json` — a repeatable mock
  contract validator and `typecheck` script.

`server-only@0.0.1` is an explicit dependency used to fail builds if the CMS
client is imported into a Client Component.

## CMS REST contract

The sibling CMS was inspected read-only. Its Payload collections/types confirm:

- Posts are `Posts` collection documents with native `_status`; the public CMS
  access rule constrains anonymous reads to `_status = published`.
- Categories and Tags expose `id`, `name`, and normalized unique `slug`.
- Posts include `title`, `slug`, optional `excerpt`, `content.root` Lexical
  JSON, `coverImage`, required `category`, `tags`, `contentType`,
  `publishedAt`, `updatedAt`, optional SEO fields, and `noIndex`.
- Media supplies public `url`, required `alt`, and optional dimensions. A
  relationship is either a populated object at `depth=2` or an ID; IDs are not
  rendered as media.

The portfolio requests these verified Payload REST shapes:

| Need | REST request contract |
| --- | --- |
| Listing | `GET /api/posts?depth=2&limit=9&page=<n>&sort=-publishedAt&where[_status][equals]=published` |
| Detail | Same Posts endpoint, plus `where[slug][equals]=<slug>` and `limit=9` |
| Category posts | Listing query plus `where[category][equals]=<category-id>` |
| Category discovery | `GET /api/categories?depth=0&limit=100&page=1&sort=name` |
| Category detail | Categories endpoint with `where[slug][equals]=<slug>` and `limit=1` |

Payload envelopes are normalized from `docs`, `page`, `totalDocs`, and
`totalPages`. The normalizer requires every rendered post to have
`_status: "published"`; a malformed/mixed envelope becomes an empty projection
instead of leaking a document count or draft. Missing/unpublished post slugs
therefore return 404 only after a successful CMS response. Timeout, malformed
response, non-2xx, bad configuration, and size-limit failures produce the
controlled unavailable state rather than a false 404.

The Lexical renderer never injects HTML. It allow-lists text, paragraphs,
headings, ordered/unordered lists, links, quotes, line breaks, and standard
Payload `upload` nodes when they contain a safe Media value. Unknown nodes only
render their safe child text. External links are restricted to HTTP(S), and
relative links cannot begin with `//`. A live CMS document with an embedded
upload block was not available, so that conventional Payload node shape remains
mock-validated rather than live-confirmed. Cover-image relationships are
confirmed in the CMS generated types.

## Caching and Phase 5 boundary

`src/app/layout.tsx` still awaits `cookies()`. With `cacheComponents` absent,
Next 16's previous cache model means blog route rendering is request-time. The
production build confirms all blog routes are dynamic (`ƒ`); no claim of static
generation or ISR HTML is made.

The CMS fetches explicitly use `cache: "force-cache"` and
`next: { revalidate: 300, tags }`, so successful CMS data remains bounded and
cacheable despite that parent request-time API. Tags are:

- `blog:posts`
- `blog:post:<slug>`
- `blog:categories`
- `blog:category:<slug>`

This gives a maximum normal freshness window of five minutes, subject to the
platform cache behavior. No webhook/revalidation route exists in this phase.
Phase 5 must add a signed, timestamped receiver and invalidate the generic and
specific tags plus affected paths; it must also account for prior slug/category
values when content moves or becomes unpublished.

## Images, environment, and local operation

Set only the server-side origin in an ignored local environment file or Vercel
environment configuration:

```text
PAYLOAD_CMS_URL=http://127.0.0.1:3011
```

Use the deployed CMS origin per environment later. Do not use a `NEXT_PUBLIC_`
name and do not add credentials for this public published-only API. The example
contains no secret.

Media URLs are accepted only when they are HTTP(S), have a required CMS alt
text, and are rendered with native responsive `<img>` elements. This avoids
hardcoding the currently non-production R2 development hostname into
`next/image` configuration. Bind `media.sebastianlevano.com` first, then add a
least-privilege `images.remotePatterns` entry and test optimization as a future
deployment/SEO change.

Spanish is the canonical public blog UI and content assumption. The existing
locale cookie still changes portfolio chrome, but it does not select a different
article or canonical blog URL. English blog routing and `hreflang` remain a
future content-model decision.

## Validation

| Check | Result | Evidence |
| --- | --- | --- |
| Frozen install | PASS | `bun install --frozen-lockfile` checked 419 installs / 527 packages with no changes. |
| CMS contract validator | PASS | `bun run validate:blog-contract` covered published projection, draft isolation/count suppression, category normalization, pagination/category/slug query formation, page bounds, and unsafe URL rejection. |
| TypeScript | PASS | `bun run typecheck`. |
| Lint | PASS with existing warning | `bun run lint`; the only warning is pre-existing `src/hooks/useProjects.tsx` missing `projects` dependency. |
| Production build | PASS | `PAYLOAD_CMS_URL=http://127.0.0.1:9 bun run build`; build was intentionally not a live CMS check and reported every blog route dynamic. |
| Mocked SSR smoke test | PASS | A temporary loopback Payload-shaped mock verified `/blog`, page 2, published detail, category list, empty category, partial-media fallback, draft/missing 404s, unknown-category 404, and controlled upstream-error UI. The temporary server and HTML fixtures were removed. |
| Read-only live CMS REST smoke test | BLOCKED | The sibling CMS was not running on local ports 3000 or 3011, and local portfolio `PAYLOAD_CMS_URL` was not configured. No fixture content was created. |
| Production media hostname/optimization | BLOCKED | `media.sebastianlevano.com` is not yet bound; native images deliberately avoid an unverified hostname allow-list. |

## Deferred work and risks

- Phase 5: signed CMS webhook, tag/path invalidation, timestamp/replay policy,
  and end-to-end preview/production cache validation.
- Phase 6: complete canonical/OG/Twitter/JSON-LD strategy, sitemap/robots
  ownership migration, RSS, and post image metadata.
- Phase 7: explicitly configured advanced Lexical blocks, code syntax
  highlighting, math, and further rich-content rendering tests.
- Deployment: configure an environment-specific CMS origin, start/populate the
  CMS with intentionally published content, bind the production media hostname,
  and perform read-only live portfolio/CMS smoke tests.

## Git

The local commit containing this implementation and report is recorded in the
final task handoff. No push is performed.
