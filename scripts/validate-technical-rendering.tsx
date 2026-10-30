import { renderToReadableStream } from "react-dom/server";
import { createElement } from "react";

import LexicalContent from "../src/views/blog/components/lexicalContent";
import { normalizePost, type LexicalNode } from "../src/services/cms/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const text = (value: string): LexicalNode => ({ format: 0, text: value, type: "text" });
const paragraph = (...children: LexicalNode[]): LexicalNode => ({ children, type: "paragraph" });
const heading = (value: string, tag = "h2"): LexicalNode => ({ children: [text(value)], tag, type: "heading" });

const actualPhase7ANodes: LexicalNode[] = [
  heading("Introducción"),
  heading("Introducción"),
  heading("Café técnico", "h3"),
  {
    fields: {
      blockType: "Code",
      code: "const answer = '<script>inert</script>';\n",
      id: "665f00000000000000000001",
      language: "typescript",
    },
    format: "",
    type: "block",
  },
  paragraph(text("La fórmula en línea es "), {
    fields: { blockType: "InlineMath", id: "665f00000000000000000002", latex: "x^2 + y^2" },
    type: "inlineBlock",
  }, text(".")),
  {
    fields: { blockType: "Math", id: "665f00000000000000000003", latex: "\\int_0^1 x^2 \\, dx = \\frac{1}{3}" },
    format: "",
    type: "block",
  },
  {
    children: [
      {
        children: [
          { children: [paragraph(text("Lenguaje"))], colSpan: 1, headerState: 3, rowSpan: 1, type: "tablecell" },
          { children: [paragraph(text("Uso"))], colSpan: 1, headerState: 3, rowSpan: 1, type: "tablecell" },
        ],
        type: "tablerow",
      },
      {
        children: [
          { children: [paragraph(text("TypeScript"))], colSpan: 1, headerState: 0, rowSpan: 1, type: "tablecell" },
          { children: [paragraph({ children: [text("Guía segura")], type: "link", url: "/blog" })], colSpan: 1, headerState: 0, rowSpan: 1, type: "tablecell" },
        ],
        type: "tablerow",
      },
    ],
    type: "table",
  },
  paragraph({ children: [text("enlace inseguro")], type: "link", url: "javascript:alert(1)" }),
  { fields: { blockType: "Code", code: "plain <b>text</b>", language: "made-up" }, type: "block" },
  { fields: { blockType: "Math", latex: "\\notARealCommand{" }, type: "block" },
  { fields: { blockType: "Unknown", text: "must not render" }, type: "block" },
];

async function render(content: LexicalNode): Promise<string> {
  const stream = await renderToReadableStream(createElement(LexicalContent, { content }));
  await stream.allReady;
  return new Response(stream).text();
}

async function main() {
  const normalized = normalizePost({
    _status: "published",
    category: { id: 1, name: "Technical", slug: "technical" },
    content: { root: { children: actualPhase7ANodes, type: "root" } },
    contentType: "article",
    id: 1,
    noIndex: false,
    slug: "technical-fixture",
    tags: [],
    title: "Technical fixture",
  });
  assert(normalized, "The published Phase 7A fixture should normalize.");
  assert(normalized.content.children?.[6]?.children?.[0]?.children?.[0]?.headerState === 3, "Table headerState was not preserved.");
  assert(normalized.content.children?.[6]?.children?.[0]?.children?.[0]?.colSpan === 1, "Table colSpan was not preserved.");

  const html = await render(normalized.content);
  assert(html.includes("typescript"), "Known code languages should be shown.");
  assert(html.includes("answer"), "Code should be rendered in SSR HTML.");
  assert(html.includes("&lt;script&gt;inert&lt;/script&gt;"), "Code must be escaped rather than interpreted as HTML.");
  assert(!html.includes("<script>inert</script>"), "Code must not create a script element.");
  assert(html.includes("katex"), "Valid inline and display math should use KaTeX SSR markup.");
  assert(html.includes("<table"), "Tables should render as tables.");
  assert(html.includes("<th") && html.includes('scope="col"'), "Header table cells need column header semantics.");
  assert(html.includes('href="/blog"'), "Safe relative links in table cells should render.");
  assert(!html.includes("javascript:alert"), "Unsafe link schemes must not render as links.");
  assert(html.includes('id="introduccion"') && html.includes('id="introduccion-2"') && html.includes('id="cafe-tecnico"'), "Heading IDs should be normalized and unique.");
  assert(html.includes('href="#introduccion-2"'), "The server-rendered table of contents must use heading IDs.");
  assert(html.includes(">texto<"), "Unsupported code languages should downgrade to text.");
  assert(html.includes("plain &lt;b&gt;text&lt;/b&gt;"), "Unsupported-language code should remain safely readable.");
  assert(html.includes("notARealCommand"), "Invalid math should fall back to readable source.");
  assert(!html.includes("must not render"), "Unknown technical blocks should not render arbitrary fields.");

  const oversized = await render({
    children: [{ fields: { blockType: "Code", code: "x".repeat(50_001), language: "text" }, type: "block" }],
    type: "root",
  });
  assert(!oversized.includes("Copiar"), "Oversized technical fields should be discarded.");

  console.log("Technical Lexical SSR contract validation passed.");
}

await main();
