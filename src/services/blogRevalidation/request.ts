import { MAX_REVALIDATION_BODY_BYTES } from "./contract";

export class RevalidationBodyTooLargeError extends Error {}

export const readRawRevalidationBody = async (request: Request): Promise<Uint8Array> => {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REVALIDATION_BODY_BYTES) {
    throw new RevalidationBodyTooLargeError();
  }

  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();

  const chunks: Uint8Array[] = [];
  let length = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    length += value.byteLength;
    if (length > MAX_REVALIDATION_BODY_BYTES) {
      void reader.cancel().catch(() => undefined);
      throw new RevalidationBodyTooLargeError();
    }
    chunks.push(value);
  }

  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body;
};
