import { DecodedJWT, InspectOptions } from "./types.js";
import { decodeJWT } from "./decoder.js";
import { verifyJWT } from "./verifier.js";
import { formatTimestamp, formatRelativeTime } from "./utils/time.js";
import {
  ANSI_BOLD,
  ANSI_RESET,
  ANSI_DIM,
  ANSI_GREEN,
  ANSI_RED,
  ANSI_YELLOW,
  ANSI_CYAN,
  ANSI_MAGENTA,
  ANSI_BG_GREEN,
  ANSI_BG_RED,
  ANSI_BG_YELLOW,
  colorJson,
  drawCard,
} from "./utils/color.js";

/**
 * Format and inspect a JWT with colorful terminal presentation.
 */
export function inspectJWT(rawToken: string, options: InspectOptions = {}): string {
  const decoded = decodeJWT(rawToken);

  // If specific claim requested
  if (options.claim) {
    const val = decoded.payload[options.claim];
    if (val === undefined) {
      return `${ANSI_DIM}Claim "${options.claim}" not found in token payload${ANSI_RESET}`;
    }
    return typeof val === "object" ? JSON.stringify(val, null, 2) : String(val);
  }

  // If raw JSON output requested
  if (options.json) {
    return JSON.stringify(
      {
        header: decoded.header,
        payload: decoded.payload,
        signature: decoded.signature,
        isExpired: decoded.isExpired,
        expiresInSeconds: decoded.expiresInSeconds,
      },
      null,
      2
    );
  }

  const sections: string[] = [];

  // Title Banner
  sections.push(`\n${ANSI_BOLD}🔑 JWT Inspector (JSON Web Token)${ANSI_RESET}`);

  // 1. Status & Expiry Badge
  if (decoded.payload.exp !== undefined) {
    const expTime = decoded.payload.exp;
    const rel = formatRelativeTime(expTime);
    const abs = formatTimestamp(expTime);

    if (decoded.isExpired) {
      sections.push(
        `${ANSI_BG_RED}${ANSI_BOLD} EXPIRED ${ANSI_RESET} Token expired ${ANSI_RED}${ANSI_BOLD}${rel}${ANSI_RESET} at ${ANSI_DIM}${abs}${ANSI_RESET}`
      );
    } else {
      sections.push(
        `${ANSI_BG_GREEN}${ANSI_BOLD} VALID ${ANSI_RESET} Token expires in ${ANSI_GREEN}${ANSI_BOLD}${rel.replace(/^in /, "")}${ANSI_RESET} at ${ANSI_DIM}${abs}${ANSI_RESET}`
      );
    }
  } else {
    sections.push(
      `${ANSI_BG_YELLOW}${ANSI_BOLD} NO EXPIRATION ${ANSI_RESET} Token has no "exp" claim set.`
    );
  }

  // 2. Header Card
  const headerFormatted = colorJson(decoded.header);
  sections.push(drawCard(`HEADER: Algorithm & Token Type (${decoded.header.alg || "none"})`, headerFormatted, ANSI_CYAN));

  // 3. Payload Card
  const payloadFormatted = colorJson(decoded.payload);
  sections.push(drawCard("PAYLOAD: Data & Claims", payloadFormatted, ANSI_GREEN));

  // 4. Important Claims Summary
  const claimsSummary: string[] = [];
  if (decoded.payload.sub) {
    claimsSummary.push(`• Subject (sub): ${ANSI_BOLD}${decoded.payload.sub}${ANSI_RESET}`);
  }
  if (decoded.payload.iss) {
    claimsSummary.push(`• Issuer (iss): ${ANSI_BOLD}${decoded.payload.iss}${ANSI_RESET}`);
  }
  if (decoded.payload.aud) {
    claimsSummary.push(`• Audience (aud): ${ANSI_BOLD}${JSON.stringify(decoded.payload.aud)}${ANSI_RESET}`);
  }
  if (decoded.payload.iat) {
    claimsSummary.push(`• Issued At (iat): ${formatTimestamp(decoded.payload.iat)} (${formatRelativeTime(decoded.payload.iat)})`);
  }
  if (decoded.payload.nbf) {
    claimsSummary.push(`• Not Before (nbf): ${formatTimestamp(decoded.payload.nbf)} (${formatRelativeTime(decoded.payload.nbf)})`);
  }

  if (claimsSummary.length > 0) {
    sections.push(drawCard("STANDARD CLAIMS SUMMARY", claimsSummary.join("\n"), ANSI_MAGENTA));
  }

  // 5. Signature Verification Card
  if (options.secret || options.publicKey) {
    const key = (options.secret || options.publicKey)!;
    const res = verifyJWT(rawToken, key);

    if (res.valid) {
      sections.push(
        drawCard(
          "SIGNATURE VERIFICATION",
          `${ANSI_GREEN}${ANSI_BOLD}✔ Signature Verified Successfully!${ANSI_RESET}\n  Algorithm: ${res.algorithm}`,
          ANSI_GREEN
        )
      );
    } else {
      sections.push(
        drawCard(
          "SIGNATURE VERIFICATION",
          `${ANSI_RED}${ANSI_BOLD}✖ Signature Verification Failed!${ANSI_RESET}\n  Error: ${res.error}\n  Algorithm: ${res.algorithm}`,
          ANSI_RED
        )
      );
    }
  } else {
    sections.push(
      `${ANSI_DIM}ℹ Signature: ${decoded.rawSignature.slice(0, 20)}... (verify with --secret <key>)${ANSI_RESET}`
    );
  }

  return sections.join("\n\n");
}
