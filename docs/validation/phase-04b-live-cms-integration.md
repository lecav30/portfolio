# Phase 4B: live Portfolio ↔ Payload CMS integration validation

## Result

**Phase 5 readiness: READY for signed revalidation design and implementation.**

The portfolio was run against the real local Payload REST API and rendered real
published fixture content server-side. Published listing, pagination, detail,
category, R2 cover image, no-image fallback, draft isolation, missing 404, and
controlled CMS-unavailable behavior were all observed through local HTTP/HTML
checks. No production resource, CMS source file, migration, administrator, or
unrelated record was modified.

## Environment

- Portfolio repository/branch: `portfolio`, `develop`; starting commit
  `8048823`.
- CMS repository/branch: `cms`, `main`; starting commit `addea31`.
- Runtime: Node `v24.22.1`, Bun `1.1.18`.
- CMS: Payload `3.89.0`, local PostgreSQL 18 database `cms_portfolio_dev`.
- Local ports: CMS `127.0.0.1:3001`; portfolio `127.0.0.1:3000`.
- Portfolio `.env.local` received only the ignored server-side local origin
  `PAYLOAD_CMS_URL=http://127.0.0.1:3001`. No CMS secret, token, credential,
  or R2 variable was copied into the portfolio.
- The CMS `.env` remained ignored with mode `0600`; only required-variable
  presence was inspected. Its bootstrap variables were explicitly unset for
  startup.

## Fixture strategy and cleanup

Using the existing CMS administrator through Payload's authenticated Local API,
the validation created one uniquely prefixed local category, one tag, one
R2-backed PNG Media record, ten published Posts (to create two pages at the
portfolio limit of nine), and one draft Post. Fixture IDs and generated slugs
were kept only in a temporary mode-`0600` manifest outside either repository.

Cleanup deleted all fixture Posts, draft, Media, tag, and category through the
same authenticated Local API. Direct checks confirmed no fixture database record
remained. The public Media URL still returned HTTP 200 immediately after
deletion, but direct S3 `HeadObject` against the known prefixed fixture key
returned not-found, confirming the R2 object was absent; the public response was
therefore cached delivery rather than an orphan. All temporary scripts,
responses, and the manifest were removed. The pre-existing single CMS admin was
preserved.

## Live validation matrix

| Check | Result | Evidence |
| --- | --- | --- |
| CMS startup | PASS | Payload started on loopback; `/admin` and `/api/posts?limit=1` returned 200. |
| CMS Users privacy | PASS | Anonymous `/api/users` returned 403. |
| Published REST listing/detail | PASS | Published listing and the fixture detail query each returned 200; all returned docs had `_status: "published"`. |
| Draft REST isolation | PASS | Direct draft-slug and caller-supplied draft-filter requests returned 200 envelopes with zero fixture docs and zero count. |
| Portfolio index/pagination SSR | PASS | `/blog` and `/blog?page=2` returned 200 and rendered the expected page labels for two real pages. |
| Portfolio published detail SSR | PASS | Published fixture detail returned 200 with real Lexical paragraph HTML and its real cover-image URL. |
| Category SSR | PASS | The fixture category URL returned 200 and rendered its published articles. |
| Draft and missing portfolio routes | PASS | Direct draft and unknown slugs each returned 404 with the blog not-found UI. |
| Missing-cover fallback | PASS | A real published fixture without a cover relationship rendered 200 without the fixture Media URL. |
| Development R2 public delivery | PASS | The fixture public URL returned HTTPS HTTP 200 with `image/png` during the live test. The hostname remains environment-specific and is not assumed to be `media.sebastianlevano.com`. |
| CMS unavailable UI | PASS | After stopping only the local CMS, an uncached portfolio post request returned HTTP 200 with the controlled unavailable-CMS UI. |
| Browser visual/accessibility run | NOT RUN | No browser runner was used. Server-rendered HTML, heading/text presence, links, and HTTP outcomes were checked; this is not a substitute for browser/assistive-technology validation. |

## Integration fixes

No tracked portfolio or CMS implementation change was required. An initial
temporary fixture helper assumed post slugs from a prefix, but Payload correctly
normalizes/sources slugs from the post titles. The helper was corrected outside
both repositories by resolving the actual records through the Local API. This
confirmed the production portfolio normalizer correctly handled the real Payload
relationship, pagination, Media, and Lexical response shapes.

## Static checks

| Command | Result |
| --- | --- |
| `bun install --frozen-lockfile` | PASS — 419 installs / 527 packages checked with no change. |
| `bun run validate:blog-contract` | PASS |
| `bun run typecheck` | PASS |
| `bun run lint` | PASS with one pre-existing warning in `src/hooks/useProjects.tsx` about `projects` dependency. |
| `bun run build` | PASS — all blog routes remain dynamic (`ƒ`) because the root layout awaits `cookies()`. |
| `git diff --check` | PASS after excluding build-generated sitemap timestamp output. |

## Cache and Phase 5 notes

The root `cookies()` layout continues to make portfolio blog routes
request-rendered. The existing explicit CMS `fetch` policy remains unchanged:
five-minute `force-cache` entries tagged with generic posts/categories and
specific post/category tags. The live validation did not implement, simulate,
or claim instant invalidation.

Phase 5 should add only a signed, timestamp-checked revalidation receiver and
invalidate the appropriate generic/specific tags and affected paths. It must
handle publication changes and previous slug/category state. Production still
needs environment-scoped CMS origin configuration, a production R2 hostname,
and an end-to-end deployment/revalidation rehearsal.

## Git

This report is the only tracked portfolio change from Phase 4B and is committed
by the local validation commit recorded in the final handoff. No push is
performed.
