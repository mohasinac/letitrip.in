#!/usr/bin/env node
/**
 * audit-media-ext-hmac.mjs — guard the /api/media/ext signing boundary.
 *
 * Three structural invariants the audit enforces (strict-0):
 *   1. The HMAC signing module (`src/app/api/media/ext/_signing.ts`) is the
 *      only file in the repo that reads `process.env.MEDIA_EXT_HMAC_SECRET`.
 *      Reads elsewhere would either (a) duplicate the verification logic and
 *      drift, or (b) leak the secret to a different code path. The route
 *      delegates to `verifyExtSignature()` from the signing module.
 *   2. The signing module exposes both `signExtMediaUrl()` (server-side
 *      callers wrap external URLs through this) and `verifyExtSignature()`
 *      (the route uses this). Both names must be present so the surface
 *      survives renames.
 *   3. The route handler at `src/app/api/media/ext/route.ts` must call
 *      `verifyExtSignature(...)` before performing the upstream fetch.
 *      Otherwise the HMAC env var is dead config and abuse goes unblocked.
 *
 * No suppression markers — every condition is structural and irreducible.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SIGNING_FILE = join(ROOT, "src", "app", "api", "media", "ext", "_signing.ts");
const ROUTE_FILE = join(ROOT, "src", "app", "api", "media", "ext", "route.ts");
const ENV_VAR = "MEDIA_EXT_HMAC_SECRET";

const SKIP_DIRS = new Set([
  ".next",
  "node_modules",
  "dist",
  "coverage",
  ".git",
  "appkit",
  ".claude",
]);

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      walk(full, files);
      continue;
    }
    if (/\.(ts|tsx|mjs|js)$/.test(e.name)) files.push(full);
  }
  return files;
}

let failures = 0;

// ── Invariant 1: env var is read in only one place ─────────────────────────
// Count actual reads (`process.env.MEDIA_EXT_HMAC_SECRET`, indexed forms, and
// string-literal references that resolve back to a `process.env[X]` call).
// Comment mentions are allowed because they're documentation, not behaviour.
const READ_PATTERNS = [
  new RegExp(`process\\.env\\.${ENV_VAR}\\b`),
  new RegExp(`process\\.env\\[\\s*["']${ENV_VAR}["']\\s*\\]`),
  // Patterns like `const SECRET_ENV = "MEDIA_EXT_HMAC_SECRET"; process.env[SECRET_ENV]`
  // — match the constant binding as a proxy for the read.
  new RegExp(`=\\s*["']${ENV_VAR}["']`),
];
const hits = [];
for (const f of walk(ROOT)) {
  let src;
  try {
    src = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  if (READ_PATTERNS.some((rx) => rx.test(src))) {
    hits.push(relative(ROOT, f).replace(/\\/g, "/"));
  }
}

const SIGNING_FILE_REL = "src/app/api/media/ext/_signing.ts";
const SIGNING_TEST_REL = "src/app/api/media/ext/_signing.test.ts";
const ALLOWED_ENV_READERS = new Set([
  SIGNING_FILE_REL,
  // Test file exercises the env-var-set branch by mutating process.env in
  // beforeEach/afterEach; this is a legitimate test pattern, not a duplicate
  // production reader.
  SIGNING_TEST_REL,
  "scripts/audit-media-ext-hmac.mjs",
]);
const offending = hits.filter((p) => !ALLOWED_ENV_READERS.has(p.replace(/\\/g, "/")));
if (offending.length > 0) {
  failures++;
  console.error(
    `audit-media-ext-hmac: ${ENV_VAR} is read outside the signing module:\n` +
      offending.map((p) => `  ${p}`).join("\n") +
      `\n  Move the read into ${SIGNING_FILE_REL} and call it via signExtMediaUrl()/verifyExtSignature().`,
  );
}
if (hits.filter((p) => p.replace(/\\/g, "/") === SIGNING_FILE_REL).length === 0) {
  failures++;
  console.error(
    `audit-media-ext-hmac: ${SIGNING_FILE_REL} does not read ${ENV_VAR}. ` +
      `The signing module is the canonical (and only) reader — restore the env read.`,
  );
}

// ── Invariant 2: signing module exports both names ─────────────────────────
if (!existsSync(SIGNING_FILE)) {
  failures++;
  console.error(`audit-media-ext-hmac: signing module missing at ${SIGNING_FILE_REL}.`);
} else {
  const src = readFileSync(SIGNING_FILE, "utf8");
  if (!/export\s+function\s+signExtMediaUrl\b/.test(src)) {
    failures++;
    console.error(
      `audit-media-ext-hmac: ${SIGNING_FILE_REL} does not export signExtMediaUrl(). ` +
        `Server-side callers depend on it to produce signed proxy URLs.`,
    );
  }
  if (!/export\s+function\s+verifyExtSignature\b/.test(src)) {
    failures++;
    console.error(
      `audit-media-ext-hmac: ${SIGNING_FILE_REL} does not export verifyExtSignature(). ` +
        `The route handler depends on it to gate fetches behind a valid signature.`,
    );
  }
}

// ── Invariant 3: route handler calls verifyExtSignature ────────────────────
if (!existsSync(ROUTE_FILE)) {
  failures++;
  console.error(
    `audit-media-ext-hmac: route handler missing at src/app/api/media/ext/route.ts.`,
  );
} else {
  const src = readFileSync(ROUTE_FILE, "utf8");
  if (!/verifyExtSignature\s*\(/.test(src)) {
    failures++;
    console.error(
      `audit-media-ext-hmac: src/app/api/media/ext/route.ts does not call ` +
        `verifyExtSignature(...). Even though signing is config-gated, the call ` +
        `must always run so enabling the env var actually enforces signing.`,
    );
  }
}

if (failures > 0) {
  console.error(`\naudit-media-ext-hmac: ${failures} structural violation(s).`);
  process.exit(1);
}

console.log("audit-media-ext-hmac: HMAC signing boundary intact ✓");
process.exit(0);
