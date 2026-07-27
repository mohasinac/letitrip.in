/**
 * Fix BOM + CRLF corruption in Vercel environment variables.
 *
 * Mode 1 (default): Pull current Vercel env, strip BOM+CRLF from corrupted values,
 *   re-push clean values.
 *
 * Mode 2 (--restore-from-local): Read .env.local and push each var listed in
 *   RESTORE_VARS to Vercel development (used when vars were already deleted).
 *
 * Usage:
 *   node scripts/_fix-vercel-env-bom.mjs [--env development|preview]
 *   node scripts/_fix-vercel-env-bom.mjs --restore-from-local [--env development|preview]
 */

import { execSync, spawnSync } from "child_process";
import { readFileSync, unlinkSync } from "fs";
import { randomBytes } from "crypto";
import { join } from "path";
import { tmpdir } from "os";

const args = process.argv.slice(2);
const restoreMode = args.includes("--restore-from-local");
const envIdx = args.indexOf("--env");
const env = envIdx !== -1 ? args[envIdx + 1] : "development";
const allowed = ["development", "preview"];
if (!allowed.includes(env)) {
  console.error(`Unknown env "${env}". Must be one of: ${allowed.join(", ")}`);
  process.exit(1);
}

/** Vars that were deleted during the failed fix run and need to be restored. */
const RESTORE_VARS = [
  "ALGOLIA_ADMIN_API_KEY",
  "ALGOLIA_APP_ID",
  "ALGOLIA_INDEX_NAME",
  "EMAIL_FROM",
  "EMAIL_FROM_NAME",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
  "FIREBASE_ADMIN_PROJECT_ID",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXT_PUBLIC_ALGOLIA_APP_ID",
  "NEXT_PUBLIC_ALGOLIA_INDEX_NAME",
  "NEXT_PUBLIC_ALGOLIA_PAGES_INDEX_NAME",
  "NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY",
  "NEXT_PUBLIC_APP_ENV",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "NEXT_PUBLIC_SITE_NAME",
  "NPM_TOKEN_AUTO",
  "PII_ENCRYPTION_KEY",
  "PII_SECRET",
  "RAZORPAY_API_BASE_URL",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "USE_LOCAL_PACKAGES",
];

// ── Helper: add a single var to Vercel via stdin ──────────────────────────────
function vercelAdd(name, value, targetEnv) {
  let cmd, input;

  if (targetEnv === "preview") {
    // In non-TTY context, Vercel CLI won't accept the branch via stdin —
    // it requires either the branch as 3rd arg or the --value flag.
    // Use --value without a branch arg = all preview branches.
    // Escape only double-quotes in the value (all other chars are safe in cmd.exe).
    const escaped = value.replace(/"/g, '\\"');
    cmd = `vercel env add "${name}" preview --value "${escaped}" --yes`;
    input = undefined;
  } else {
    cmd = `vercel env add "${name}" ${targetEnv}`;
    input = value;
  }

  const result = spawnSync(cmd, {
    ...(input !== undefined && { input }),
    encoding: "utf8",
    shell: true,
    stdio: input !== undefined ? ["pipe", "inherit", "inherit"] : "inherit",
  });

  return result.status === 0;
}

// ── Helper: remove a var from Vercel ────────────────────────────────────────
function vercelRm(name, targetEnv) {
  try {
    execSync(`vercel env rm "${name}" ${targetEnv} --yes`, { stdio: "pipe" });
  } catch {
    // Not present — ignore.
  }
}

// ── Parse .env.local ─────────────────────────────────────────────────────────
function parseEnvFile(path) {
  const text = readFileSync(path, "utf8");
  /** @type {Map<string, string>} */
  const map = new Map();
  // KEY="value" — handles multi-line (private keys use literal \n sequences, single-line)
  const re = /^([A-Z_][A-Z0-9_]*)="([\s\S]*?)"(?:\r?\n|$)/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    map.set(m[1], m[2]);
  }
  // Also handle unquoted values: KEY=value
  const re2 = /^([A-Z_][A-Z0-9_]*)=([^"\n][^\n]*)(?:\r?\n|$)/gm;
  re2.lastIndex = 0;
  while ((m = re2.exec(text)) !== null) {
    if (!map.has(m[1])) map.set(m[1], m[2].trim());
  }
  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE 2: Restore from .env.local
// ─────────────────────────────────────────────────────────────────────────────
if (restoreMode) {
  console.log(`Restoring ${RESTORE_VARS.length} vars to ${env} from .env.local…`);
  const local = parseEnvFile(join(process.cwd(), ".env.local"));
  let ok = 0;
  let fail = 0;

  for (const name of RESTORE_VARS) {
    const value = local.get(name);
    if (value === undefined) {
      console.warn(`  ⚠  ${name} not found in .env.local — skipped`);
      fail++;
      continue;
    }
    console.log(`  Adding ${name}…`);
    const success = vercelAdd(name, value, env);
    if (success) ok++;
    else { console.error(`  ✗ Failed to add ${name}`); fail++; }
  }

  console.log(`\n✅  Done. Added ${ok}, failed ${fail}.`);
  process.exit(fail > 0 ? 1 : 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE 1: Pull → strip BOM → re-push
// ─────────────────────────────────────────────────────────────────────────────
const tmpFile = join(tmpdir(), `vercel-env-${randomBytes(4).toString("hex")}.env`);
console.log(`Pulling ${env} environment variables…`);
execSync(`vercel env pull "${tmpFile}" --environment=${env} --yes`, { stdio: "inherit" });

const raw = readFileSync(tmpFile, "latin1");
unlinkSync(tmpFile);

const vars = new Map();
const lineRe = /^([A-Z_][A-Z0-9_]*)="([\s\S]*?)"(?:\r?\n|$)/gm;
let m;
while ((m = lineRe.exec(raw)) !== null) vars.set(m[1], m[2]);

const BOM = "\xef\xbb\xbf";
let fixed = 0;
let skipped = 0;

for (const [name, rawValue] of vars) {
  const hasBom = rawValue.startsWith(BOM);
  const hasCrlf = rawValue.endsWith("\r\n");
  if (!hasBom && !hasCrlf) { skipped++; continue; }

  let clean = rawValue;
  if (hasBom) clean = clean.slice(BOM.length);
  if (clean.endsWith("\r\n")) clean = clean.slice(0, -2);
  else if (clean.endsWith("\n")) clean = clean.slice(0, -1);

  console.log(`\nFixing: ${name}`);
  vercelRm(name, env);

  const success = vercelAdd(name, clean, env);
  if (success) fixed++;
  else console.error(`  ✗ Failed to re-add ${name}`);
}

console.log(`\n✅  Done. Fixed ${fixed} variables, skipped ${skipped} (already clean).`);
