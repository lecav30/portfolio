# Phase 7B: Portfolio technical content rendering

## Result

The public portfolio now renders the Phase 7A technical Lexical nodes on the
server: Shiki-highlighted code, KaTeX inline/display math, and responsive
tables. It also derives stable heading anchors and shows an SSR table of
contents when an article has at least three headings.

Primary implementation commit: `9d59aac feat(blog): render technical code math and tables`.

## CMS contract inspected

The CMS was inspected read-only at Phase 7A commit `448622d`:

| CMS node | Actual serialized shape | Portfolio mapping |
| --- | --- | --- |
| Code | `type: "block"`, `version: 2`, `fields.blockType: "Code"`, `fields.language`, `fields.code` | `<figure>` with visible language, small client-only copy control, and server-rendered `<pre><code>` highlighted by Shiki. |
| Display math | `type: "block"`, `version: 2`, `fields.blockType: "Math"`, `fields.latex` | Server KaTeX display output. |
| Inline math | `type: "inlineBlock"`, `version: 1`, `fields.blockType: "InlineMath"`, `fields.latex` | Server KaTeX inline output. |
| Tables | `table → tablerow → tablecell`; cells contain normal Lexical paragraphs; `headerState`, `colSpan`, `rowSpan`, `backgroundColor`, and `width` can occur | Responsive native table; validated header cells render as `<th scope>` and bounded spans are retained. The presentational color/width metadata is intentionally ignored. |

The CMS also caps code at 50,000 characters and LaTeX at 10,000. The portfolio
applies the same upper bounds before rendering; it remains defensive because
REST content is untrusted.

## Changes and decisions

- `src/views/blog/components/lexicalContent/index.tsx` preserves existing text,
  marks, paragraphs, headings, lists, links, images, and quotes while adding
  the exact Phase 7A technical nodes.
- Syntax highlighting is server-side Shiki token rendering. Token text remains
  React text (not raw HTML); unsupported declared languages visibly downgrade
  to plain text. Long lines scroll horizontally and empty snippets remain valid
  `<pre><code>` content without client JavaScript.
- KaTeX `renderToString` uses `trust: false`, `throwOnError: true`, and
  `htmlAndMathml`. Its only HTML insertion is KaTeX-generated output behind
  that boundary; malformed or overlong LaTeX falls back to escaped `<code>`.
  KaTeX styles are imported in the root layout.
- The isolated `codeCopyButton.tsx` is the only new client component. Its native
  button supports keyboard operation and announces copy success/failure through
  a polite live region. The article and all technical rendering remain server
  components, so static code stays readable before JavaScript loads.
- `src/services/cms/types.ts` now preserves only bounded table spans and valid
  header states while normalizing Lexical input. No raw CMS HTML is used.
- Heading IDs derive from visible heading text in document order: Unicode is
  normalized, punctuation removed, and collisions receive deterministic numeric
  suffixes. The SSR table of contents reads the same generated IDs.
- Added exact runtime dependencies, locked with Bun: `katex@0.19.1` and
  `shiki@4.5.0`. KaTeX adds math CSS/fonts; Shiki adds server-side grammars and
  no article-wide client bundle.

## Validation

| Command | Outcome | Coverage |
| --- | --- | --- |
| `bun install --frozen-lockfile` | PASS | 463 installs checked; no lockfile changes after intentional dependency update. |
| `bun run validate:technical-rendering` | PASS | Mock contract plus actual Phase 7A shapes, SSR code/math/table output, escaped code/XSS boundaries, invalid math fallback, safe links, unknown blocks, unsupported language fallback, heading/ToC IDs, and oversized input handling. |
| `bun run validate:blog-contract` | PASS | Existing published-only CMS contract. |
| `bun run validate:blog-revalidation` | PASS | Existing signed revalidation behavior. |
| `bun run validate:blog-seo` | PASS | Existing canonical metadata, JSON-LD, RSS, sitemap, and SEO checks. |
| `bun run typecheck` | PASS | TypeScript completed without errors. |
| `bun run lint` | PASS with pre-existing warning | Existing `src/hooks/useProjects.tsx:123` exhaustive-deps warning; no errors. |
| `bun run build` | PASS | Next.js 16.3.4 production build, including server-rendered blog routes. |
| `git diff --check` | PASS | No whitespace errors before the implementation commit. |

The technical-rendering check is a mocked/SSR contract test. It uses the real
Phase 7A JSON forms copied from the CMS validation fixture, not a live CMS
write. No live disposable fixture was created: the related CMS repository was
kept read-only, as requested, and no operator credentials or production service
was contacted.

## Accessibility, SSR, and residual coverage

- Code exposes its language, remains selectable/readable without JS, scrolls on
  narrow screens, and has a keyboard-accessible copy action with live feedback.
- KaTeX includes MathML through `htmlAndMathml`; invalid input has readable
  source fallback. Tables use native structure and header scopes.
- Anchors, ToC links, code, math, and table content occur in server HTML, so no
  client-only content is required for indexing. Existing metadata, JSON-LD,
  RSS/sitemap, 404/unavailable behavior, caching, and signed revalidation were
  unchanged and their existing validators passed.
- The CMS Phase 7A admin browser-editor test remains unperformed; that is
  separate residual CMS coverage. A real CMS-to-portfolio browser integration
  check was intentionally not run because the CMS stayed read-only.

## Cleanup and Git

No fixtures, CMS data, or external services were created. One stale generated
`.next/lock` from an interrupted local build was removed only after confirming
there was no active Next build, then the required build passed. No secrets were
printed or tracked. The implementation commit above is local only and was not
pushed.
