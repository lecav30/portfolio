# Phase 6 — Blog technical SEO

## Result

**READY for Phase 7 / local Phase 6 handoff.** The portfolio now owns one
server-rendered SEO surface for public blog content: route metadata, JSON-LD,
`/sitemap.xml`, `/robots.txt`, and `/blog/rss.xml`. No CMS, deployment, DNS, or
provider resource was changed.

## Existing SEO inventory and ownership migration

Before this phase the root layout supplied `metadataBase`, portfolio metadata,
root canonical, Open Graph fields, and a Google verification token. A static
`next-sitemap` postbuild generated public `robots.txt` and sitemap files. That
approach could not fetch the published-only CMS safely at request time and would
conflict with App Router metadata routes.

This phase removes `next-sitemap`, its config, generated public robots/sitemap
artifacts, and the global Vercel `X-Robots-Tag: index, follow` header. The
global header had to be removed because it would override an individual CMS
article's `noIndex` metadata. The root layout branding, metadata base, root
canonical, icon, and verification remain intact.

## Route policy

| Route | Canonical / robots | Metadata and structured data |
| --- | --- | --- |
| `/blog` | Absolute self canonical; indexable. | Spanish title/description, OG/Twitter, RSS discovery link. |
| `/blog?page=N` | Absolute self canonical with `?page=N`; `noindex, follow` for `N > 1`. | Distinct page title; pagination is intentionally not put in the sitemap. |
| `/blog/[slug]` | Same-origin HTTPS CMS canonical override when valid; otherwise absolute self canonical. `noIndex` becomes `noindex, follow`. | SEO title/description fallbacks, article OG/Twitter image when public Media is present, `BlogPosting` plus breadcrumb JSON-LD. |
| `/blog/category/[slug]` | Absolute self canonical; paginated states are `noindex, follow`. | Category description fallback, OG/Twitter, breadcrumb JSON-LD, RSS discovery link. |
| Missing/unpublished/unavailable article/category metadata | No article canonical; `noindex, nofollow`. | No article JSON-LD or CMS data is emitted. |

Canonical overrides are deliberately conservative: only absolute HTTPS URLs on
`www.sebastianlevano.com`, below `/blog/`, without query strings/fragments are
honored. Trailing-slash overrides are rejected to preserve the portfolio's
no-trailing-slash canonical policy. Cross-origin, HTTP, malformed, or otherwise
unsafe CMS values fall back to the current public article URL. No `hreflang` is emitted: public blog
content is Spanish-first and English URL/content mapping remains a future
product decision.

## Sitemap, robots, RSS, and freshness

- `src/app/sitemap.ts` fetches through the anonymous published-only CMS client,
  requests pages of 100 records, and walks every reported page up to its
  documented 500-page safety budget. It never silently returns only the first
  CMS page; a larger deployment fails closed and needs sitemap sharding.
  It includes existing `/` and `/blog` URLs, then indexable canonical articles
  and their unique categories. `noIndex`, unpublished, malformed, and draft
  records never enter the normalized public projection or sitemap. On CMS
  failure it returns only the known root/blog URLs rather than inventing article
  URLs.
- `src/app/robots.ts` allows public routes, disallows `/api/internal/`, and
  declares the canonical sitemap. Robots is not used as an authorization
  control; the receiver remains HMAC protected.
- `/blog/rss.xml` returns XML with an RSS content type, absolute canonical
  links, safe XML escaping, summaries only (no rich-text HTML), and at most 100
  newest indexable posts. It returns `503` rather than stale/invented feed data
  when the CMS cannot be read.
- Sitemap and RSS are runtime routes because they depend on CMS data. Their
  underlying CMS requests retain the existing five-minute tagged cache. The
  Phase 5 receiver now also invalidates `/sitemap.xml` and `/blog/rss.xml` with
  its generic blog tags/paths. `revalidateTag(..., "max")` is still
  stale-while-revalidate, so this is bounded eventual freshness, not an instant
  global refresh.

The root layout still awaits `cookies()`, so blog pages remain request rendered;
this phase did not claim static generation or change that cache boundary.

## Security and accessibility review

- CMS reads remain anonymous, server-only, published-only REST queries; no CMS
  credential, R2 key, or admin data is used.
- JSON-LD is serialized once and escapes `<`, `>`, `&`, and JavaScript line
  separators before insertion into a script tag.
- RSS escapes XML-sensitive/control characters and uses only a textual
  SEO-description/excerpt fallback, never CMS rich-text HTML.
- Media metadata is used only when the existing public URL/alt normalizer
  accepts it. Development media hostnames are not hard-coded or whitelisted.
- Article and category pages have visible breadcrumb navigation matching their
  JSON-LD. Article pages retain one meaningful H1; CMS rich-text headings begin
  at H2 through the existing safe renderer.

## Files changed

- `src/services/blog/seo.ts` — canonical, metadata, JSON-LD, sitemap, and RSS
  serialization helpers.
- `src/services/cms/{types,client,index}.ts` — canonical URL normalization and
  bounded all-page published-post discovery.
- `src/app/blog/**`, `src/app/sitemap.ts`, `src/app/robots.ts` — metadata,
  JSON-LD, RSS, sitemap, and robots routes.
- `src/views/blog/components/{article,breadcrumbs,jsonLd}` — visible breadcrumb
  alignment and safe structured-data emission.
- `src/services/blogRevalidation/cache.ts` and its validator — sitemap/RSS
  cache-path invalidation coverage.
- `scripts/validate-blog-seo.ts`, existing validators, `package.json`, and
  `bun.lockb` — deterministic SEO checks and removal of `next-sitemap`.
- Removed static-generator config/artifacts and the conflicting Vercel-wide
  robots header.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| `bun install --frozen-lockfile` | PASS | Lockfile is coherent after removing `next-sitemap`. |
| `bun run validate:blog-contract` | PASS | Includes canonical normalization and discovery-limit query coverage. |
| `bun run validate:blog-revalidation` | PASS | Includes sitemap/RSS invalidation paths. |
| `bun run validate:blog-seo` | PASS | Deterministic fixtures cover fallbacks, canonical policy, noIndex, escaping, JSON-LD, sitemap/category uniqueness, RSS filtering, and RSS escaping. |
| `bun run typecheck` | PASS | — |
| `bun run lint` | PASS with warning | Existing `src/hooks/useProjects.tsx` exhaustive-deps warning only; no new lint errors. |
| `bun run build` | PASS | `/blog/rss.xml` and `/sitemap.xml` are dynamic; `/robots.txt` is static. |
| Built loopback mock smoke test | PASS | Published list/detail/category, JSON-LD, draft/missing `404`, sitemap noIndex filtering, robots, and RSS content type/body were observed over HTTP. |
| Live local CMS SEO check | BLOCKED | No live CMS content was started for this phase; no fixture or CMS mutation was needed. |
| Production indexing/search appearance | NOT RUN | Requires deployment, Search Console, crawler/social-preview observation, and final production media hostname. |

## Production checklist and deferred work

1. Configure the deployed server-only CMS origin and shared revalidation secret
   in their separate Vercel projects; verify sitemap/RSS after a real
   publication, move, unpublish, and delete.
2. Submit the deployed sitemap in Search Console, inspect crawl/index coverage,
   validate redirects/404 responses, and test social cards against the deployed
   public media hostname.
3. Measure Core Web Vitals and crawler behavior in production; local SSR/mock
   assertions are not evidence of Google indexing or real social previews.
4. If editorial volume approaches 50,000 indexable post URLs, implement
   `generateSitemaps` sharding before exceeding the sitemap protocol limit.
5. Add locale-specific URLs and `hreflang` only after English translation and
   slug relationships are designed.

## Git

The implementation was committed locally as
`fa65b3e feat(blog): implement technical SEO metadata sitemap and RSS`.
No push was performed.
