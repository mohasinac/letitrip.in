#!/usr/bin/env node
/**
 * audit-dead-route-key — strict-zero, with a shrinking grandfather list.
 *
 * ## NO_PAGE: a key promising a route that does not exist
 *
 * `audit-nav-page-wiring` only checks hrefs that appear in a NAV GROUP, so a
 * key no nav entry references is invisible to it. `ROUTES.STORE.PRODUCT_CODES`
 * → `/store/products/{id}/codes` has no page at all; only the API route of the
 * same name exists. Anything that started linking to it would 404.
 *
 * A second shape falls out of the same scan, reported informationally: a key
 * resolving to the SAME path as another key is a dead alias.
 * `ROUTES.USER.ADDRESSES_ADD` and `ADDRESSES_NEW` both mean
 * `/user/addresses/new`.
 *
 * ## 🛑 A NO_CALLER rule was written, measured, and CUT
 *
 * The first version of this audit also failed a key with zero references
 * outside the route map, on the theory that a page nothing links to is
 * reachable only by typing the URL. It produced **23 hits, and its message was
 * wrong for 22 of them.**
 *
 * `ADMIN.ADS_NEW` has no callers — and `/admin/ads/new` is perfectly
 * reachable, because `AdminAdsView` hardcodes `createHref = "/admin/ads/new"`
 * instead of importing the key. So the finding was real but the conclusion was
 * false: this is the hardcoded-path problem, not the unreachable-page problem,
 * and route-string linting is where it belongs.
 *
 * An audit that is right about the symptom and wrong about the cause gets
 * suppressed wholesale on day one, which is worse than not shipping it. Kept
 * narrow and true rather than broad and noisy.
 *
 * ## Scope: static string values only
 *
 * Function-valued keys (`ORDER_DETAIL: (id) => …`) are skipped — their path is
 * parametric and cannot be resolved without inventing an id.
 *
 * Suppression: `// audit-dead-route-key-ok: <reason>` on the key's own line,
 * for a route that is genuinely reserved (an external redirect target, a path
 * only a Cloud Function emits).
 *
 * Exit 0 — clean.  Exit 1 — a key promising a page that does not exist.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROUTE_MAP = join(ROOT, "appkit", "src", "next", "routing", "route-map.ts");
const APP_DIR = join(ROOT, "src", "app", "[locale]");
const SCAN = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git", "__tests__"]);
const EXTS = [".ts", ".tsx", ".mjs"];

const SUPPRESS = /audit-dead-route-key-ok:/;

/**
 * 🛑 EMPTY, and closed 2026-10-17.
 *
 * The one entry — `PUBLIC.SUBLISTING_CATEGORIES` — was resolved the way this
 * audit's own failure message recommends: the key was DELETED. It promised
 * `/sublisting-categories`, a directory that holds only `[slug]/`, and a
 * repo-wide grep found zero references to the key in either tree. A key nobody
 * reads, pointing at a page nobody built, is not a scheduled page.
 *
 * A stale entry now BLOCKS, so this set cannot rot. Do not add one: build the
 * page, link to it, or delete the key in the same change.
 */
const GRANDFATHERED = new Set([]);

/**
 * Sections whose paths are not pages under `src/app/[locale]` at all.
 * `API` is served from `src/app/api`; `EXTERNAL` points off-site.
 */
const NON_PAGE_SECTIONS = new Set(["API", "EXTERNAL"]);

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (EXTS.some((x) => e.name.endsWith(x))) out.push(full);
  }
  return out;
}

/** Segment-walk that resolves a path onto a `[param]` folder, as Next does. */
function resolveSegments(baseDir, segments) {
  if (segments.length === 0) return existsSync(join(baseDir, "page.tsx"));
  const [head, ...rest] = segments;
  const exact = join(baseDir, head);
  if (existsSync(exact) && resolveSegments(exact, rest)) return true;
  let children;
  try { children = readdirSync(baseDir, { withFileTypes: true }); } catch { return false; }
  for (const child of children) {
    if (!child.isDirectory()) continue;
    const name = child.name;
    if (!name.startsWith("[") || !name.endsWith("]")) continue;
    if (name.startsWith("[...") || name.startsWith("[[...")) {
      return existsSync(join(baseDir, name, "page.tsx"));
    }
    if (resolveSegments(join(baseDir, name), rest)) return true;
  }
  return false;
}

function pageExists(urlPath) {
  return resolveSegments(APP_DIR, urlPath.split("/").filter(Boolean));
}

/** Parse `SECTION: { KEY: "..." | (…) => … }` out of the route map. */
function parseRouteMap(source) {
  const out = [];
  const sectionRe = /(\w+):\s*\{([\s\S]*?)\n  \},/g;
  let sm;
  while ((sm = sectionRe.exec(source)) !== null) {
    const [, section, body] = sectionRe.lastIndex ? sm : sm;
    for (const line of body.split("\n")) {
      if (SUPPRESS.test(line)) continue;
      const lit = line.match(/^\s*(\w+):\s*"([^"]+)"/);
      if (lit) { out.push({ section, key: lit[1], path: lit[2], kind: "literal" }); continue; }
      const fn = line.match(/^\s*(\w+):\s*\(/);
      if (fn) out.push({ section, key: fn[1], path: null, kind: "fn" });
    }
  }
  return out;
}

function main() {
  const source = readFileSync(ROUTE_MAP, "utf8");
  const keys = parseRouteMap(source);

  // Duplicate literal paths → dead aliases.
  const byPath = new Map();
  for (const k of keys) {
    if (k.kind !== "literal") continue;
    (byPath.get(k.path) ?? byPath.set(k.path, []).get(k.path)).push(`${k.section}.${k.key}`);
  }

  const violations = [];
  const stale = new Set(GRANDFATHERED);

  /*
   * `nowAlive` and `stale` are DIFFERENT stale cases and were conflated.
   *
   * The previous shape deleted from `stale` on BOTH branches, so the set ended
   * up meaning "this key no longer exists in ROUTES" while the message said
   * "no longer dead" — and `left` counted a key that had since grown a page as
   * still awaiting cleanup. The fourth audit in this repo with that exact bug.
   */
  const nowAlive = [];
  let stillDead = 0;
  for (const k of keys) {
    const id = `${k.section}.${k.key}`;
    const isGrandfathered = GRANDFATHERED.has(id);
    if (isGrandfathered) stale.delete(id);
    const noPage =
      k.kind === "literal" && !NON_PAGE_SECTIONS.has(k.section) && !pageExists(k.path);

    if (!noPage) {
      if (isGrandfathered) nowAlive.push(id);
      continue;
    }
    if (isGrandfathered) { stillDead++; continue; }
    violations.push(`${id} -> "${k.path}" :: NO_PAGE — the key promises a route with no page.tsx behind it`);
  }

  for (const id of nowAlive)
    violations.push(`${id} :: has a page now — remove it from GRANDFATHERED in this file`);
  for (const id of stale)
    violations.push(`${id} :: is in GRANDFATHERED but is not a ROUTES key — remove the entry`);

  const aliases = [...byPath.entries()].filter(([, ids]) => ids.length > 1);
  if (aliases.length > 0) {
    console.log("[audit-dead-route-key] duplicate paths (informational — one is an alias):");
    for (const [path, ids] of aliases) console.log(`  ⚠️  "${path}" ← ${ids.join(", ")}`);
    console.log("");
  }

  if (violations.length === 0) {
    console.log(`audit-dead-route-key: clean ✓ (${keys.length} key(s); ${stillDead} known-dead awaiting cleanup)`);
    process.exit(0);
  }

  console.error("\n[audit-dead-route-key] STRICT-ZERO violation(s):\n");
  for (const v of violations) console.error(`  - ${v}`);
  console.error(
    "\nA ROUTES key is a promise. Either build the page, link to it, or delete\n" +
      "the key — `audit-nav-page-wiring` cannot see any of this, because it only\n" +
      "checks hrefs that appear in a nav group.\n",
  );
  console.error(`Total: ${violations.length}\n`);
  process.exit(1);
}

main();
