import { CmsUnavailableError, listAllPublishedPosts } from "@services/cms";
import { createRssXml } from "@services/blog/seo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  try {
    const posts = await listAllPublishedPosts();
    return new Response(createRssXml(posts), {
      headers: {
        "cache-control": "no-store",
        "content-type": "application/rss+xml; charset=utf-8",
      },
    });
  } catch (error) {
    if (error instanceof CmsUnavailableError) {
      return new Response("Service unavailable", { headers: { "cache-control": "no-store" }, status: 503 });
    }

    return new Response("Service unavailable", { headers: { "cache-control": "no-store" }, status: 503 });
  }
}
