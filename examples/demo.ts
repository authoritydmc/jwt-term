import { inspectJWT, decodeJWT, verifyJWT, base64UrlEncode } from "../src/index.js";
import crypto from "crypto";

// Create sample token
const header = { alg: "HS256", typ: "JWT" };
const payload = {
  sub: "auth0|64109fa882b",
  name: "Jane Doe",
  email: "jane.doe@enterprise.io",
  roles: ["admin", "billing_manager"],
  permissions: ["read:reports", "write:settings", "manage:users"],
  iss: "https://auth.enterprise.io/",
  aud: ["https://api.enterprise.io/v2", "https://billing.enterprise.io"],
  iat: Math.floor(Date.now() / 1000) - 1800, // 30 mins ago
  exp: Math.floor(Date.now() / 1000) + 7200, // in 2 hours
};

const secret = "production-super-secret-key-9988";

const h64 = base64UrlEncode(JSON.stringify(header));
const p64 = base64UrlEncode(JSON.stringify(payload));
const input = `${h64}.${p64}`;

const hmac = crypto.createHmac("sha256", secret);
hmac.update(input);
const token = `${input}.${base64UrlEncode(hmac.digest())}`;

console.log("=== 1. Inspect Full JWT ===");
console.log(inspectJWT(token, { secret }));

console.log("\n=== 2. Extract Specific Claim ===");
console.log("Subject:", inspectJWT(token, { claim: "sub" }));
console.log("Roles:", inspectJWT(token, { claim: "roles" }));

console.log("\n=== 3. Verify Signature Programmatically ===");
const result = verifyJWT(token, secret);
console.log("Verification Result:", result);
