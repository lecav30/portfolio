import { toSafeHttpUrl, type LexicalNode } from "@services/cms/types";
import katex from "katex";
import { getSingletonHighlighter } from "shiki";
import type { ReactNode } from "react";

import CodeCopyButton from "./codeCopyButton";

const codeLanguages = ["text", "typescript", "javascript", "tsx", "json", "bash", "python", "sql"] as const;
type CodeLanguage = (typeof codeLanguages)[number];

const maxCodeLength = 50_000;
const maxLatexLength = 10_000;
const highlighter = getSingletonHighlighter({ langs: [...codeLanguages], themes: ["github-dark"] });

type Heading = { id: string; level: number; text: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const safeLink = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  return toSafeHttpUrl(value);
};

const isCodeLanguage = (value: unknown): value is CodeLanguage =>
  typeof value === "string" && codeLanguages.includes(value as CodeLanguage);

const nodeText = (node: LexicalNode): string => {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "inlineBlock" && node.fields?.blockType === "InlineMath" && typeof node.fields.latex === "string") {
    return node.fields.latex;
  }

  return node.children?.map(nodeText).join("") ?? "";
};

const headingSlug = (text: string): string => {
  const normalized = text
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "seccion";
};

const headingsFrom = (root: LexicalNode): Map<string, Heading> => {
  const headings = new Map<string, Heading>();
  const counts = new Map<string, number>();

  const visit = (node: LexicalNode, key: string) => {
    if (node.type === "heading") {
      const text = nodeText(node).trim();
      const base = headingSlug(text);
      const count = (counts.get(base) ?? 0) + 1;
      counts.set(base, count);
      const tag = node.tag ?? "h2";
      const level = tag === "h3" ? 3 : tag === "h4" ? 4 : tag === "h5" ? 5 : tag === "h6" ? 6 : 2;
      headings.set(key, { id: count === 1 ? base : `${base}-${count}`, level, text: text || "Sección" });
    }

    node.children?.forEach((child, index) => visit(child, `${key}-${index}`));
  };

  root.children?.forEach((child, index) => visit(child, `root-${index}`));
  return headings;
};

const renderFormattedText = (node: LexicalNode): ReactNode => {
  let result: ReactNode = node.text ?? "";
  const format = typeof node.format === "number" ? node.format : 0;

  if (format & 1) result = <strong>{result}</strong>;
  if (format & 2) result = <em>{result}</em>;
  if (format & 8) result = <span className="underline">{result}</span>;
  if (format & 16) result = <s>{result}</s>;
  if (format & 32) result = <code className="rounded bg-slate-200 px-1 py-0.5 text-sm dark:bg-slate-800">{result}</code>;

  return result;
};

const uploadFromNode = (node: LexicalNode) => {
  const value = isRecord(node.value) ? node.value : undefined;
  const url = toSafeHttpUrl(value?.url);
  const alt = typeof value?.alt === "string" && value.alt.trim() ? value.alt.trim() : undefined;

  return url && alt ? { alt, url } : undefined;
};

const textField = (node: LexicalNode, name: string, maximum: number): string | undefined => {
  const value = node.fields?.[name];
  return typeof value === "string" && value.length <= maximum ? value : undefined;
};

async function HighlightedCode({ code, language }: { code: string; language: CodeLanguage }) {
  let tokens: Awaited<ReturnType<Awaited<typeof highlighter>["codeToTokensBase"]>> | undefined;

  try {
    tokens = await (await highlighter).codeToTokensBase(code, { lang: language, theme: "github-dark" });
  } catch {}

  return (
    <pre className="overflow-x-auto p-4 text-sm leading-6 text-slate-100" tabIndex={0}>
      <code>
        {tokens
          ? tokens.map((line, lineIndex) => (
            <span key={lineIndex}>
                {line.map((token, tokenIndex) => (
                  <span key={tokenIndex} style={token.color ? { color: token.color } : undefined}>
                    {token.content}
                  </span>
                ))}
                {lineIndex < tokens.length - 1 ? "\n" : null}
            </span>
            ))
          : code}
      </code>
    </pre>
  );
}

function Math({ display, latex }: { display: boolean; latex: string }) {
  let html: string | undefined;

  try {
    html = katex.renderToString(latex, {
      displayMode: display,
      output: "htmlAndMathml",
      strict: "warn",
      throwOnError: true,
      trust: false,
    });
  } catch {}

  // KaTeX produces this markup from the string above with trust disabled; no CMS HTML is passed through.
  return html ? <span dangerouslySetInnerHTML={{ __html: html }} /> : <code className="rounded bg-slate-200 px-1 py-0.5 text-sm dark:bg-slate-800">{latex}</code>;
}

const childrenOf = (node: LexicalNode, key: string, headings: Map<string, Heading>): ReactNode =>
  node.children?.map((child, index) => <LexicalNodeView headings={headings} key={`${key}-${index}`} node={child} nodeKey={`${key}-${index}`} />) ?? null;

function LexicalNodeView({ headings, node, nodeKey }: { headings: Map<string, Heading>; node: LexicalNode; nodeKey: string }) {
  const children = childrenOf(node, nodeKey, headings);

  switch (node.type) {
    case "text":
      return <>{renderFormattedText(node)}</>;
    case "linebreak":
      return <br />;
    case "paragraph":
      return <p className="leading-8 text-slate-700 dark:text-slate-200">{children}</p>;
    case "heading": {
      const heading = headings.get(nodeKey);
      const className = "scroll-mt-24 mt-10 font-bold text-slate-950 dark:text-white";
      if (heading?.level === 3) return <h3 className={`${className} text-xl`} id={heading.id}>{children}</h3>;
      if (heading?.level === 4) return <h4 className={`${className} text-lg`} id={heading.id}>{children}</h4>;
      if (heading?.level === 5) return <h5 className={`${className} text-base`} id={heading.id}>{children}</h5>;
      if (heading?.level === 6) return <h6 className={`${className} text-sm`} id={heading.id}>{children}</h6>;
      // The article title owns the page's only h1. CMS content headings begin at h2.
      return <h2 className={`${className} text-2xl`} id={heading?.id}>{children}</h2>;
    }
    case "quote":
      return <blockquote className="border-l-4 border-main pl-4 italic text-slate-700 dark:text-slate-200">{children}</blockquote>;
    case "list":
      return node.listType === "number" || node.tag === "ol" ? (
        <ol className="list-decimal space-y-2 pl-6">{children}</ol>
      ) : (
        <ul className="list-disc space-y-2 pl-6">{children}</ul>
      );
    case "listitem":
    case "list-item":
      return <li>{children}</li>;
    case "link":
    case "autolink": {
      const href = safeLink(node.url ?? node.fields?.url);
      return href ? (
        <a className="text-main underline underline-offset-4" href={href} rel="noreferrer noopener">
          {children}
        </a>
      ) : (
        <>{children}</>
      );
    }
    case "upload": {
      const upload = uploadFromNode(node);
      return upload ? (
        <figure className="my-8">
          {/* CMS Media URLs are validated as HTTP(S); do not use untrusted HTML. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={upload.alt} className="h-auto w-full rounded-2xl border border-slate-200 dark:border-slate-800" loading="lazy" src={upload.url} />
          <figcaption className="mt-2 text-sm text-slate-500 dark:text-slate-400">{upload.alt}</figcaption>
        </figure>
      ) : null;
    }
    case "block": {
      const blockType = node.fields?.blockType;
      if (blockType === "Code") {
        const code = textField(node, "code", maxCodeLength);
        const language = node.fields?.language;
        if (code === undefined) return null;
        const knownLanguage = isCodeLanguage(language) ? language : "text";
        return (
          <figure className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-sm">
            <figcaption className="flex items-center justify-between gap-3 border-b border-slate-700 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-300">
              <span>{isCodeLanguage(language) ? language : "texto"}</span>
              <CodeCopyButton code={code} />
            </figcaption>
            <HighlightedCode code={code} language={knownLanguage} />
          </figure>
        );
      }
      if (blockType === "Math") {
        const latex = textField(node, "latex", maxLatexLength);
        return latex === undefined ? null : <div className="overflow-x-auto py-2 text-center"><Math display latex={latex} /></div>;
      }
      return null;
    }
    case "inlineBlock": {
      if (node.fields?.blockType !== "InlineMath") return null;
      const latex = textField(node, "latex", maxLatexLength);
      return latex === undefined ? null : <Math display={false} latex={latex} />;
    }
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-full border-collapse text-left text-sm sm:text-base">
            <tbody>{children}</tbody>
          </table>
        </div>
      );
    case "tablerow":
      return <tr className="border-b border-slate-200 last:border-0 dark:border-slate-800">{children}</tr>;
    case "tablecell": {
      const header = (node.headerState ?? 0) !== 0;
      const props = { colSpan: node.colSpan, rowSpan: node.rowSpan };
      const className = "min-w-32 border-r border-slate-200 px-4 py-3 align-top last:border-r-0 dark:border-slate-800";
      if (header) {
        const scope = node.headerState === 1 ? "row" : "col";
        return <th className={`${className} bg-slate-100 font-semibold text-slate-950 dark:bg-slate-900 dark:text-white`} scope={scope} {...props}>{children}</th>;
      }
      return <td className={className} {...props}>{children}</td>;
    }
    default:
      return <>{children}</>;
  }
}

function TableOfContents({ headings }: { headings: Heading[] }) {
  if (headings.length < 3) return null;

  return (
    <nav aria-label="Tabla de contenidos" className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="font-semibold text-slate-950 dark:text-white">En este artículo</p>
      <ol className="mt-2 space-y-1 text-sm">
        {headings.map((heading) => (
          <li className={heading.level > 2 ? "ml-4" : undefined} key={heading.id}>
            <a className="text-main underline-offset-4 hover:underline" href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function LexicalContent({ content }: { content: LexicalNode }) {
  const headingsByKey = headingsFrom(content);
  const headings = [...headingsByKey.values()];

  return (
    <div className="space-y-6 text-base sm:text-lg">
      <TableOfContents headings={headings} />
      {childrenOf(content, "root", headingsByKey)}
    </div>
  );
}
