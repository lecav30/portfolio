import { toSafeHttpUrl, type LexicalNode } from "@services/cms/types";
import type { ReactNode } from "react";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const safeLink = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  return toSafeHttpUrl(value);
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

const childrenOf = (node: LexicalNode, key: string): ReactNode =>
  node.children?.map((child, index) => <LexicalNodeView key={`${key}-${index}`} node={child} nodeKey={`${key}-${index}`} />) ?? null;

function LexicalNodeView({ node, nodeKey }: { node: LexicalNode; nodeKey: string }) {
  const children = childrenOf(node, nodeKey);

  switch (node.type) {
    case "text":
      return <>{renderFormattedText(node)}</>;
    case "linebreak":
      return <br />;
    case "paragraph":
      return <p className="leading-8 text-slate-700 dark:text-slate-200">{children}</p>;
    case "heading": {
      // The article title owns the page's only h1. CMS content headings begin at h2.
      const tag = node.tag === "h1" ? "h2" : node.tag;
      const className = "mt-10 font-bold text-slate-950 dark:text-white";
      if (tag === "h3") return <h3 className={`${className} text-xl`}>{children}</h3>;
      if (tag === "h4") return <h4 className={`${className} text-lg`}>{children}</h4>;
      return <h2 className={`${className} text-2xl`}>{children}</h2>;
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
    default:
      return <>{children}</>;
  }
}

export default function LexicalContent({ content }: { content: LexicalNode }) {
  return <div className="space-y-6 text-base sm:text-lg">{childrenOf(content, "root")}</div>;
}
