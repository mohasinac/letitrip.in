#!/usr/bin/env node
/**
 * audit-tester-checklist-hrefs.mjs — strict-zero.
 *
 * Every `href` in the tester checklist seed data
 * (appkit/src/features/tester/seed-data/tester-checklist-seed-data.ts) is a
 * bare `z.string()` with nothing tying it to a real page — see
 * TesterChecklistItemDocument.href in appkit/src/features/tester/schemas/
 * firestore.ts. Route renames/relocations/deletions silently rot these deep
 * links (e.g. /login -> /auth/login, /register -> /auth/register, WISHLIST
 * moving out from under /user, /store/inventory/print being deleted) and the
 * tester's "Go test this ->" button 404s with no build-time signal. Found +
 * fixed 2026-08-19 (CLAUDE.md Recurrent Root Cause Patterns #31).
 *
 * This audit extracts every seeded `href` and confirms it resolves to a real
 * static page under src/app/[locale]/**. All seeded hrefs are static paths
 * today (no dynamic [param] segments) — a route through a dynamic segment
 * folder is intentionally skipped rather than validated, since no current
 * checklist item targets one and doing so needs a different strategy anyway.
 *
 * Strict-zero, no suppression marker — a checklist item either has a working
 * href or omits the field entirely (it's optional).
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SEED_FILE = join(
  ROOT,
  "appkit",
  "src",
  "features",
  "tester",
  "seed-data",
  "tester-checklist-seed-data.ts",
);
const APP_DIR = join(ROOT, "src", "app", "[locale]");

let exists = false;
try {
  exists = statSync(SEED_FILE).isFile();
} catch {
  exists = false;
}
if (!exists) {
  console.log("audit-tester-checklist-hrefs: seed file not found, skipping");
  process.exit(0);
}

// --- Build the set of valid static routes from src/app/[locale]/** ---

const DYNAMIC_SEGMENT_RE = /^\[.+\]$/;
const ROUTE_GROUP_RE = /^\(.+\)$/;

function collectRoutes(dir, segments, routes) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  const hasPage = entries.some(
    (e) => e.isFile() && (e.name === "page.tsx" || e.name === "page.ts"),
  );
  if (hasPage) {
    const route = "/" + segments.join("/");
    routes.add(route.replace(/\/+$/, "") || "/");
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "node_modules") continue;
    if (DYNAMIC_SEGMENT_RE.test(entry.name)) continue; // skip dynamic segments — not validated today
    const nextSegments = ROUTE_GROUP_RE.test(entry.name)
      ? segments
      : [...segments, entry.name];
    collectRoutes(join(dir, entry.name), nextSegments, routes);
  }
}

const validRoutes = new Set();
collectRoutes(APP_DIR, [], validRoutes);
validRoutes.add("/");

// --- Extract every seeded href with its line number ---

const text = readFileSync(SEED_FILE, "utf8");
const lines = text.split("\n");
const HREF_RE = /href:\s*"([^"]*)"/g;

const seeded = [];
for (const match of text.matchAll(HREF_RE)) {
  const href = match[1];
  const before = text.slice(0, match.index ?? 0);
  const lineIdx = before.split("\n").length - 1;
  seeded.push({ href, line: lineIdx + 1 });
}

// --- Validate ---

function nearestSuggestion(href) {
  let best = null;
  let bestScore = -1;
  for (const route of validRoutes) {
    let score = 0;
    const len = Math.min(route.length, href.length);
    for (let i = 0; i < len; i++) {
      if (route[i] === href[i]) score++;
      else break;
    }
    if (score > bestScore) {
      bestScore = score;
      best = route;
    }
  }
  return best;
}

const violations = [];
for (const { href, line } of seeded) {
  if (DYNAMIC_SEGMENT_RE.test(href)) continue;
  if (validRoutes.has(href)) continue;
  violations.push({ href, line, suggestion: nearestSuggestion(href) });
}

if (violations.length === 0) {
  console.log(`audit-tester-checklist-hrefs: clean ✓ (${seeded.length} hrefs checked)`);
  process.exit(0);
}

console.error(
  `audit-tester-checklist-hrefs: REGRESSION — ${violations.length} seeded href(s) don't resolve to a real page under src/app/[locale]/**.\n`,
);
for (const v of violations) {
  const rel = relative(ROOT, SEED_FILE).replace(/\\/g, "/");
  const suggestion = v.suggestion ? ` (did you mean "${v.suggestion}"?)` : "";
  console.error(`  ${rel}:${v.line}  href="${v.href}"${suggestion}`);
}
console.error(
  "\n  Fix: point href at a real, existing page path, or remove the field entirely (it's optional).",
);
process.exit(1);
