import { DecodedJWT, JWTHeader, JWTPayload } from "./types.js";
import { base64UrlDecode } from "./utils/base64.js";

/**
 * Decode a JWT token without verifying signature.
 */
export function decodeJWT(rawToken: string): DecodedJWT {
  const token = rawToken.trim().replace(/^Bearer\s+/i, "");
  const parts = token.split(".");

  if (parts.length < 2 || parts.length > 3) {
    throw new Error(
      `Invalid JWT format: expected 3 dot-separated parts (header.payload.signature), got ${parts.length}`
    );
  }

  const [rawHeader, rawPayload, rawSignature = ""] = parts;

  let header: JWTHeader;
  let payload: JWTPayload;

  try {
    header = JSON.parse(base64UrlDecode(rawHeader));
  } catch (err: any) {
    throw new Error(`Failed to parse JWT header JSON: ${err.message}`);
  }

  try {
    payload = JSON.parse(base64UrlDecode(rawPayload));
  } catch (err: any) {
    throw new Error(`Failed to parse JWT payload JSON: ${err.message}`);
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  let isExpired = false;
  let expiresInSeconds: number | undefined;

  if (typeof payload.exp === "number") {
    expiresInSeconds = payload.exp - nowSeconds;
    isExpired = expiresInSeconds <= 0;
  }

  return {
    raw: token,
    header,
    payload,
    signature: rawSignature,
    rawHeader,
    rawPayload,
    rawSignature,
    isExpired,
    isValidStructure: true,
    expiresInSeconds,
  };
}
