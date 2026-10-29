import { revalidatePath, revalidateTag } from "next/cache";

import { invalidateBlogCaches } from "@services/blogRevalidation/cache";
import {
  parseBlogRevalidationEvent,
  validateRevalidationTimestamp,
} from "@services/blogRevalidation/contract";
import { hasStrongRevalidationSecret, verifyRevalidationSignature } from "@services/blogRevalidation/crypto";
import { readRawRevalidationBody, RevalidationBodyTooLargeError } from "@services/blogRevalidation/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (status: number, error: string) =>
  Response.json({ error }, { headers: { "cache-control": "no-store" }, status });

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.BLOG_REVALIDATION_SECRET;
  if (!hasStrongRevalidationSecret(secret)) return json(503, "Unavailable");

  const contentType = request.headers.get("content-type")?.toLowerCase();
  if (!contentType || !/^application\/json(?:\s*;|$)/.test(contentType)) {
    return json(415, "Unsupported media type");
  }

  const timestamp = validateRevalidationTimestamp(request.headers.get("x-blog-revalidation-timestamp"));
  if (!timestamp) return json(401, "Unauthorized");

  let body: Uint8Array;
  try {
    body = await readRawRevalidationBody(request);
  } catch (error) {
    return error instanceof RevalidationBodyTooLargeError ? json(413, "Payload too large") : json(400, "Invalid request");
  }

  if (
    !verifyRevalidationSignature({
      body,
      secret,
      signature: request.headers.get("x-blog-revalidation-signature"),
      timestamp,
    })
  ) {
    return json(401, "Unauthorized");
  }

  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder().decode(body));
  } catch {
    return json(400, "Invalid request");
  }

  const event = parseBlogRevalidationEvent(value);
  if (!event) return json(400, "Invalid request");

  invalidateBlogCaches(event, { revalidatePath, revalidateTag });

  return new Response(null, { headers: { "cache-control": "no-store" }, status: 204 });
}
