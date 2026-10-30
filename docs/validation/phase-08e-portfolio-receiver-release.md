# Phase 8E: Portfolio receiver production-release preflight

## Status: NO-GO — operator verification and explicit approval required

This is a read-only preflight. No Git remote was changed, no Vercel deployment
was created or promoted, and the CMS, Neon, R2, Cloudflare, and DNS were not
touched.

## Local release topology

| Item | Observed state |
| --- | --- |
| Working branch | `develop` at `95c6a68` |
| Local/remote `main` | `ba99794b8cec4684813cd9263df78cda1eaf4b7a` |
| Remote branches visible via `git ls-remote` | `main` only; no remote `develop` branch |
| Divergence (`main...develop`) | `0 8`: `main` is the merge base and `develop` is eight commits ahead, so this is fast-forward-compatible locally. |
| Receiver implementation | `c08715f feat(blog): add signed on-demand revalidation endpoint` |
| Latest planned source commit | `95c6a68 docs: record technical rendering validation` |

The eight `develop` commits include the published CMS blog integration, signed
receiver, Phase 6 SEO/RSS/sitemap work, and Phase 7B technical rendering. They
have not reached `origin/main`; therefore the currently deployed site cannot be
assumed to contain any of them.

## Receiver contract and safe live probe

The local route is `POST /api/internal/revalidate`, Node runtime, force-dynamic,
and server-only. It needs a strong `BLOG_REVALIDATION_SECRET`; it then requires
`application/json`, a fresh timestamp, and a valid HMAC-SHA256 signature over
the exact raw body. It returns `204` only after authenticated invalidation.

The safe negative production probe sent one empty unsigned POST with
`Content-Type: text/plain`, no signature, no secret, and no valid event. A
deployed/configured receiver would reject this before invalidation with `415`
(or `503` if its secret were absent/weak). The live domain returned HTTP `200`
with the site's Next not-found HTML instead. A GET to the same path returned
HTTP `404`. The GET result alone is not evidence; the POST fallback response is
also not receiver behavior and is evidence that the live deployment does not
currently expose this route. It does not reveal the deployed commit.

No signed production request was sent.

## Vercel and environment configuration

The Vercel CLI is not installed in this execution environment and no project
linkage (`.vercel/project.json`) or `vercel.json` is present in the repository.
Consequently this preflight **could not verify** the following existing
portfolio-project facts:

- project owner/name (must be the existing portfolio project, never the new
  `cms-portfolio` CMS project);
- production Git branch, latest production deployment URL/commit, framework,
  Node version, or region;
- production scope/presence of `BLOG_REVALIDATION_SECRET` and `PAYLOAD_CMS_URL`;
- whether any production-only secret is incorrectly also assigned to Preview.

The source uses these runtime names: `PAYLOAD_CMS_URL` (published CMS REST
reads), `BLOG_REVALIDATION_SECRET` (receiver), and the unrelated existing
contact-page `NEXT_PUBLIC_FORMSPREE_FORM_URL`. Local environment files contain
the first two names, but this is not evidence of Vercel production scope or
values. Values were neither read nor printed.

## Local validation

| Command | Result |
| --- | --- |
| `bun install --frozen-lockfile` | PASS — lockfile unchanged. |
| `bun run validate:blog-contract` | PASS |
| `bun run validate:blog-revalidation` | PASS |
| `bun run validate:blog-seo` | PASS |
| `bun run validate:technical-rendering` | PASS |
| `bun run typecheck` | PASS |
| `bun run lint` | PASS with the existing `src/hooks/useProjects.tsx:123` exhaustive-deps warning; no errors. |
| `bun run build` | PASS in the local Rex terminal; build output includes `/api/internal/revalidate`, blog, RSS, sitemap, and robots routes. |
| Direct sandbox build attempt | BLOCKED by a sandbox-only Turbopack process/port-binding restriction; the unchanged Rex build passed. |
| `git diff --check` | PASS |
| `git status --short` | Clean before this report was added. |

## Required release gate

Before any production action, an operator must provide read-only Vercel evidence
for the **existing portfolio project**: owner/project identity, production
branch, current production deployment commit, Node/framework settings, and the
presence and environment scopes (not values) of `BLOG_REVALIDATION_SECRET` and
`PAYLOAD_CMS_URL`. `BLOG_REVALIDATION_SECRET` must be Production-only; do not
copy it to Preview. Confirm the CMS project remains separate.

If and only if Vercel confirms `main` is the portfolio production branch, the
proposed release source is exact commit `95c6a68` and the Git operation is a
fast-forward of remote `main` from `ba99794` to that commit, followed by the
normal Vercel production deployment for that branch. This operation would
publish all eight listed commits, not only the receiver.

After explicit authorization in this session, the controlled release should:

1. fast-forward/push the confirmed production branch only;
2. monitor the resulting portfolio deployment and record its URL/commit;
3. smoke-test `/`, `/blog`, `/blog/rss.xml`, `/sitemap.xml`, and a known draft
   URL only if one is supplied by the operator; and
4. repeat the same unsigned malformed POST probe, expecting `415`, `401`, or
   `503` rather than a fallback 404/HTML response. Do not send an authenticated
   invalidation without separate approval.

## Cleanup and Git

No temporary fixture, secret, deployment, provider configuration, or production
data was created or changed. This report is the only preflight change and is
intended for a local documentation commit. Nothing has been pushed.
