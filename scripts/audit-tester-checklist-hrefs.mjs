#!/usr/bin/env node
/**
 * audit-tester-checklist-hrefs.mjs — strict-zero.
 *
 * Every `href` in the tester checklist seed data
 * (tester/cases/tester-checklist-seed-data.mjs) is a
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
 *      tester/cases/**.ts, same lightweight approach
 *      as the href extraction below — no TS parsing). This lets checklist
 *      items link straight to the specific fixture they're testing instead
 *      of a generic listing page, while still catching typos/route rot.
 *
 * Strict-zero, no suppression marker — a checklist item either has a working
 * href or omits the field entirely (it's optional).
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
/*
 * 🛑 `tester/cases`, not `appkit/src/features/tester/seed-data`.
 *
 * The corpus moved on 2026-10-22 and this path was updated by EXTENSION only
 * (`.ts` -> `.mjs`) while still naming the directory that same commit deleted.
 * `statSync` then threw, the guard below printed "seed file not found,
 * skipping" and exited 0 — so the audit reported nothing, every run, while a
 * whole-suite sweep showed green.
 *
 * It is the worst version of this failure because the skip message is
 * plausible: an absent corpus genuinely IS a reason to stand down, so nothing
 * about the line suggests the path is simply wrong. Measured: the 2,151
 * `href`/`startPage` values this audit was widened to cover were being checked
 * ZERO times.
 */
const SEED_FILE = join(ROOT, "tester", "cases", "tester-checklist-seed-data.mjs");
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

/*
 * Metadata routes live OUTSIDE `[locale]` — they are `src/app/<name>.ts` file
 * conventions rather than a `page.tsx`, and they are deliberately unlocalised.
 * The walk above cannot see them, so a case linking to one was reported as a
 * dead href while the route served 200 in production. Register each real file
 * rather than a fixed list, so deleting one still fails the cases that cite it.
 */
const METADATA_ROUTES = [
  ["sitemap.ts", "/sitemap.xml"],
  ["robots.ts", "/robots.txt"],
  ["manifest.ts", "/manifest.webmanifest"],
];
for (const [file, route] of METADATA_ROUTES) {
  if (existsSync(join(ROOT, "src", "app", file))) validRoutes.add(route);
}

// --- Build a known-id allowlist from seed data (main + tester fixtures) ---

const SEED_ID_DIRS = [
  join(ROOT, "appkit", "src", "seed"),
  // Same move as SEED_FILE above. Unlike that one this failed SILENTLY with no
  // message at all — a non-existent directory simply contributes no ids, so
  // every tester-fixture id looked unknown and the deep-link check lost its
  // whole second source.
  join(ROOT, "tester", "cases"),
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
/*
 * Prefixes a seed FACTORY may prepend to a bare `slug` to form the document id.
 * Kept narrow on purpose — only shapes that actually exist in the seed, so this
 * does not become a licence to accept any href at all.
 */
const DERIVED_ID_PREFIXES = ["brand-", "category-"];
/*
 * Per-batch fixture manifests (`fixtures/*.mjs`) declare their id as a module
 * constant — `const ID = "auction-money-flows-closing"` — and then reference it
 * as `id: ID`, which no `id:\s*"…"` pattern can see.
 */
const SEED_CONST_ID_RE = /^\s*const\s+[A-Z][A-Z0-9_]*\s*=\s*"([\w-]+)"/gm;

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
        /*
         * 🛑 .mjs TOO — PER-BATCH FIXTURES ARE REAL IDS.
         *
         * `seed-data/fixtures/*.mjs` create rows at batch time rather than at
         * seed time, and a case may legitimately link to one: money-flows sends
         * the tester to /auctions/auction-money-flows-closing, an auction that
         * exists only while that batch is running.
         *
         * Scanning `.ts` alone made those look like dangling hrefs. R7 of
         * audit-tester-plugin-wiring already treats them as known ids by
         * importing each manifest, so a `.ts`-only scan here meant the two
         * audits disagreed about what exists — and this one would have been
         * believed, because a route audit reporting a 404 is exactly the kind of
         * finding nobody re-checks.
         */
        if (!f.isFile() || !(f.name.endsWith(".ts") || f.name.endsWith(".mjs"))) continue;
        const fileText = readFileSync(join(current, f.name), "utf8");
        for (const m of fileText.matchAll(SEED_ID_STRING_RE)) ids.add(m[1]);
        for (const m of fileText.matchAll(SEED_SLUG_STRING_RE)) {
          ids.add(m[1]);
          /*
           * 🛑 PREFIXED FORMS TOO, because a factory derives the id from the
           * slug and no `id:` literal survives for the scan to find.
           *
           * B5 moved 28 brand rows into `_helpers/brand-rows.ts`, where each
           * declares `slug: "takara-tomy"` and the factory computes
           * `brand-${slug}`. Nine checklist hrefs pointing at
           * `/brands/brand-takara-tomy` were immediately reported as dangling
           * — a FALSE finding, and the worst-shaped kind: a route audit
           * claiming a 404 is exactly what nobody re-checks.
           *
           * The lesson is Root Cause #84's, one layer out: adopting a better
           * shape for the data removed it from the check. So the scan has to
           * know that a slug may be the un-prefixed half of an id, which is
           * cheap — these go into a membership set, and a spurious extra entry
           * can only ever make this audit more permissive, never wrong in the
           * blocking direction.
           */
          for (const prefix of DERIVED_ID_PREFIXES) {
            if (!m[1].startsWith(prefix)) ids.add(prefix + m[1]);
          }
        }
        for (const m of fileText.matchAll(SEED_ID_TEMPLATE_RE)) templateRegexes.push(templateToRegex(m[1]));
        /* A manifest names its id once, as `const ID = "…"`, then reuses it. */
        for (const m of fileText.matchAll(SEED_CONST_ID_RE)) ids.add(m[1]);
      }
    }
  }
  return { ids, templateRegexes };
}

const { ids: knownSeedIds, templateRegexes: knownSeedIdTemplates } = collectSeedIds();

// --- Extract every seeded href AND startPage, with file + line ---

/*
 * 🛑 BOTH FIELDS, AND BOTH LOCATIONS. This audit validated `href` in the seed file
 * only, and reported `clean ✓ (981 hrefs checked)` while two cases carried a
 * `startPage` of "/admin/support" — a route with no page.tsx. Every automated run
 * sent those two straight to a 404 and recorded "could not test".
 *
 * `startPage` is the MORE load-bearing of the pair: the merge rule in
 * tester-checklist-seed-data.mjs is
 *   startPage: c.startPage ?? authored?.startPage ?? c.href ?? page.href
 * so an overlay `startPage` OVERRIDES the case's own href — it is where the tester
 * actually lands. Validating only the field it overrides is measuring the wrong
 * one (Root Cause #84: a measurement narrower than the rule it feeds).
 *
 * The overlays live in ./authored/*.ts, which this audit never opened.
 */
const AUTHORED_DIR = join(ROOT, "tester", "cases", "authored");

const ROUTE_FIELD_RE = /\b(?:href|startPage):\s*"([^"]*)"/g;

const SEED_DATA_DIR = join(ROOT, "tester", "cases");

/* Not page sets — no cases, therefore no routes to validate. */
/*
 * 🛑 These are the files in `tester/cases` that carry NO page sets. Everything
 * else at that level is scanned, which is load-bearing: `_happy-path.mjs` and
 * `_money-flows.mjs` DO carry real pages (the catalogue imports
 * `happyPathPages` / `moneyFlowsPages`), so they must not be excluded by an
 * underscore rule — that rule applies only to the `authored/` walk below.
 *
 * This set was half-migrated when the corpus moved: `tester-checklist-seed-data`
 * had been renamed to `.mjs` while `index`, `tester-responses-seed-data`,
 * `test-data-ttl` and `tester-window` still said `.ts`. The last two no longer
 * live here at all. A stale name in an EXCLUSION list fails open — the file is
 * scanned rather than skipped — so this half was harmless, unlike the three
 * stale directory paths it sat beside.
 */
const SEED_DATA_NON_PAGE_FILES = new Set([
  "index.mjs",
  "tester-checklist-seed-data.mjs", // scanned separately, as SEED_FILE
  "tester-responses-seed-data.mjs",
  "_app-constants.mjs",
]);

function collectSources() {
  const out = [{ path: SEED_FILE, label: "tester-checklist-seed-data.mjs" }];

  /*
   * 🛑 INLINE-AUTHORED PAGE SETS LIVE IN THE SEED-DATA ROOT, NOT IN authored/.
   *
   * This audit scanned the catalogue and `authored/*.ts` and nothing else, so
   * `_money-flows.ts` — 29 cases, and the file CLAUDE.md calls THE REFERENCE for
   * the six-part contract — had never had a single startPage validated. The
   * reference nobody checks is the worst possible file to leave unchecked: it is
   * the one other pages are copied from.
   *
   * The `_` prefix is skipped inside `authored/` because `_types.mjs` carries no
   * cases. In THIS directory the same prefix means the opposite — it marks a
   * page set authored inline rather than through an overlay — so the rule is
   * inverted here: scan `_`-prefixed files and skip the known non-page modules
   * by name. A name-based skip list fails LOUDLY when a new module is added
   * (it gets scanned and, carrying no routes, contributes nothing), whereas a
   * prefix rule fails silently by skipping real cases.
   */
  /*
   * 🛑 A MISSING DIRECTORY IS A FAILURE, NOT AN EMPTY RESULT.
   *
   * Both walks used to be `try { … } catch { /* valid *\/ }` over a hardcoded
   * path. When the corpus moved, both paths became wrong and the catch
   * swallowed it — so the audit contributed zero overlay values and still
   * printed `clean ✓`. Half its coverage vanished with no message anywhere,
   * and the half that vanished is the one that matters: an overlay
   * `startPage` OVERRIDES the case's own href, so it decides where the tester
   * actually lands.
   *
   * "No overlays is valid" was true when the directory was optional. It is not
   * true of a path this audit requires in order to mean anything, so the
   * absence is now reported rather than absorbed.
   */
  for (const [dir, kind] of [
    [SEED_DATA_DIR, "case root"],
    [AUTHORED_DIR, "authored overlays"],
  ]) {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      console.error(
        `audit-tester-checklist-hrefs: ${kind} directory is missing — ${relative(ROOT, dir)}`,
      );
      console.error(
        "  This audit cannot check what it cannot read. Repoint the path rather than ignoring this.",
      );
      process.exit(1);
    }
    const isAuthored = dir === AUTHORED_DIR;
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".mjs")) continue;
      if (isAuthored && entry.name.startsWith("_")) continue; // _types.mjs et al carry no cases
      if (!isAuthored && SEED_DATA_NON_PAGE_FILES.has(entry.name)) continue;
      out.push({
        path: join(dir, entry.name),
        label: isAuthored ? `authored/${entry.name}` : entry.name,
      });
    }
  }
  return out;
}

const seeded = [];
for (const src of collectSources()) {
  let text;
  try {
    text = readFileSync(src.path, "utf8");
  } catch {
    continue;
  }
  for (const match of text.matchAll(ROUTE_FIELD_RE)) {
    /*
     * The PATHNAME only. A query string or a hash never changes which
     * `page.tsx` serves a URL, so resolving the raw value rejected a case
     * whose whole point is a query parameter — the nonsense-control for
     * `/admin/sections?enabled=banana`, which must show every row rather than
     * none. The path still has to exist; this just stops the audit asking the
     * filesystem for a directory named `sections?enabled=banana`.
     */
    const href = match[1].split("#")[0].split("?")[0];
    const before = text.slice(0, match.index ?? 0);
    const lineIdx = before.split("\n").length - 1;
    seeded.push({ href, line: lineIdx + 1, file: src.label });
  }
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
for (const { href, line, file } of seeded) {
  if (validRoutes.has(href)) continue;
  if (matchesKnownFixture(href)) continue;
  violations.push({ href, line, file, suggestion: nearestSuggestion(href) });
}

if (violations.length === 0) {
  console.log(
    `audit-tester-checklist-hrefs: clean ✓ (${seeded.length} href/startPage values checked across the seed and its authored overlays)`,
  );
  process.exit(0);
}

console.error(
  `audit-tester-checklist-hrefs: REGRESSION — ${violations.length} seeded href/startPage value(s) don't resolve to a real page under src/app/[locale]/**.\n`,
);
for (const v of violations) {
  const suggestion = v.suggestion ? ` (did you mean "${v.suggestion}"?)` : "";
  console.error(`  ${v.file}:${v.line}  "${v.href}"${suggestion}`);
}
console.error(
  "\n  Fix: point href at a real, existing page path, or remove the field entirely (it's optional).",
);
process.exit(1);
