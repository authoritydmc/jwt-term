# jwt-term 🔑

[![CI](https://github.com/authoritydmc/jwt-term/actions/workflows/ci.yml/badge.svg)](https://github.com/authoritydmc/jwt-term/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/jwt-term.svg?style=flat&color=brightgreen)](https://www.npmjs.com/package/jwt-term)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> **High-fidelity inline terminal JWT inspector, decoder, cryptographic signature verifier, and live expiry countdown timer** across macOS, Linux, and Windows.

Never paste private JWT tokens into online websites again. Inspect claims, decode payloads, verify cryptographic signatures, and watch token expirations offline directly in your terminal.

---

## ✨ Features

- 🛡️ **100% Offline & Private**: Zero network telemetry. Your tokens and secret keys never leave your machine.
- 📦 **Visual Box Cards & JSON Syntax Highlighting**: Color-coded headers, payloads, algorithms, and timestamps.
- ⏱️ **Live Expiry & TTL Badge**: Instant status indicator (`VALID`, `EXPIRED`, `NO EXPIRATION`) with humanized time-to-live ("expires in 1h 45m" / "expired 3 days ago").
- 🔒 **Cryptographic Signature Verification**:
  - HMAC: `HS256`, `HS384`, `HS512` (via `--secret <key>`).
  - RSA & ECDSA: `RS256`, `RS384`, `RS512`, `ES256`, `ES384`, `ES512` (via `--key <pem-file>`).
- 🎯 **Specific Claim Extraction**: Extract specific claims (e.g. `jwtx <token> --claim email` or `sub`, `roles`) for shell script pipelines.
- ⚡ **Live Watch Mode**: Real-time ticker countdown (`--watch`) updating every second until token expiration.
- 🚰 **Pipe-Friendly**: Ingest tokens from `pbpaste`, environment variables (`$TOKEN`), files, or stdin.
- 📦 **Zero Native C++ Dependencies**: Pure TypeScript utilizing Node's built-in `crypto`.

---

## 🚀 Installation

### Global CLI Tool
```bash
npm install -g jwt-term
# or run directly with npx
npx jwt-term <token>
# or using short alias
npx jwtx <token>
```

### In Your Project (Library)
```bash
npm install jwt-term
```

---

## 🛠️ CLI Usage & Examples

### 1. Basic Inspection
```bash
jwtx "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Verify HMAC Signature
```bash
jwtx "eyJhbGciOi..." --secret "my-super-secret-key"
```

### 3. Verify RSA / ECDSA Public Key Signature
```bash
jwtx "eyJhbGciOi..." --key ./public-key.pem
```

### 4. Extract Specific Claim for Shell Scripts
```bash
# Get user ID
USER_ID=$(jwtx $TOKEN --claim sub)

# Get email or roles
jwtx $TOKEN --claim email
```

### 5. Piped Input from Clipboard or Auth Header
```bash
# macOS clipboard
pbpaste | jwtx

# Curl response / jq stream
echo $AUTH_HEADER | jwtx
```

### 6. Live Countdown Timer Mode
```bash
jwtx $TOKEN --watch
```

---

## 📖 Programmatic API (TypeScript & JavaScript)

```typescript
import { decodeJWT, verifyJWT, inspectJWT } from "jwt-term";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// 1. Full Terminal Formatted Inspection Output
console.log(inspectJWT(token, { secret: "your-256-bit-secret" }));

// 2. Decode Token Object
const decoded = decodeJWT(token);
console.log(decoded.payload.sub); // "1234567890"
console.log(decoded.isExpired);   // boolean
console.log(decoded.expiresInSeconds);

// 3. Cryptographic Verification
const result = verifyJWT(token, "your-256-bit-secret");
console.log(result.valid); // true
console.log(result.algorithm); // "HS256"
```

---

## ⚙️ CLI Options Reference

| Option | Shorthand | Description |
| :--- | :--- | :--- |
| `--secret <key>` | `-s` | Secret key for HMAC signature verification (`HS256`, `HS384`, `HS512`) |
| `--key <path>` | `-k` | Public key PEM file path for RSA / ECDSA verification |
| `--claim <name>` | `-c` | Extract only a specific claim value (e.g. `sub`, `email`) |
| `--json` | `-j` | Output decoded token as clean JSON |
| `--watch` | `-w` | Run live ticker countdown until token expires |
| `--version` | `-v` | Output version |
| `--help` | `-h` | Display help menu |

---

## 🧪 Development & Testing

```bash
git clone https://github.com/authoritydmc/jwt-term.git
cd jwt-term
npm install
npm test
npm run build
```

---

## 🚀 Automated Release & Versioning

### 1-Click from GitHub Actions
Go to **Actions** -> **Automated Version & Release** -> Select `patch`, `minor`, or `major` -> Click **Run workflow**.

### From Terminal
```bash
npm run release:patch
npm run release:minor
npm run release:major
```

---

## 📄 License

[MIT](LICENSE) © 2026 authoritydmc
