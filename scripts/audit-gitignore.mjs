#!/usr/bin/env node
/**
 * audit-gitignore — blocks unanchored .gitignore patterns that silently
 * exclude nested source files from the repository.
 *
 * Root cause (DEV-6, 2026-05-20): a pattern like `lib/` has a trailing slash
 * only — git treats it as matching any directory named `lib/` at ANY depth.
 * Adding a leading `/` (e.g. `/lib/`) anchors it to the repo root.
 *
 * Rules:
 *
 *   UNANCHORED_DIR     — a directory pattern (trailing `/`) with no leading `/`
 *                        and no other `/` in the body. These match at any depth
 *                        and can silently exclude source files outside the root.
 *                        Intentional all-depth exceptions (e.g. node_modules/,
 *                        security wildcards) are listed in ALLOWED_UNANCHORED.
 *
 *   UNANCHORED_FILE    — a plain filename with no `/` anywhere. These are
 *                        matched against the basename at any depth. Exceptions
 *                        are in ALLOWED_UNANCHORED_FILES (security globs,
 *                        intentional all-depth matches like .DS_Store, *.log).
 *
 * Exits 1 on any violation (zero-tolerance — all known patterns are fixed).
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ─── .gitignore files to audit ────────────────────────────────────────────────
const GITIGNORE_FILES = [
  join(ROOT, ".gitignore"),
  join(ROOT, "appkit", ".gitignore"),
  join(ROOT, "functions", ".gitignore"),
];

// ─── Intentionally all-depth directory patterns ───────────────────────────────
// These match `<name>/` at any depth and are correct as-is.
const ALLOWED_UNANCHORED_DIRS = new Set([
  // Security/secrets — you want these ignored everywhere in the tree
  "secrets/",
  ".secrets/",
  // Turbopack/framework caches that can appear at any workspace level
  // (none currently — all specific to root in this repo)
]);

// ─── Intentionally all-depth filename patterns ────────────────────────────────
// These match by basename at any depth and are correct as-is.
const ALLOWED_UNANCHORED_FILES = new Set([
  // OS cruft
  ".DS_Store",
  // Security globs — intentionally match everywhere
  "*.pem",
  "*.key",
  "*.cert",
  "*.crt",
  "*.p12",
  "*.pfx",
  "credentials.json",
  "google-credentials.json",
  "serviceAccountKey.json",
  "firebase-admin-key.json",
  "*firebase*adminsdk*.json",
  // Log globs — intentionally match everywhere
  "*.log",
  "npm-debug.log*",
  "yarn-debug.log*",
  "yarn-error.log*",
  // Debug logs emitted anywhere in the tree
  "firebase-debug.log",
  "firestore-debug.log",
  "ui-debug.log",
  // Build artefacts that appear in nested packages
  "*.tsbuildinfo",
  // Env files — you never want secrets tracked anywhere in the tree
  ".env",
  ".env.local",
  ".env*.local",
  ".env.production",
  ".env.production.new",
  ".env.development",
  ".env.test",
  ".env.vercel",
  "!.env.example",   // negation — not a risk
  ".env.example",
  ".env.local.example",
  ".env.vercel-check",
  ".env.verify-check",
  // Test output globs
  "test-results.txt",
  "test-output.txt",
  "test-err.txt",
  "test4.txt",
  "test5.txt",
  "test-*-output.txt",
  "test-results*.txt",
  // Heap snapshots (forensics artefacts)
  "*.heapsnapshot",
  // Yarn
  ".pnp.js",
  // Catch-all doc
  "GEMINI.md",
  // GitHub Copilot instructions — intentionally hidden everywhere
  ".github/copilot-instructions.json",
  // JS source maps
  "*.js.map",
]);

// ─── Parse and check ─────────────────────────────────────────────────────────
const violations = [];

for (const gitignorePath of GITIGNORE_FILES) {
  let content;
  try {
    content = readFileSync(gitignorePath, "utf8");
  } catch {
    // File doesn't exist — skip
    continue;
  }

  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    // Skip blanks, comments, negations (! is intentional override)
    if (!line || line.startsWith("#") || line.startsWith("!")) continue;

    // Skip patterns that already have a leading / (anchored) or contain
    // a / in the middle of the body (e.g. config/secrets.json is anchored
    // implicitly because it contains a /).
    if (line.startsWith("/")) continue;

    // Check for an interior slash (e.g. config/secrets.json, .claude/settings.local.json)
    // These are implicitly anchored to the .gitignore's directory.
    const body = line.endsWith("/") ? line.slice(0, -1) : line;
    if (body.includes("/")) continue;

    // ── UNANCHORED_DIR: trailing / with no leading / ──────────────────────────
    if (line.endsWith("/")) {
      if (!ALLOWED_UNANCHORED_DIRS.has(line)) {
        violations.push(
          `${gitignorePath.replace(ROOT + "\\", "").replace(ROOT + "/", "")}:${i + 1} — ` +
          `unanchored directory pattern "${line}" matches at any depth. ` +
          `Use "/${line}" to restrict to repo root.`
        );
      }
      continue;
    }

    // ── UNANCHORED_FILE: plain filename / glob with no / ─────────────────────
    if (!ALLOWED_UNANCHORED_FILES.has(line)) {
      violations.push(
        `${gitignorePath.replace(ROOT + "\\", "").replace(ROOT + "/", "")}:${i + 1} — ` +
        `unanchored file pattern "${line}" matches at any depth by basename. ` +
        `Use "/${line}" to restrict to repo root, or add to ALLOWED_UNANCHORED_FILES if intentional.`
      );
    }
  }
}

// ─── Report ───────────────────────────────────────────────────────────────────
if (violations.length === 0) {
  console.log("audit-gitignore: clean.\n");
  process.exit(0);
}

console.log(`\naudit-gitignore: ${violations.length} unanchored pattern(s) — FAIL\n`);
for (const v of violations) {
  console.log(`  🔴 ${v}`);
}
console.log(
  "\nFix: add a leading / to patterns that should only match the repo root.\n" +
  "     Add intentional all-depth patterns to ALLOWED_UNANCHORED_FILES/DIRS in\n" +
  "     scripts/audit-gitignore.mjs.\n"
);
process.exit(1);
