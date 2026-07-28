#!/usr/bin/env node
/**
 * audit-direct-fetch-ui.mjs — Strict-zero: no raw fetch() in client components.
 *
 * Architecture rule: client-side UI components are presentation-only. All data
 * mutations must go through:
 *   a) appkit server actions  (imported from "@mohasinac/appkit" or "@/actions/")
 *   b) typed API client wrappers in src/lib/api/
 *   c) useApiMutation / useApiQuery hooks
 *
 * Raw `fetch(` in "use client" files signals a violation — it bypasses auth
 * handling, error normalisation, and the audit trail.
 *
 * Scope: only files that declare `"use client"` (RSC server components may
 * use fetch() for SSR data loading — that is Next.js-recommended practice).
 *
 * Allowed:
 *   - Files under src/app/api/     (they ARE the API layer)
 *   - Files under src/components/dev/   (dev tools, seed panel)
 *   - src/lib/api/*.ts            (the typed wrappers themselves)
 *   - Files without "use client" (server components — RSC fetch is fine)
 *   - *.test.ts / *.spec.ts       (test files may mock fetch)
 *   - Lines with `// audit-direct-fetch-ok: <reason>`
 *
 * Mode: strict-zero.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SEARCH_DIRS = [join(ROOT, "src")];

const IGNORE_PATH_FRAGMENTS = [
  "/app/api/",        // API routes — allowed
  "/components/dev/", // dev tools — allowed
  "/lib/api/",        // typed wrappers — allowed
  "/__tests__/",      // test files
  ".test.ts",
  ".test.tsx",
  ".spec.ts",
  ".spec.tsx",
];

function walkTs(dir) {
  const out = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (["node_modules", "dist", ".next", "__tests__"].includes(entry)) continue;
    const s = statSync(full, { throwIfNoEntry: false });
    if (!s) continue;
    if (s.isDirectory()) out.push(...walkTs(full));
    else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) out.push(full);
  }
  return out;
}

// Matches bare fetch( calls — not "prefetch(", not "useFetch(", not comments
const FETCH_RE = /(?<![a-zA-Z])fetch\s*\(/g;

const violations = [];

for (const searchDir of SEARCH_DIRS) {
  for (const file of walkTs(searchDir)) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    if (IGNORE_PATH_FRAGMENTS.some(f => rel.includes(f))) continue;

    const src = readFileSync(file, "utf8");

    // Only audit "use client" files — server components may use fetch() for RSC data loading
    const firstMeaningfulLine = src.trimStart().slice(0, 100);
    if (!firstMeaningfulLine.includes('"use client"') && !firstMeaningfulLine.includes("'use client'")) continue;

    const lines = src.split("\n");
    FETCH_RE.lastIndex = 0;

    let m;
    while ((m = FETCH_RE.exec(src)) !== null) {
      const lineNum = src.slice(0, m.index).split("\n").length;
      const line = lines[lineNum - 1] ?? "";

      // Skip if line is a comment
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;

      // Skip if suppressed
      if (line.includes("audit-direct-fetch-ok")) continue;
      // Check preceding line too
      if (lineNum > 1 && (lines[lineNum - 2] ?? "").includes("audit-direct-fetch-ok")) continue;

      violations.push({
        file: rel,
        line: lineNum,
        text: line.trim().slice(0, 120),
      });
    }
  }
}

if (violations.length === 0) {
  console.log("audit-direct-fetch-ui: clean ✓");
  process.exit(0);
}

console.error(`\naudit-direct-fetch-ui: ${violations.length} violation(s) — raw fetch() in UI components`);
console.error("Replace with a server action, typed wrapper from src/lib/api/, or useApiMutation.");
console.error("Suppress with `// audit-direct-fetch-ok: <reason>` only for genuine non-action fetches.\n");

for (const v of violations.slice(0, 30)) {
  console.error(`  ${v.file}:${v.line} — ${v.text}`);
}
if (violations.length > 30) console.error(`  ... and ${violations.length - 30} more`);

process.exit(1);
