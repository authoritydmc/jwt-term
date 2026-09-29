import { Command } from "commander";
import { inspectJWT, decodeJWT } from "./index.js";
import fs from "fs";

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    if (process.stdin.isTTY) {
      resolve("");
      return;
    }

    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      resolve(data.trim());
    });
    setTimeout(() => {
      if (!data) resolve("");
    }, 100);
  });
}

async function runWatchMode(rawToken: string, options: any) {
  const render = () => {
    console.clear();
    const output = inspectJWT(rawToken, options);
    console.log(output);
    console.log("\n\x1b[2mPress Ctrl+C to exit watch mode...\x1b[0m");
  };

  render();
  const timer = setInterval(render, 1000);
  process.on("SIGINT", () => {
    clearInterval(timer);
    process.exit(0);
  });
}

async function main() {
  const program = new Command();

  program
    .name("jwt-term")
    .description(
      "High-fidelity inline terminal JWT inspector, decoder, signature verifier, and expiry countdown timer."
    )
    .version("1.0.0", "-v, --version", "Output current version")
    .argument("[token]", "JWT token string or file path")
    .option("-s, --secret <secret>", "Secret key for HMAC (HS256, HS384, HS512) verification")
    .option("-k, --key <path-or-pem>", "Public key path or PEM string for RSA/ECDSA verification")
    .option("-c, --claim <claim>", "Extract only a specific claim value (e.g. sub, email, roles)")
    .option("-j, --json", "Output parsed token as JSON")
    .option("-w, --watch", "Live watch & countdown mode")
    .action(async (tokenArg, options) => {
      try {
        let rawToken = "";

        if (tokenArg) {
          if (fs.existsSync(tokenArg)) {
            rawToken = fs.readFileSync(tokenArg, "utf-8").trim();
          } else {
            rawToken = tokenArg.trim();
          }
        } else {
          rawToken = await readStdin();
        }

        if (!rawToken) {
          program.help();
          process.exit(1);
        }

        // Clean quotes or Bearer prefix
        rawToken = rawToken.replace(/^["']|["']$/g, "").replace(/^Bearer\s+/i, "");

        let publicKey = options.key;
        if (publicKey && fs.existsSync(publicKey)) {
          publicKey = fs.readFileSync(publicKey, "utf-8");
        }

        if (options.watch) {
          await runWatchMode(rawToken, {
            secret: options.secret,
            publicKey,
            claim: options.claim,
            json: options.json,
          });
          return;
        }

        const output = inspectJWT(rawToken, {
          secret: options.secret,
          publicKey,
          claim: options.claim,
          json: options.json,
        });

        console.log(output);
      } catch (err: any) {
        console.error(`\x1b[31mError: ${err.message || err}\x1b[0m`);
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
