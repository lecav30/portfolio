# Blog integration audit

**Scope:** Phase 0 only. This is a read-only audit of the portfolio repository at
the revision inspected on 2026-10-27. It does not initialize Payload, install
packages, create blog routes, or change deployment infrastructure.

## 1. Executive summary and recommendation

**Recommendation: keep two independent repositories and Vercel projects.** The
portfolio is a small Next.js App Router application with no server domain model,
database client, or API layer to share with a CMS. A separately deployed Payload
application keeps database, admin authentication, media-storage credentials, and
CMS upgrades out of this public site. The portfolio should consume a deliberately
small, published-only REST representation server-side.

The public application can add `/blog`, `/blog/[slug]`, and
`/blog/category/[slug]` without route collisions. Its main implementation
constraint is that `src/app/layout.tsx` awaits `cookies()`. Therefore all child
routes currently inherit request-time rendering. Phase 4 should preserve that
behavior initially and explicitly cache only the CMS `fetch` requests using
`next: { revalidate, tags }`, then invalidate them with a protected Route
Handler. Do not assume build-time ISR/static generation while that root layout
remains dynamic.

Before Phase 1, choose the CMS project/repository owner and deployment identity,
database/R2 accounts and regions, and the one-language-at-launch URL policy.
Before Phase 4, agree the published REST projection, image delivery host, cache
TTL/tag taxonomy, and signed webhook contract. Nothing in this repository makes
a monorepo or an in-process Payload installation necessary.

## 2. Repository inventory

### Observed facts

| Area | Evidence | Finding |
| --- | --- | --- |
| Framework/router | `src/app/layout.tsx`, `src/app/page.tsx` | Next.js App Router under `src/app`; no `pages/` directory or API Routes. |
| Resolved runtime libraries | `bun.lockb`; `bun pm ls --depth 0` | Next `16.3.4`, React/React DOM `19.2.8`, `next-intl` `4.5.8`, `sharp` `0.35.4`, TypeScript `5.9.3`, Tailwind `3.4.18`. `package.json` ranges are not the source for these resolved versions. |
| Package manager | `bun.lockb` begins `bun-lockfile-format-v0`; installed Bun reports `1.1.18` | Bun is the committed lockfile/package-manager convention. There is one root manifest and no workspace configuration. |
| Node/runtime declaration | `package.json`, repository root | No `engines`, `.nvmrc`, `.node-version`, `.tool-versions`, Dockerfile, or runtime setting is committed. `@types/node` is `^20`, which is not a runtime guarantee. |
| Scripts/tooling | `package.json` | `dev`, `build`, `postbuild` (`next-sitemap`), `start`, and `lint`; ESLint 9/core-web-vitals, strict TypeScript/no emit, PostCSS/Tailwind. |
| Styling/components | `tailwind.config.ts`, `src/components`, `src/views/portfolio` | Tailwind utilities plus one CSS Module (`contact`); shared components use directory `index.tsx`; portfolio feature components live in `src/views/portfolio`. Aliases include `@components`, `@views`, `@hooks`, and `@/`. |
| Internationalization | `src/i18n/request.ts`, `src/components/languageProvider/index.tsx` | `next-intl` messages are `messages/es.json` and `messages/en.json`; locale is a `locale` cookie, not a locale path segment. Spanish is the server default. |
| Hosting evidence | `vercel.json`, `.gitignore` | Vercel configuration is committed, but no project ID, build settings, domains, Vercel environment configuration, or deployment metadata is committed. The public domain is used in site/SEO config, not proof of the active Vercel project configuration. |

`README.md` is the unmodified create-next-app Pages Router template and claims
`pages/index.tsx` and `pages/api`; it is stale and must not guide implementation.

### Deployment/configuration observations

`next.config.mjs` enables React strict mode and wraps the configuration with the
`next-intl` plugin. It has no redirects, rewrites, CSP/security headers, image
remote patterns, `output`, `runtime`, cache, or experimental settings.
`vercel.json` applies only `X-Robots-Tag: index, follow` to all paths. There is
no middleware/proxy file and no application API route at present. `.env.local`
exists but was intentionally not read; `.gitignore` excludes local `.env*` files.

## 3. Current routing, rendering, data fetching and caching assessment

### Current route tree and rendering

The only application page is `src/app/page.tsx` (`/`), which renders
`src/views/portfolio/index.tsx`. Its header is a client component that uses
same-page anchors and History API calls for `#hero`, `#services`, `#experience`,
`#projects`, and `#contact` (`src/components/header/index.tsx`). There is no
`/blog`, catch-all, route handler, middleware, redirect, or rewrite to collide
with the proposed paths.

Most portfolio feature components are client components. The root layout is an
async Server Component, uses `next/font/google`, and awaits `cookies()` for the
locale and theme (`src/app/layout.tsx`). Under the installed configuration this
is a request-time API in the shared root layout, so routes below it are dynamic
at the route-rendering level. The only application fetch found is the client-side
Formspree POST in `src/views/portfolio/components/contact/index.tsx`; there is
no existing server data-access helper, REST client, database client, or cache
policy to reuse.

### Exact cache posture and recommendation

`next.config.mjs` does not set `cacheComponents`, and Next's installed config
schema exposes it as an optional boolean. This project therefore uses the
pre-Cache-Components/legacy cache model, not the new Next 16 model. The official
Next guide explicitly labels that guide as applying when `cacheComponents` is not
enabled. The effective defaults are `dynamic = 'auto'`, `fetchCache = 'auto'`,
and `revalidate = false`/no route-level override. No current server fetch exists
to cache.

With `fetchCache = 'auto'`, an unspecified `fetch` discovered after a
request-time API is not cached. A future CMS call beneath the current root
layout must consequently specify its own caching policy. For a conservative
first integration, each server-only CMS reader should use a bounded request
timeout and an explicit successful-response cache policy such as a 5--15 minute
`next.revalidate` plus stable tags (`blog:posts`, `blog:post:<slug>`, and
`blog:category:<slug>`). Exact TTL is a product/availability choice, not fixed
by this audit. On CMS failure, render cached data when available; otherwise
return a controlled unavailable state for listings and `notFound()` only for a
confirmed missing published post, never merely for a transport/5xx failure.

Use `revalidateTag(tag, 'max')` and targeted `revalidatePath` in a Node-runtime
`POST /api/revalidate` Route Handler. In this Next generation, `revalidateTag`
marks tagged data stale and refreshes it with stale-while-revalidate semantics;
`revalidatePath` can invalidate a page/path and is server-only. The handler is
dynamic by default; it should not be a public content API.

`generateMetadata` is available and is the right API for post/category
metadata. It can share memoized `fetch` work with the page. Dynamic segment
`params` are promises in Next 16 and must be awaited. `generateStaticParams` is
supported by the installed App Router, but it cannot make inherited cookie-based
routes fully static without changing the layout boundary. Do not add it in the
initial minimal integration. If static blog HTML becomes a measured requirement,
first refactor cookie-reading/theme/locale behavior into a route group or make
the root layout static; then validate pre-rendered popular posts plus dynamic
fallback in a production-like Vercel build.

### Sources used for version-sensitive claims

These are official Next.js references consulted during this audit; their current
examples are newer than `16.3.4`, so Phase 4 should validate the final exact
minor version after any upgrade:

- [Caching without Cache Components](https://nextjs.org/docs/app/guides/caching-without-cache-components)
  documents `fetchCache = 'auto'`, request-time API behavior, `next.revalidate`,
  tags, and on-demand invalidation.
- [revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
  documents Route Handler/server-only usage.
- [revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
  documents tagged stale-while-revalidate behavior and the `max` profile.
- [generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
  documents Server Component-only dynamic metadata and fetch memoization.
- [generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
  documents build-time generation and dynamic-parameter handling.
- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
  documents async request APIs and async dynamic params.

## 4. Current SEO and media setup

### Existing reusable SEO behavior

`src/app/layout.tsx` supplies `metadataBase` for
`https://www.sebastianlevano.com`, portfolio title/description, `robots`, root
canonical (`/`), a Google verification entry, favicon, and baseline Open Graph
website fields. Its `viewport` sets a theme color. `vercel.json` repeats index/
follow at the response-header level.

`public/robots.txt` allows crawling and points at `/sitemap.xml`. `public/sitemap.xml`
indexes `public/sitemap-0.xml`; the latter currently contains only the root URL.
They are generated/static files managed by the `next-sitemap` `postbuild` script
and `next-sitemap.config.js`, whose `siteUrl` is the same public domain. There
is no JSON-LD, Twitter card metadata, post/page metadata, dynamic `robots.ts`,
dynamic `sitemap.ts`, RSS route, `opengraph-image`, or `twitter-image` today.

### Media behavior and implications

Existing images are imported local WebP assets and rendered with `next/image`
(`src/views/portfolio/components/projects/index.tsx`, hero/modal components).
There is no `images` configuration in `next.config.mjs`. Remote CMS/R2 media
will therefore require an explicit, least-privilege `images.remotePatterns`
entry for the final public media hostname (or a deliberate unoptimized/custom
loader policy), remote image `width`/`height` or an intentional `fill` layout,
accurate `sizes`, and meaningful alt text. Do not expose an R2 bucket endpoint
or private origin if a stable public/custom CDN hostname can be used.

### Required SEO collision resolution

Do not add `src/app/sitemap.ts` or `src/app/robots.ts` beside the existing
`public/sitemap.xml`/`public/robots.txt` without an explicit migration decision:
both target the same public URLs. For CMS-backed posts, prefer a single dynamic
Next metadata route strategy in a later phase, then remove/update the static
generator configuration and generated public artifacts in the same review. That
route should list only canonical, published public URLs and be independently
cacheable/revalidated. Add RSS later as a Route Handler (for example
`/rss.xml`) after the public contract is stable.

Blog pages should set a self canonical, title/description, Open Graph and
Twitter fields, article published/modified time and image where available.
Render `BlogPosting` JSON-LD from the same sanitized published data. Never use
CMS preview/draft fields to create publicly indexed metadata.

## 5. Proposed blog integration design

### Route and component placement

Use App Router feature directories, leaving the existing portfolio conventions
intact:

| Public behavior | Proposed later location | Notes |
| --- | --- | --- |
| Blog index and pagination | `src/app/blog/page.tsx` | Server Component; read `page`/filter query parameters defensively; canonicalize page 1. |
| Post | `src/app/blog/[slug]/page.tsx` | Await `params`, fetch a published post, `notFound()` only for a definitive 404/unpublished result, and export `generateMetadata`. |
| Category | `src/app/blog/category/[slug]/page.tsx` | Server Component; same pagination/canonical/404 rules. |
| Feature shell/presentation | `src/views/blog/**` | Reusable cards, list, pagination, article header/body, category UI. Keep CMS I/O out of client components. |
| Server-only CMS boundary | `src/services/cms/**` (or a new `src/lib/cms/**` only if a Phase 4 convention is chosen) | Fetch wrapper, response validation/mapping, tags, timeout/error taxonomy, and TypeScript types. The existing `@services/*` alias makes `src/services` the least surprising choice. |
| Blog navigation | `src/components/header/index.tsx` | Add a real `next/link` to `/blog`; avoid treating it as another scroll section. A blog-specific layout/header should be evaluated for navigation state and accessibility. |
| Revalidation receiver | `src/app/api/revalidate/route.ts` | Node runtime; POST only; no CORS relaxation or browser client. |

Server Components are the default for pages, metadata, and CMS access. Make only
interactive controls client components. This prevents an API token/base URL from
being bundled into browser code and avoids direct browser-to-CMS calls.

### Page behavior

`/blog` should return a deterministic, newest-first page of published posts with
stable pagination (choose cursor pagination in the contract if editorial volume
may grow; an offset page is sufficient only for modest volume). It needs a
Spanish listing title/description at launch, empty state, loading/error strategy,
and crawlable links.

`/blog/[slug]` should accept a normalized CMS slug, fetch only a published post,
return 404 for an unknown/non-public slug, emit article metadata/JSON-LD, and
use `next/image` for the hero if present. The CMS Lexical document must be
rendered by an allow-listed renderer in a later phase; it is not safe to inject
arbitrary CMS HTML. Syntax highlighting and KaTeX belong behind explicit
content-node/component decisions later, including SSR output, sanitization,
bundle impact, and CSS/theme integration.

`/blog/category/[slug]` should 404 for a confirmed absent/non-public category,
list only published posts, and give each pagination state a deliberate canonical
and robots policy. Categories/tags should be links only after their public URL
rules are chosen; tags need not receive public archive routes at launch.

Language needs a product decision before implementation. The existing cookie
changes UI language without changing the canonical URL, so translating a post
must not silently make `/blog/<slug>` return different indexed content by cookie.
Launch Spanish-only public article content at the canonical unprefixed paths.
When English launches, choose and document locale URLs (for example `/en/blog`)
with `hreflang`, translation relationships, and independent localized slugs;
do not infer that model from the current UI toggle.

## 6. Future CMS integration contract and security model

### Responsibility boundary

| Portfolio repository | Future CMS repository |
| --- | --- |
| Public route rendering, presentation, metadata/JSON-LD/RSS/sitemap, image allow-list, cache tags, graceful degradation, authenticated revalidation endpoint. | Payload configuration, admin Users, Posts/Categories/Tags/Media collections, publish access control, Lexical editing, PostgreSQL migrations/backups, R2 storage, webhook delivery, administrator onboarding. |

The CMS must expose a published-only public REST read surface. Ideally the
Payload collection access rule itself enforces `published` plus a `publishedAt`
condition, rather than trusting the portfolio to filter results. The portfolio
must still validate the response and treat any non-published or malformed item
as unavailable.

### Minimum design-level public contract

Do not freeze Payload-generated schema details yet. The two projects do need a
versioned/documented agreement covering:

- base URL and REST paths; a stable API version/versioning policy;
- list and single-post lookup semantics, pagination/cursor shape, and 404/5xx
  behavior;
- a public post projection: immutable ID, slug, title, excerpt, content type,
  category/categories, tags, cover image public URL/alt/dimensions, author
  display data if used, published/updated timestamps, and SEO title/description/
  canonical/image overrides;
- an explicit published status/filter so drafts, autosaves, scheduled and
  preview-only content never appear in the public response;
- a category projection with slug/name/description and which items are public;
- Lexical rich-text payload version/allowed node policy (the portfolio should
  render its own trusted component mapping, not couple to the whole CMS admin
  response);
- a changed-post event with event ID, schema version, action, post ID, current
  and previous slug/category/publication state as applicable. Previous values
  are necessary to clear old URLs when a slug/category or publication state
  changes.

### Credentials, webhook, and availability model

Keep `CMS_API_URL` and any optional `CMS_READ_TOKEN` server-only: neither name
should use the `NEXT_PUBLIC_` prefix and neither belongs in a client component.
Prefer unauthenticated public reads only if Payload access control itself limits
them to the deliberately minimal published projection; otherwise use a
least-privilege read token at server render time. Use HTTPS, an allow-listed
configured base URL, validated JSON, response-size limits, and `AbortSignal`
timeout/cancellation. Do not proxy CMS credentials through a browser API.

Have Payload send an HTTPS `POST` to the portfolio revalidation Route Handler,
with a versioned raw JSON body, event ID, timestamp, and HMAC-SHA-256 signature
over a canonical signing string/body. The portfolio must: require POST and JSON;
check timestamp freshness with a small skew window; calculate and compare the
signature in constant time; validate the event schema and expected object;
return only generic errors; then invalidate generic and specific tags plus the
index, affected post paths, and current/previous category paths. A shared bearer
secret alone is weaker because it offers no replay bound. Revalidation is
idempotent, but strict replay prevention requires durable event-ID storage; if
that is not provisioned, document timestamp-bounded replay as the accepted
trade-off. CMS webhook delivery should retry transient non-2xx results with
bounded backoff, and the receiver should safely accept duplicate valid events.

## 7. Environment variable inventory

Names only; no existing `.env*` values were read or copied.

| Location | Existing/needed names | Purpose |
| --- | --- | --- |
| Portfolio server (Vercel Production/Preview as appropriate) | Existing: `NEXT_PUBLIC_FORMSPREE_FORM_URL` | Existing browser-visible Formspree endpoint used by the contact component. |
| Portfolio server | `CMS_API_URL`, optionally `CMS_READ_TOKEN`, `CMS_REVALIDATE_WEBHOOK_SECRET` | CMS REST origin, optional server-only published-read credential, and inbound webhook HMAC secret. None use `NEXT_PUBLIC_`. |
| Portfolio server (optional normalization) | `SITE_URL` | Only if the existing hard-coded public origin is later centralized; do not add it merely for the blog. |
| CMS server | `DATABASE_URL`, `PAYLOAD_SECRET`, `PAYLOAD_PUBLIC_SERVER_URL`, `PORTFOLIO_REVALIDATE_URL`, `PORTFOLIO_REVALIDATE_WEBHOOK_SECRET` | PostgreSQL, Payload cryptographic secret/public server origin, and outbound webhook target/signing secret. Exact Payload variable requirements must be confirmed against the selected Payload version/template. |
| CMS server/R2 adapter | `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, optionally `S3_PUBLIC_URL` | S3-compatible R2 configuration and stable public media origin. Names are a proposed adapter-neutral convention; validate actual adapter names before provisioning. |
| Deployment/platform | Vercel project environment values and Cloudflare DNS/R2 credentials | Configure in platform secret stores, never source control. No portfolio runtime secret is needed in the browser. |

## 8. Risk/conflict matrix

| Severity | Evidence/risk | Mitigation |
| --- | --- | --- |
| High | Shared root `cookies()` makes future blog routes dynamic; relying on default `fetch` after it would query CMS on every request. | Explicitly cache/tag CMS fetches in Phase 4; only refactor layout if static HTML is a requirement. |
| High | Draft leakage could occur if the CMS public query/token is over-broad. | Enforce published-only Payload access and narrow projection, then validate again in the portfolio. |
| High | A simple exposed webhook secret can be replayed to purge cache. | HMAC raw body + timestamp + schema validation; document/durable-store replay decision; idempotent invalidation. |
| Medium | `public/sitemap.xml` and `public/robots.txt` already occupy intended metadata URLs. | Migrate deliberately to one owner; do not add duplicate App Router metadata routes. |
| Medium | No remote `next/image` allow-list exists. | Add exact final public media hostname and image fields; test optimization/caching before launch. |
| Medium | Current header is an anchor-scrolling client nav. | Add `/blog` via `Link`; test mobile menu, active state, keyboard navigation, and return-to-portfolio flow. |
| Medium | Cookie-only locale means an English post could share a Spanish canonical URL. | Launch Spanish-only canonical content; design locale URLs/hreflang before translated publication. |
| Medium | CMS outage can turn a content request into a false 404 or render failure. | Distinguish missing (404) from failure/timeout; cache good reads, bound timeouts, return a 503-style controlled UI/log telemetry. |
| Low | Current SEO lacks per-post social cards/JSON-LD and sitemap only lists `/`. | Add per-route metadata/JSON-LD and published URLs during Phase 4/SEO phase. |
| Low | `README.md` describes the wrong router. | Treat source/config as truth; optionally repair README in a separate documentation task. |
| Low | Only `X-Robots-Tag` is set; no CSP or broader security headers are committed. | Decide site-wide header policy separately; ensure it permits the chosen image/CDN origin without broadening unnecessarily. |

## 9. Proposed file/change map for future phases

No files below were changed by this audit.

| Likely change | Purpose | Phase |
| --- | --- | --- |
| New independent CMS repository | Payload app, collections, PostgreSQL/R2 adapters, admin/users, published access policy, outbound webhook | 1--3 |
| `src/services/cms/**` | Server-only REST client, types/projection validation, tags/errors | 4 |
| `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/category/[slug]/page.tsx` | Public SSR routes, metadata, 404/pagination | 4 |
| `src/views/blog/**` | Blog presentation components and Lexical renderer in a later content phase | 4--6 |
| `src/components/header/index.tsx` and possibly a blog layout | Public navigation and visual integration | 4 |
| `src/app/api/revalidate/route.ts` | Authenticated CMS-to-portfolio invalidation receiver | 4 |
| `next.config.mjs` | Exact remote image hostname policy, only when media URL is known | 4 |
| `src/app/sitemap.ts`, `src/app/robots.ts`, possibly `src/app/rss.xml/route.ts` | Dynamic SEO artifacts/RSS, after resolving static file ownership | 7--8 |
| `next-sitemap.config.js`, `package.json`, `public/robots.txt`, `public/sitemap.xml`, `public/sitemap-0.xml` | Remove or alter only as part of the chosen sitemap/robots migration | 7--8 |
| `messages/es.json`, `messages/en.json` | Navigation/listing UI strings; not article translation data | 4 and later i18n phase |
| `src/app/layout.tsx` / route-group layouts | Only if choosing static blog rendering or a distinct blog document shell | prerequisite decision / 4 |

## 10. Decisions, uncertainties and external verification required

### Decisions required

1. Confirm two Vercel projects and the CMS hostname (`cms.sebastianlevano.com`
   is proposed, not configured in this repository), repository ownership, and
   environments (Production/Preview/Development).
2. Choose Payload version/template, PostgreSQL/Neon project and region, R2
   bucket/public custom hostname, backup/retention, and operational owner.
3. Choose public media hostname and signed/private media policy before changing
   `next/image`.
4. Choose whether request-rendered HTML plus cached CMS data is sufficient at
   launch (recommended) or whether fully static blog routes justify a layout
   refactor.
5. Choose Spanish-only launch URLs and future English route/translation rules.
6. Choose pagination semantics, public category/tag URL policy, cache TTLs,
   webhook retries/replay-store trade-off, and sitemap migration ownership.

### Verification still required

- Vercel project build command, Node/Bun runtime selection, regions, domains,
  environment scoping, deployment protection, and webhook reachability are not
  versioned here; verify in the Vercel dashboard without exposing values.
- Cloudflare DNS, R2 public hostname/CORS/cache headers and Neon connectivity
  do not exist in this repository and must be validated when provisioned.
- Payload REST field serialization, Lexical node shape, published access filter,
  selected S3/R2 adapter variables, and its webhook hooks depend on the Payload
  version chosen in Phase 1. This audit intentionally does not guess them.
- Validate Next `16.3.4` production cache/revalidation behavior on Vercel with
  integration tests once code exists. Official docs checked here are current
  and may describe a newer `16.x` minor.

## 11. Phase-by-phase next steps and readiness

1. **Phase 1 -- independent CMS initialization:** create the new CMS repository
   and Vercel project only after the platform/account/region decisions above;
   pin its own Node/package manager/Payload versions and establish administrator
   access. Do not add Payload to this repository.
2. **Phase 2 -- CMS model/access:** implement Users, Posts, Categories, Tags,
   Media; draft/publish rules; Spanish-first editorial fields; minimal public
   projection.
3. **Phase 3 -- CMS infrastructure:** provision Neon/R2, public media hostname,
   backups, and outbound webhook delivery/retry observability.
4. **Phase 4 -- portfolio integration:** first settle the API contract, image
   hostname, caching choice, webhook signing secret, and sitemap transition;
   then add the routes/client/components/revalidation handler listed above.
5. **Later phases:** Lexical renderer and authoring ergonomics; code/KaTeX;
   SEO sitemap/robots/RSS; analytics/monitoring; English content/URLs; load,
   security, accessibility and recovery testing.

### Phase 1 readiness checklist

- [ ] CMS is approved as a separate repository/project.
- [ ] Vercel account/team, CMS hostname ownership, Neon, and R2 account/region
      choices are available.
- [ ] One named administrator and no-public-registration requirement are
      confirmed.
- [ ] Secret-management, backups, preview and production environment ownership
      are assigned.

### Phase 4 readiness checklist

- [ ] Published-only REST contract and sample success/not-found/error payloads
      are documented and manually verified.
- [ ] Public R2/CDN media hostname, image dimensions/alt behavior and
      `next/image` policy are agreed.
- [ ] Dynamic SSR + cached data is accepted, or the layout-refactor/static
      decision is complete.
- [ ] Revalidation event payload, HMAC scheme, timestamp window, replay
      strategy, retries and cache tags/path invalidations are documented.
- [ ] Spanish canonical launch scope and later English URL/hreflang plan are
      approved.
- [ ] `robots`/sitemap ownership migration is selected; no duplicate files will
      claim `/robots.txt` or `/sitemap.xml`.

## 12. Validation evidence and acceptance-criteria status

### Commands/checks performed

- `git status --short` before the audit: no output (clean working tree).
- Inspected the root manifest, Bun lockfile metadata through `bun pm ls`, Next,
  Vercel, TypeScript, ESLint, Tailwind, sitemap, gitignore and README configs.
- Inspected the complete App Router file tree, root layout/page, i18n providers,
  header/footer, current fetch use, local image use, static robots/sitemaps, and
  searched for routing, SEO, caching, environment-variable and middleware/proxy
  references. No `.env*` content was read.
- Inspected installed Next `16.3.4` config/runtime declarations and checked the
  official Next references listed in section 3 for version-sensitive behavior.
- No build, formatter, install, deployment, staging, commit, or source/config
  mutation was run. This report is the only intended audit change.

| Acceptance criterion | Status | Evidence/gap |
| --- | --- | --- |
| Actual framework/package-manager/runtime/deployment architecture | **Partially verified** | Framework/App Router, resolved dependency versions and Bun lock are verified. No committed Node runtime or Vercel dashboard configuration exists. |
| Blog route/component locations using repository conventions | **Verified** | App/feature/alias conventions and exact proposed paths are documented in section 5. |
| Reusable SEO, caching, routing and image functionality | **Verified** | Existing metadata/static sitemap/robots/local `next/image` and absent config are documented. |
| Conflicts with public blog/separate Payload | **Verified** | Root cookies/cache effect, static metadata URL collision, header anchors, remote-image config, locale canonical issue and no public API are identified. |
| Appropriate Next caching/revalidation strategy | **Partially verified** | Explicit tagged cache + authenticated Route Handler is evidence-based for installed configuration; final production behavior must be integration-tested on Vercel. |
| Portfolio--CMS boundary/minimal contract | **Verified** | Sections 6 and 7 define responsibilities, public projection and security without locking Payload internals. |
| Likely later file changes | **Verified** | Section 9 maps additions/modifications without making them. |
| Two independent repositories/projects appropriate | **Verified** | No shared workspace/domain model exists; separation protects admin/database/media credentials. |
| Phase 1 and Phase 4 decisions/blockers | **Verified** | Sections 10--11 provide explicit readiness checklists and external dependencies. |

Final working-tree verification must be run after this report is written; it
should show only `docs/architecture/blog-integration-audit.md` as a new file
unless the user changes the repository concurrently.
