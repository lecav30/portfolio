import { createHmac, timingSafeEqual } from "node:crypto";

export const hasStrongRevalidationSecret = (secret: string | undefined): secret is string =>
  typeof secret === "string" && Buffer.byteLength(secret.trim(), "utf8") >= 32;

export const signingBytes = (timestamp: string, body: Uint8Array): Buffer =>
  Buffer.concat([Buffer.from(`${timestamp}.`, "utf8"), Buffer.from(body)]);

export const signRevalidationBody = (secret: string, timestamp: string, body: Uint8Array): string =>
  `sha256=${createHmac("sha256", secret).update(signingBytes(timestamp, body)).digest("hex")}`;

export const verifyRevalidationSignature = ({
  body,
  secret,
  signature,
  timestamp,
}: {
  body: Uint8Array;
  secret: string;
  signature: string | null;
  timestamp: string;
}): boolean => {
  if (!signature || !/^sha256=[0-9a-f]{64}$/.test(signature)) return false;

  const expected = Buffer.from(signRevalidationBody(secret, timestamp, body).slice("sha256=".length), "hex");
  const supplied = Buffer.from(signature.slice("sha256=".length), "hex");

  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
};
