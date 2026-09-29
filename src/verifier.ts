import crypto from "crypto";
import { VerificationResult } from "./types.js";
import { decodeJWT } from "./decoder.js";
import { base64UrlEncode, base64UrlToBuffer } from "./utils/base64.js";

const HMAC_ALGS: Record<string, string> = {
  HS256: "sha256",
  HS384: "sha384",
  HS512: "sha512",
};

const RSA_ECDSA_ALGS: Record<string, string> = {
  RS256: "RSA-SHA256",
  RS384: "RSA-SHA384",
  RS512: "RSA-SHA512",
  ES256: "sha256",
  ES384: "sha384",
  ES512: "sha512",
};

/**
 * Verify JWT signature using secret key (for HMAC) or public key (for RSA/ECDSA).
 */
export function verifyJWT(rawToken: string, secretOrPublicKey: string): VerificationResult {
  try {
    const decoded = decodeJWT(rawToken);
    const alg = decoded.header.alg;

    if (!alg || alg === "none") {
      return {
        valid: false,
        algorithm: alg || "none",
        error: "Token has algorithm 'none' (unsigned)",
      };
    }

    const signingInput = `${decoded.rawHeader}.${decoded.rawPayload}`;

    // 1. HMAC Verification
    if (HMAC_ALGS[alg]) {
      const hashAlg = HMAC_ALGS[alg];
      const hmac = crypto.createHmac(hashAlg, secretOrPublicKey);
      hmac.update(signingInput);
      const expectedSignature = base64UrlEncode(hmac.digest());

      const valid = crypto.timingSafeEqual(
        Buffer.from(decoded.rawSignature),
        Buffer.from(expectedSignature)
      );

      return {
        valid,
        algorithm: alg,
        error: valid ? undefined : "HMAC signature mismatch",
      };
    }

    // 2. RSA / ECDSA Verification
    if (RSA_ECDSA_ALGS[alg]) {
      const hashAlg = RSA_ECDSA_ALGS[alg];
      const verifier = crypto.createVerify(hashAlg);
      verifier.update(signingInput);
      const signatureBuf = base64UrlToBuffer(decoded.rawSignature);

      const valid = verifier.verify(secretOrPublicKey, signatureBuf);

      return {
        valid,
        algorithm: alg,
        error: valid ? undefined : "Public key signature verification failed",
      };
    }

    return {
      valid: false,
      algorithm: alg,
      error: `Unsupported algorithm: ${alg}`,
    };
  } catch (err: any) {
    return {
      valid: false,
      algorithm: "unknown",
      error: err.message || "Verification failed",
    };
  }
}
