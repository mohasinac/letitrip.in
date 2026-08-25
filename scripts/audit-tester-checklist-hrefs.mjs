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
 * page under src/app/[locale]/**. Two shapes are accepted:
 *   1. A static path — must exactly match a real page.tsx/page.ts route.
 *   2. A dynamic-route deep link (e.g. /auctions/auction-tester-sandbox-won)
 *      — the prefix up to the dynamic segment (/auctions/) must resolve to a
 *      real page.tsx under a [param] folder, AND the trailing slug must be a
 *      known seed-data id (regex-scanned from appkit/src/seed/**.ts and
 *      appkit/src/features/tester/seed-data/**.ts, same lightweight approach
 *      as the href extraction below — no TS parsing). This lets checklist
 *      items link straight to the specific fixture they're testing instead
 *      of a generic listing page, while still catching typos/route rot.
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

function collectRoutes(dir, segments, routes, dynamicPrefixes, dynamicSubRoutes) {
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
    if (DYNAMIC_SEGMENT_RE.test(entry.name)) {
      // Record the static prefix leading up to this dynamic segment (e.g.
      // "/auctions/") when it resolves to a real detail page, instead of
      // just skipping it — lets seeded hrefs deep-link to a specific
      // fixture id under this route.
      let dynEntries;
      try {
        dynEntries = readdirSync(join(dir, entry.name), { withFileTypes: true });
      } catch {
        continue;
      }
      const dynHasPage = dynEntries.some(
        (e) => e.isFile() && (e.name === "page.tsx" || e.name === "page.ts"),
      );
      if (dynHasPage) {
        dynamicPrefixes.add("/" + [...segments, ""].join("/"));
      }
      // Also record STATIC sub-routes beneath the dynamic segment, e.g.
      // `/stores/{slug}/art` from `stores/[storeSlug]/art/page.tsx`
      // (extended 2026-08-21). Store tabs are real pages and a checklist item
      // should be able to deep-link one; without this the audit forced every
      // such href back to the bare `/stores/{slug}` detail page, which is a
      // worse test instruction. Recorded as `prefix + "/" + subroute` so the
      // fixture-id check below still validates the id in the middle AND the
      // tab name at the end — a typo'd tab still fails.
      for (const sub of dynEntries) {
        if (!sub.isDirectory()) continue;
        if (DYNAMIC_SEGMENT_RE.test(sub.name) || ROUTE_GROUP_RE.test(sub.name)) continue;
        let subEntries;
        try {
          subEntries = readdirSync(join(dir, entry.name, sub.name), {
            withFileTypes: true,
          });
        } catch {
          continue;
        }
        const subHasPage = subEntries.some(
          (e) => e.isFile() && (e.name === "page.tsx" || e.name === "page.ts"),
        );
        if (subHasPage) {
          dynamicSubRoutes.add({
            prefix: "/" + [...segments, ""].join("/"),
            suffix: "/" + sub.name,
          });
        }
      }
      continue;
    }
    const nextSegments = ROUTE_GROUP_RE.test(entry.name)
      ? segments
      : [...segments, entry.name];
    collectRoutes(join(dir, entry.name), nextSegments, routes, dynamicPrefixes, dynamicSubRoutes);
  }
}

const validRoutes = new Set();
const dynamicRoutePrefixes = new Set();
/** { prefix, suffix } pairs for a static page nested under a dynamic segment. */
const dynamicSubRoutes = new Set();
collectRoutes(APP_DIR, [], validRoutes, dynamicRoutePrefixes, dynamicSubRoutes);
validRoutes.add("/");

// --- Build a known-id allowlist from seed data (main + tester fixtures) ---

const SEED_ID_DIRS = [
  join(ROOT, "appkit", "src", "seed"),
  join(ROOT, "appkit", "src", "features", "tester", "seed-data"),
];
const SEED_ID_STRING_RE = /id:\s*"([\w-]+)"/g;
// Some fixtures build their id from a template literal inside a loop (e.g.
// `auction-tester-sandbox-cycle-${i + 1}`) rather than a static string —
// captured separately and turned into a wildcard regex below, since the
// literal interpolated value can't be read from source text alone.
const SEED_ID_TEMPLATE_RE = /id:\s*`([^`]*)`/g;
// A handful of collections (blog posts confirmed 2026-08-21) route on a
// separate `slug` field that's NOT the same as `id` (e.g. id
// "blog-spot-genuine-takara-tomy-beyblade" vs slug
// "spot-genuine-takara-tomy-beyblade", the latter being what the real
// /blog/[slug] route actually reads) — scan slug fields too so a checklist
// href using the real route param isn't flagged as unknown.
const SEED_SLUG_STRING_RE = /slug:\s*"([\w-]+)"/g;

function templateToRegex(template) {
  const parts = template.split(/\$\{[^}]*\}/);
  const escaped = parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp("^" + escaped.join("[\\w-]+") + "$");
}

function collectSeedIds() {
  const ids = new Set();
  const templateRegexes = [];
  for (const dir of SEED_ID_DIRS) {
    // Recursive: ids no longer all live in top-level *-seed-data.ts files.
    // The category tree moved to `_helpers/category-forest.ts` (2026-08-24),
    // and a flat scan silently stopped seeing every category id — which reads
    // as "this href points at a category that doesn't exist" rather than as
    // "the audit can't see it any more".
    const stack = [dir];
    while (stack.length > 0) {
      const current = stack.pop();
      let files;
      try {
        files = readdirSync(current, { withFileTypes: true });
      } catch (_err) {
        continue; // directory does not exist
      }
      for (const f of files) {
        if (f.isDirectory()) {
          stack.push(join(current, f.name));
          continue;
        }
        if (!f.isFile() || !f.name.endsWith(".ts")) continue;
        const fileText = readFileSync(join(current, f.name), "utf8");
        for (const m of fileText.matchAll(SEED_ID_STRING_RE)) ids.add(m[1]);
        for (const m of fileText.matchAll(SEED_SLUG_STRING_RE)) ids.add(m[1]);
        for (const m of fileText.matchAll(SEED_ID_TEMPLATE_RE)) templateRegexes.push(templateToRegex(m[1]));
      }
    }
  }
  return { ids, templateRegexes };
}

const { ids: knownSeedIds, templateRegexes: knownSeedIdTemplates } = collectSeedIds();

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

/** A seeded fixture id, either a literal or one produced by a template loop. */
function isKnownId(value) {
  if (!value) return false;
  if (knownSeedIds.has(value)) return true;
  return knownSeedIdTemplates.some((rx) => rx.test(value));
}

function matchesKnownFixture(href) {
  // Shape 1: /<prefix>/<fixture-id>
  for (const prefix of dynamicRoutePrefixes) {
    if (!href.startsWith(prefix)) continue;
    const trailing = href.slice(prefix.length);
    if (!trailing || trailing.includes("/")) continue;
    if (isKnownId(trailing)) return true;
  }
  // Shape 2: /<prefix>/<fixture-id>/<static-subroute> — e.g. a store tab
  // (/stores/store-beyblade-arena/art). Both halves are validated: the id must
  // be a real fixture AND the sub-route must be a real page, so a typo in
  // either still fails.
  for (const { prefix, suffix } of dynamicSubRoutes) {
    if (!href.startsWith(prefix) || !href.endsWith(suffix)) continue;
    const id = href.slice(prefix.length, href.length - suffix.length);
    if (!id || id.includes("/")) continue;
    if (isKnownId(id)) return true;
  }
  return false;
}

const violations = [];
for (const { href, line } of seeded) {
  if (validRoutes.has(href)) continue;
  if (matchesKnownFixture(href)) continue;
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
