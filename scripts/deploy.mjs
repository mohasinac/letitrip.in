#!/usr/bin/env node
/**
 * scripts/deploy.mjs — pre-flight checked Vercel production deploy
 *
 * Catches the most common "local passes, Vercel fails" mistakes before
 * triggering a build on Vercel's Linux servers.
 *
 * Usage:
 *   node scripts/deploy.mjs          # run checks then deploy
 *   node scripts/deploy.mjs --check  # run checks only, do not deploy
 *
 * What it verifies:
 *   1. package-lock.json resolves @mohasinac/appkit from the npm registry
 *      (not as a file: symlink — Vercel can't access the local appkit dir)
 *   2. tsconfig.json does NOT include appkit/src/** in the `include` array
 *      (causes Vercel Linux OOM / case-sensitivity crashes — Root Cause #23)
 *   3. No uncommitted changes that would be missing from the deployed build
 *   4. npm run check exits 0  (types + audits + lint)
 *
 * If any check fails, the script exits 1 and prints a fix hint before
 * touching Vercel.
 */

import { execSync, spawnSync } from "child_process";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// tsconfig.json is JSONC (TypeScript's own parser accepts // and /* */
// comments) — strip them before JSON.parse so legitimately-commented config
// (e.g. explaining why a compiler option is overridden) doesn't fail this
// pre-flight check. Only strips comments outside of string literals.
function parseJsonc(text) {
  let out = "";
  let inString = false;
  let stringChar = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (inString) {
      out += c;
      if (c === "\\") {
        out += next;
        i++;
      } else if (c === stringChar) {
        inString = false;
      }
      continue;
    }
    if (c === '"' || c === "'") {
      inString = true;
      stringChar = c;
      out += c;
      continue;
    }
    if (c === "/" && next === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i++;
      continue;
    }
    out += c;
  }
  return JSON.parse(out);
}
const CHECK_ONLY = process.argv.includes("--check");

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

let failed = false;

function fail(msg, hint) {
  console.error(red(`✗ ${msg}`));
  if (hint) console.error(yellow(`  Fix: ${hint}`));
  failed = true;
}

function pass(msg) {
  console.log(green(`✓ ${msg}`));
}

function section(title) {
  console.log(`\n${bold(title)}`);
}

// ─── CHECK 1: lockfile resolves from npm registry ────────────────────────────
section("Check 1 — lockfile resolves @mohasinac/appkit from npm registry");

let lockfile;
try {
  lockfile = JSON.parse(readFileSync(resolve(ROOT, "package-lock.json"), "utf-8"));
} catch {
  fail(
    "package-lock.json not found or invalid JSON",
    "Run: npm install",
  );
}

if (lockfile) {
  const appkitEntry = lockfile?.packages?.["node_modules/@mohasinac/appkit"];
  if (!appkitEntry) {
    fail(
      "node_modules/@mohasinac/appkit not found in package-lock.json",
      "Run: npm install",
    );
  } else if (appkitEntry.link === true || !appkitEntry.resolved?.startsWith("https://registry.npmjs.org")) {
    fail(
      `appkit resolved as "${appkitEntry.resolved ?? "file link"}" — Vercel cannot access the local directory`,
      [
        "1. Set package.json: \"@mohasinac/appkit\": \"^X.Y.Z\"",
        "2. Delete package-lock.json",
        "3. Run: npm install",
      ].join("\n       "),
    );
  } else {
    pass(`appkit resolves from npm registry (${appkitEntry.resolved.split("/-/")[0].split("/").pop() ?? "registry"})`);
  }
}

// ─── CHECK 2: tsconfig.json does not include appkit/src/** ───────────────────
section("Check 2 — tsconfig.json does NOT include appkit/src/**");

let tsconfig;
try {
  tsconfig = parseJsonc(readFileSync(resolve(ROOT, "tsconfig.json"), "utf-8"));
} catch {
  fail("tsconfig.json not found or invalid JSON");
}

if (tsconfig) {
  const include = tsconfig.include ?? [];
  const appkitSrcPaths = include.filter((p) => p.startsWith("appkit/src"));
  if (appkitSrcPaths.length > 0) {
    fail(
      `tsconfig.json includes appkit source paths: ${appkitSrcPaths.join(", ")}`,
      [
        "Remove these lines from tsconfig.json 'include' array:",
        ...appkitSrcPaths.map((p) => `  \"${p}\"`),
        "Types come from node_modules/@mohasinac/appkit/dist/*.d.ts when using npm pin.",
        "See Root Cause #23 in CLAUDE.md.",
      ].join("\n       "),
    );
  } else {
    pass("tsconfig.json does not include appkit/src/**");
  }
}

// ─── CHECK 3: no uncommitted changes ─────────────────────────────────────────
section("Check 3 — no uncommitted changes");

try {
  const status = execSync("git status --porcelain", { cwd: ROOT, encoding: "utf-8" }).trim();
  if (status) {
    const lines = status.split("\n");
    console.warn(yellow(`  Warning: ${lines.length} uncommitted file(s):`));
    lines.slice(0, 5).forEach((l) => console.warn(yellow(`    ${l}`)));
    if (lines.length > 5) console.warn(yellow(`    … and ${lines.length - 5} more`));
    console.warn(yellow("  Uncommitted changes will NOT be deployed — only the pushed HEAD is used."));
  } else {
    pass("Working tree clean");
  }
} catch {
  console.warn(yellow("  Could not run git status — skipping"));
}

// ─── CHECK 4: npm run check ───────────────────────────────────────────────────
section("Check 4 — npm run check (types + audits + lint)");

if (failed) {
  console.log(yellow("\nSkipping npm run check — fix the errors above first.\n"));
} else {
  console.log("  Running npm run check (this may take 30–120s) …");
  const result = spawnSync("npm", ["run", "check"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=8192" },
  });
  if (result.status !== 0) {
    fail("npm run check failed — fix all errors before deploying");
  } else {
    pass("npm run check passed");
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log("");

if (failed) {
  console.error(red(bold("Pre-flight checks failed. Fix the issues above before deploying.")));
  process.exit(1);
}

if (CHECK_ONLY) {
  console.log(green(bold("All pre-flight checks passed. (--check mode — not deploying)")));
  process.exit(0);
}

// ─── DEPLOY ──────────────────────────────────────────────────────────────────
section("Deploying to Vercel production …");
console.log("  Running: vercel --prod --archive=tgz\n");

// --archive=tgz: the project now exceeds Vercel's 15,000-file direct-upload
// limit (16,637 files as of this deploy) — Vercel's own error message
// points at this flag, which bundles the upload into a single tarball
// instead of individual file requests.
const deploy = spawnSync("vercel", ["--prod", "--archive=tgz"], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
});

if ((deploy.status ?? 0) !== 0) {
  console.error(red(bold("\nvercel --prod failed — skipping smoke test.")));
  process.exit(deploy.status ?? 1);
}

// ─── POST-DEPLOY SMOKE TEST ──────────────────────────────────────────────────
//
// A green build is NOT proof the site runs. Recurrent Root Cause #69: shipping
// firebase-admin 14 produced a deployment Vercel reported as `readyState:
// READY` while EVERY route 500'd, because a CommonJS transitive require()'d an
// ESM-only package. That failure happens at Lambda module load — after the
// build, outside anything `npm run check` or `next build` can observe. It was
// only caught by requesting a page.
//
// So: request real pages, and fail loudly if production is broken.
section("Post-deploy smoke test");

const SMOKE_ORIGIN = process.env.SMOKE_ORIGIN ?? "https://letitrip.in";
// One SSR page, one dynamic listing page, and one API route that exercises the
// firebase-admin import chain — the exact path #69 broke.
const SMOKE_PATHS = ["/", "/en/products", "/api/site-settings"];
const SMOKE_ATTEMPTS = 3;
const SMOKE_BACKOFF_MS = 5000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probe(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    return { status: res.status, ok: res.status >= 200 && res.status < 400 };
  } catch (err) {
    return { status: 0, ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

let smokeFailed = false;
for (const path of SMOKE_PATHS) {
  const url = `${SMOKE_ORIGIN}${path}`;
  let result;
  // Retry: the alias can take a moment to point at the new deployment, so a
  // single failed probe is not yet evidence the deploy is bad.
  for (let attempt = 1; attempt <= SMOKE_ATTEMPTS; attempt++) {
    result = await probe(url);
    if (result.ok) break;
    if (attempt < SMOKE_ATTEMPTS) await sleep(SMOKE_BACKOFF_MS * attempt);
  }
  if (result.ok) {
    pass(`${path} → ${result.status}`);
  } else {
    smokeFailed = true;
    console.error(red(`✗ ${path} → ${result.status || "no response"}${result.error ? ` (${result.error})` : ""}`));
  }
}

if (smokeFailed) {
  console.error(
    red(
      bold(
        "\nDEPLOY IS LIVE BUT BROKEN — production is serving errors.\n" +
          "  Inspect:  vercel logs <deployment-url>\n" +
          "  Restore:  vercel rollback <previous-deployment-url> --yes\n" +
          "  A build that succeeds can still fail at Lambda module load; see\n" +
          "  Recurrent Root Cause #69 in CLAUDE.md.",
      ),
    ),
  );
  process.exit(1);
}

console.log(green(bold("\nDeployed and verified serving.")));
process.exit(0);
