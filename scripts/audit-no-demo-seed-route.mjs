#!/usr/bin/env node
/**
 * audit-no-demo-seed-route.mjs — strict-zero.
 *
 * Phase 4 (2026-08-17) deleted the seed-panel web UI and its backing
 * /api/demo/seed route entirely — seeding now only happens via the CLI path
 * (appkit/scripts/seed-cli.mjs), which never ships to production. This
 * audit blocks any route path, component, or nav link referencing
 * `demo/seed` or `SeedPanel` from being reintroduced into the consumer app
 * or appkit's public component surface, so the deletion can't silently
 * regress. (This script itself was supposed to ship with Phase 4 but was
 * missed — added retroactively during the Phase 18 nothing-stale pass.)
 *
 * Scope: `src/app/**` (route/page files only — a literal folder named
 * `demo/seed` there means a live route) and `appkit/src/features/**`
 * component files (a real `SeedPanel` component export). Doc-comment
 * `@tag consumers:...` metadata in appkit/src/seed/*.ts and this audit's
 * own file are not scanned — they're not routes or components.
 *
 * Suppression: `// audit-no-demo-seed-route-ok: <reason>` on the same line
 * — reserved for a genuinely unrelated match (e.g. a string that merely
 * contains "demo" and "seed" separately, not the deleted route/component).
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [join(ROOT, "src", "app"), join(ROOT, "appkit", "src", "features")];
const SKIP_DIRS = new Set(["node_modules", "dist", ".next", "__tests__", "__mocks__"]);

const PATTERN = /demo\/seed|SeedPanel/;

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full, { throwIfNoEntry: false });
    if (!st) continue;
    if (st.isDirectory()) walk(full, out);
    else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const src = readFileSync(file, "utf8");
    const lines = src.split("\n");
    lines.forEach((line, i) => {
      if (line.includes("audit-no-demo-seed-route-ok")) return;
      if (PATTERN.test(line)) {
        violations.push(`${relative(ROOT, file)}:${i + 1}  ${line.trim().slice(0, 100)}`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error("audit-no-demo-seed-route: FAILED — reference to the deleted seed panel / demo-seed route found:\n");
  for (const v of violations) console.error(`  ✗ ${v}`);
  console.error(
    `\n${violations.length} violation(s). The seed panel (SeedPanel component + /api/demo/seed route) was ` +
      `deleted in Phase 4 — seeding only happens via the CLI (appkit/scripts/seed-cli.mjs). Suppress a ` +
      `genuinely unrelated match with // audit-no-demo-seed-route-ok: <reason>.`,
  );
  process.exit(1);
}

console.log("audit-no-demo-seed-route: clean ✓");
