# Phase 8F: Portfolio production release gate

## Status: WAITING FOR OPERATOR AUTHORIZATION — NO-GO

This refreshed preflight did not push, merge, deploy, change a Vercel variable,
or touch the CMS, Neon, R2, Cloudflare, or DNS.

## Git identity and safe release path

The repository is `/Users/lecav/Documents/own/sebastianlevano/portfolio` on
local branch `develop`. Remote state was refreshed with `git fetch origin
--prune` during this gate.

| Item | Verified value |
| --- | --- |
| Preflight source HEAD | `03a644773e61c3be5f2159897e635b63bdb85dc8` |
| Remote branches | `origin/main` only; there is no `origin/develop` |
| `origin/main` | `ba99794b8cec4684813cd9263df78cda1eaf4b7a` |
| Divergence (`origin/main...develop`) | `0 9` |
| Merge base | `ba99794b8cec4684813cd9263df78cda1eaf4b7a` |
| Fast-forward assessment | Safe locally: `origin/main` is an ancestor of `develop`; no reset, rebase, force push, or merge was run. |

The candidate includes the signed receiver (`c08715f`), blog integration,
technical SEO, and technical rendering. A release therefore publishes all nine
commits, not only the receiver. Branch protection and Vercel's actual production
branch are not known, so the fast-forward assessment is not authorization to
push.

## Vercel identity and configuration: blocked

No `.vercel` linkage or `vercel.json` exists in this repository, and the Vercel
CLI is not installed in this execution environment. The following have **not**
been verified:

- existing portfolio Vercel project owner/name and linked GitHub repository;
- production branch, active production deployment URL/commit, framework,
  Node version, region, and build configuration;
- Production/Preview scopes for `BLOG_REVALIDATION_SECRET` and
  `PAYLOAD_CMS_URL`.

The code requires `BLOG_REVALIDATION_SECRET` for the receiver and
`PAYLOAD_CMS_URL` for anonymous published CMS reads. An unrelated existing
contact-page setting, `NEXT_PUBLIC_FORMSPREE_FORM_URL`, was also discovered.
Only names were inspected; no environment values were read or emitted.

To clear this blocker, an operator must use the Vercel Dashboard or an
authenticated Vercel CLI linked explicitly to the **existing portfolio
project**, never `cms-portfolio`. If a link is needed, obtain approval first,
then run `vercel link` from this repository and select the portfolio project;
do not create a project. Record names/scopes only: the two server-side blog
variables must be present in Production, and the production revalidation secret
must not be copied to Preview. Confirm the Vercel production branch and active
deployment SHA before release.

## Receiver availability probe

A single non-mutating public POST was sent to
`https://www.sebastianlevano.com/api/internal/revalidate` with an empty body,
`Content-Type: text/plain`, no signature, and no secret. It returned
`200 text/html; charset=utf-8` containing Next's not-found document.

A deployed receiver would reject this request before cache invalidation with
`415` (configured receiver) or `503` (missing/weak secret); it must not return
the framework fallback. This confirms the current public deployment still does
not expose the intended receiver behavior. It does not identify the deployment
commit and does not test the shared secret. No valid signed request was sent.

## Local validation

| Command | Result |
| --- | --- |
| `bun install --frozen-lockfile` | PASS |
| `bun run validate:blog-contract` | PASS |
| `bun run validate:blog-revalidation` | PASS |
| `bun run validate:blog-seo` | PASS |
| `bun run validate:technical-rendering` | PASS |
| `bun run typecheck` | PASS |
| `bun run lint` | PASS with the existing `src/hooks/useProjects.tsx:123` exhaustive-deps warning; no errors. |
| `bun run build` | PASS in the local Rex terminal; output includes `/api/internal/revalidate`, blog, RSS, sitemap, and robots routes. |
| `git diff --check` | PASS |
| Worktree before this report | Clean |

## Required operator checkpoint

Before any Git or Vercel mutation, the operator must provide or authorize
read-only verification of:

1. portfolio Vercel project identity and GitHub repository (not `cms-portfolio`);
2. production branch and active deployment SHA;
3. production framework/Node/build settings; and
4. presence and scopes, without values, of `BLOG_REVALIDATION_SECRET` and
   `PAYLOAD_CMS_URL`.

If that evidence confirms `main` is the portfolio production branch, re-check
the exact `develop` SHA at the authorization time, then use the repository's
required protected-branch workflow: an approved PR if required, otherwise a
fast-forward-only push from the verified `develop` tip to `main`. Do not force
push. Monitor the resulting Vercel production deployment, confirm its commit,
then repeat only the same malformed unauthenticated POST. A `415`, `401`, or
`503` response proves the route is deployed; it does **not** validate that CMS
and portfolio share the correct secret.

No release approval has been received in this session. No production action was
performed.
