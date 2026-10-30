import { serializeJsonLd } from "@services/blog/seo";

export default function BlogJsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} type="application/ld+json" />;
}
