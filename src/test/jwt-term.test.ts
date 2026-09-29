import test from "node:test";
import assert from "node:assert";
import crypto from "crypto";
import {
  decodeJWT,
  verifyJWT,
  inspectJWT,
  base64UrlEncode,
} from "../index.js";

// Helper to create valid signed HMAC token
function createTestToken(payloadObj: any, secret: string = "super-secret-key"): string {
  const header = { alg: "HS256", typ: "JWT" };
  const h64 = base64UrlEncode(JSON.stringify(header));
  const p64 = base64UrlEncode(JSON.stringify(payloadObj));
  const signingInput = `${h64}.${p64}`;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(signingInput);
  const sig64 = base64UrlEncode(hmac.digest());

  return `${signingInput}.${sig64}`;
}

test("decodeJWT decodes valid JWT header and payload", () => {
  const token = createTestToken({
    sub: "user_12345",
    name: "Alice Developer",
    roles: ["admin", "dev"],
  });

  const decoded = decodeJWT(token);
  assert.strictEqual(decoded.header.alg, "HS256");
  assert.strictEqual(decoded.payload.sub, "user_12345");
  assert.deepStrictEqual(decoded.payload.roles, ["admin", "dev"]);
  assert.strictEqual(decoded.isValidStructure, true);
});

test("decodeJWT detects expired tokens accurately", () => {
  const pastSeconds = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
  const token = createTestToken({ sub: "user_expired", exp: pastSeconds });

  const decoded = decodeJWT(token);
  assert.strictEqual(decoded.isExpired, true);
  assert.ok(decoded.expiresInSeconds! < 0);
});

test("decodeJWT detects valid unexpired tokens", () => {
  const futureSeconds = Math.floor(Date.now() / 1000) + 3600; // in 1 hour
  const token = createTestToken({ sub: "user_valid", exp: futureSeconds });

  const decoded = decodeJWT(token);
  assert.strictEqual(decoded.isExpired, false);
  assert.ok(decoded.expiresInSeconds! > 0);
});

test("verifyJWT validates matching HMAC signature", () => {
  const secret = "my-jwt-secret";
  const token = createTestToken({ sub: "user_secure" }, secret);

  const validResult = verifyJWT(token, secret);
  assert.strictEqual(validResult.valid, true);

  const invalidResult = verifyJWT(token, "wrong-secret");
  assert.strictEqual(invalidResult.valid, false);
});

test("inspectJWT formats output cards and claims", () => {
  const futureSeconds = Math.floor(Date.now() / 1000) + 7200;
  const token = createTestToken({
    sub: "user_777",
    email: "alice@company.com",
    exp: futureSeconds,
  });

  const output = inspectJWT(token, { secret: "super-secret-key" });
  assert.ok(output.includes("HEADER"));
  assert.ok(output.includes("PAYLOAD"));
  assert.ok(output.includes("VALID"));
  assert.ok(output.includes("alice@company.com"));
  assert.ok(output.includes("Signature Verified Successfully"));
});

test("inspectJWT extracts specific claim", () => {
  const token = createTestToken({ sub: "user_999", email: "bob@company.com" });
  const emailClaim = inspectJWT(token, { claim: "email" });
  assert.strictEqual(emailClaim, "bob@company.com");
});
