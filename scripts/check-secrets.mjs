#!/usr/bin/env node
/**
 * Fails if tracked/source files look like they contain live secrets.
 * Run: npm run check:secrets
 */
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const patterns = [
  { name: "AWS access key", re: /AKIA[0-9A-Z]{16}/ },
  { name: "OpenAI-style key", re: /\bsk-[a-zA-Z0-9]{32,}\b/ },
  { name: "Google API key", re: /\bAIza[0-9A-Za-z\-_]{35}\b/ },
  { name: "Private key block", re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  {
    name: "Live DB URL with password",
    re: /(mysql|postgres|postgresql|mongodb(\+srv)?):\/\/[^:\s\/]+:(?!YOUR_PASSWORD|placeholder)[^@\s\/]{8,}@/i,
  },
  {
    name: "Hardcoded AUTH_SECRET value",
    re: /AUTH_SECRET\s*=\s*["'](?!generate-with-openssl|ci-build-placeholder)[^"']{20,}["']/,
  },
];

const allowlist = new Set([
  ".env.example",
  ".env.vps.example",
  ".github/workflows/deploy.yml",
]);

const files = execSync(
  "git ls-files '*.ts' '*.tsx' '*.js' '*.mjs' '*.json' '*.yml' '*.yaml' '*.md' '*.env*' '*.sh'",
  { encoding: "utf8" },
)
  .split("\n")
  .filter(Boolean)
  .filter((f) => !f.startsWith("package-lock.json"))
  .filter((f) => !f.includes("imported-pages.json"))
  .filter((f) => !f.includes("imported-products.json"));

let failed = false;

for (const file of files) {
  if (allowlist.has(file)) continue;

  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  for (const { name, re } of patterns) {
    if (re.test(content)) {
      console.error(`SECRET CHECK FAIL: ${name} in ${file}`);
      failed = true;
    }
  }
}

if (failed) {
  console.error(
    "\nRemove secrets from tracked files. Keep them in gitignored .env or GitHub Actions secrets.",
  );
  process.exit(1);
}

console.log("OK: no obvious live secrets in tracked files");
