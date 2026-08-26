#!/usr/bin/env node
/**
 * audit-nav-page-wiring — catches the exact bug class found in the
 * 2026-08-19 admin/store/user nav-wiring audit (CLAUDE.md Root Cause #29):
 * a sidebar nav entry pointing at a route with no page.tsx behind it, or a
 * fully-built top-level page.tsx with no sidebar nav entry pointing at it.
 *
 * Rule NAV_DEAD_LINK (hard-fail, strict zero-tolerance) — every href in
 * ADMIN_NAV_GROUPS / STORE_NAV_GROUPS / USER_NAV_GROUPS in
 * src/constants/navigation.tsx must resolve (after looking up ROUTES.* in
 * appkit/src/next/routing/route-map.ts) to a real
 * src/app/[locale]/<path>/page.tsx on disk. A nav entry with no page behind
 * it is a guaranteed 404 the moment a user clicks it.
 *
 * Rule NAV_ORPHAN_PAGE (report-only, non-blocking) — a page.tsx that exists
 * directly under admin/, store/, or user/ but matches no nav href anywhere.
 * Non-blocking because legitimate sub-routes (new/, [id]/, /view, /edit,
 * guide sub-pages, etc.) are expected to exist without their own top-level
 * nav entry — see EXCLUDED_SEGMENTS below. This only flags genuine
 * top-level list/hub pages, the class of bug this audit exists to catch
 * (e.g. /admin/grouped-listings, /store/grouped-listings, /user's
 * dashboard hub were all found exactly this way).
 *
 * Suppression: none provided on purpose — a dead nav link has no legitimate
 * excuse. If a route is intentionally external or dynamic, don't put it in
 * ADMIN_NAV_GROUPS/STORE_NAV_GROUPS/USER_NAV_GROUPS in the first place.
 *
 * Exits 1 on any NAV_DEAD_LINK violation. NAV_ORPHAN_PAGE never affects the
 * exit code — it's printed as an informational section only.
 *
 * ## Four holes closed 2026-08-26 (W22)
 *
 * The audit reported "clean" and was telling the truth — but only about a
 * fraction of what it appeared to cover. Each hole is marked at its fix site:
 *
 *  1. **Public nav was unscanned.** MAIN_NAV_ITEMS, SIDEBAR_SUPPORT_LINKS and
 *     FOOTER_LINK_GROUPS — 55 hrefs — were never checked for dead links.
 *  2. **`getUserNavGroups()` was unparsed.** The block extractor stops at the
 *     first `
];`, so every runtime-injected user nav item was invisible.
 *  3. **EXCLUDED_SEGMENTS blocked recursion, not just matching**, hiding any
 *     real hub page nested under new/ edit/ view/ …
 *  4. **`pagePathExists` could not resolve a dynamic route**, so a nav entry
 *     pointing at a `[param]` folder would have been a false NAV_DEAD_LINK.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const NAV_FILE = join(ROOT, "src", "constants", "navigation.tsx");
const ROUTE_MAP_FILE = join(ROOT, "appkit", "src", "next", "routing", "route-map.ts");
const APP_DIR = join(ROOT, "src", "app", "[locale]");

const NAV_GROUP_NAMES = ["ADMIN_NAV_GROUPS", "STORE_NAV_GROUPS", "USER_NAV_GROUPS"];

/*
 * Hole 1 (closed 2026-08-26): the three portal sidebars were the ONLY thing
 * checked, so the public-facing nav — 55 hrefs across the header, the sidebar
 * support links and the footer — was never checked for dead links at all.
 * Every one happened to resolve, which is luck rather than enforcement: a
 * dead footer link 404s exactly as loudly as a dead admin one.
 *
 * These are flat arrays, not `{title, items}` groups, so `extractGroupBlock`
 * ends them on the same `
];` and `extractHrefs` reads the same two shapes.
 */
const FLAT_NAV_NAMES = ["MAIN_NAV_ITEMS", "SIDEBAR_SUPPORT_LINKS", "FOOTER_LINK_GROUPS"];

// Segments that mark a page.tsx as a legitimate non-nav sub-route (create
// forms, edit forms, dynamic detail pages, and known action sub-paths).
const EXCLUDED_SEGMENTS = new Set([
  "new", "edit", "view", "entries", "cancel", "track", "invoice", "payment", "add",
]);

// ─── Parse ROUTES.* literal string values out of route-map.ts ─────────────

function parseRouteMap(source) {
  const routeMap = {};
  const sectionRe = /(\w+):\s*\{([\s\S]*?)\n  \},/g;
  let sectionMatch;
  while ((sectionMatch = sectionRe.exec(source)) !== null) {
    const [, sectionName, body] = sectionMatch;
    const keyRe = /(\w+):\s*"([^"]+)"/g;
    let keyMatch;
    const section = routeMap[sectionName] ?? (routeMap[sectionName] = {});
    while ((keyMatch = keyRe.exec(body)) !== null) {
      const [, key, value] = keyMatch;
      section[key] = value;
    }
  }
  return routeMap;
}

function resolveRoute(routeMap, section, key) {
  return routeMap[section]?.[key];
}

// ─── Extract nav hrefs from one NAV_GROUPS block ───────────────────────────

function extractGroupBlock(source, groupName) {
  const startMarker = `export const ${groupName}`;
  const start = source.indexOf(startMarker);
  if (start === -1) return null;
  const end = source.indexOf("\n];", start);
  if (end === -1) return null;
  return source.slice(start, end);
}

/*
 * Hole 2 (closed 2026-08-26): `extractGroupBlock` slices from
 * `export const USER_NAV_GROUPS` to the first `
];`, so everything
 * `getUserNavGroups()` injects at runtime — Store Dashboard, View Public
 * Profile, Tester Hub, Admin Dashboard (Testing) — was invisible.
 *
 * That mattered concretely: `USER_NAV_GROUPS.Testing` is literally
 * `items: []`, so `/user/tester` escaped orphan status ONLY because an
 * unrelated line in ADMIN_NAV_GROUPS happens to reference it. Delete that
 * admin line and a still-reachable page silently becomes an orphan.
 */
function extractRuntimeNavBlock(source) {
  const start = source.indexOf("export function getUserNavGroups");
  if (start === -1) return null;
  return source.slice(start);
}

function extractHrefs(block) {
  const hrefs = [];

  // ROUTES.SECTION.KEY references (String(ROUTES.ADMIN.FOO))
  const routeRefRe = /ROUTES\.(\w+)\.(\w+)\)/g;
  let m;
  while ((m = routeRefRe.exec(block)) !== null) {
    hrefs.push({ kind: "route-ref", section: m[1], key: m[2] });
  }

  // Hardcoded literal string hrefs (adminItem("/admin/maintenance", ...))
  const literalRe = /(?:adminItem\(\s*|href:\s*)"(\/[^"]+)"/g;
  while ((m = literalRe.exec(block)) !== null) {
    hrefs.push({ kind: "literal", path: m[1] });
  }

  return hrefs;
}

function pagePathExists(urlPath) {
  // urlPath like "/admin/grouped-listings" -> src/app/[locale]/admin/grouped-listings/page.tsx
  const segments = urlPath.split("/").filter(Boolean);
  return resolveSegments(APP_DIR, segments);
}

/*
 * Hole 4 (closed 2026-08-26): this was a literal `join(...segments)`, so it
 * could not resolve a href onto a route served by a `[param]` folder. Any
 * future nav entry pointing at one would have been a guaranteed false
 * NAV_DEAD_LINK — an audit that cries wolf is one people start suppressing.
 *
 * Walks segment by segment, preferring an exact directory and falling back to
 * a single dynamic child. Catch-alls (`[...slug]`) match greedily and end the
 * walk, which is what Next does.
 */
function resolveSegments(baseDir, segments) {
  if (segments.length === 0) return existsSync(join(baseDir, "page.tsx"));

  const [head, ...rest] = segments;
  const exact = join(baseDir, head);
  if (existsSync(exact) && resolveSegments(exact, rest)) return true;

  let children;
  try {
    children = readdirSync(baseDir, { withFileTypes: true });
  } catch {
    return false;
  }
  for (const child of children) {
    if (!child.isDirectory()) continue;
    const name = child.name;
    if (!name.startsWith("[") || !name.endsWith("]")) continue;
    const isCatchAll = name.startsWith("[...") || name.startsWith("[[...");
    if (isCatchAll) return existsSync(join(baseDir, name, "page.tsx"));
    if (resolveSegments(join(baseDir, name), rest)) return true;
  }
  return false;
}

// ─── Walk admin/store/user for top-level page.tsx orphan candidates ───────

function walkPages(baseDir, urlPrefix, out) {
  let entries;
  try {
    entries = readdirSync(baseDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const segment = entry.name;
    const isDynamic = segment.startsWith("[") && segment.endsWith("]");
    const isExcluded = EXCLUDED_SEGMENTS.has(segment.toLowerCase());
    const childDir = join(baseDir, segment);
    const childUrl = `${urlPrefix}/${segment}`;

    if (!isDynamic && !isExcluded && existsSync(join(childDir, "page.tsx"))) {
      out.push(childUrl);
    }
    /*
     * Hole 3 (closed 2026-08-26): recursion used to stop at an excluded
     * segment as well as skipping it, so a real hub page nested anywhere
     * under new/ edit/ view/ … was permanently invisible to the orphan pass.
     * Excluding a segment means "this page is a legitimate sub-route", not
     * "nothing below here counts".
     *
     * Dynamic segments still stop the walk: everything under `[id]/` is
     * per-record by definition and can never need its own nav entry.
     */
    if (!isDynamic) {
      walkPages(childDir, childUrl, out);
    }
  }
}

// ─── Main ───────────────────────────────────────────────────────────────

const navSource = readFileSync(NAV_FILE, "utf8");
const routeMapSource = readFileSync(ROUTE_MAP_FILE, "utf8");
const routeMap = parseRouteMap(routeMapSource);

const deadLinks = [];
const allNavPaths = new Set();

/*
 * Every nav surface, not just the three sidebars. The `countsAsNav` flag is
 * the one real difference: a public header/footer link proves a page is
 * REACHABLE, but it is not a dashboard nav entry, so it must not silence the
 * orphan pass for a portal page.
 */
const NAV_SOURCES = [
  ...NAV_GROUP_NAMES.map((name) => ({ name, countsAsNav: true, required: true })),
  ...FLAT_NAV_NAMES.map((name) => ({ name, countsAsNav: false, required: true })),
];

for (const { name: groupName, countsAsNav } of NAV_SOURCES) {
  const block = extractGroupBlock(navSource, groupName);
  if (!block) {
    console.log(`audit-nav-page-wiring: could not find ${groupName} in navigation.tsx — skipping`);
    continue;
  }
  const hrefs = extractHrefs(block);
  for (const href of hrefs) {
    let urlPath;
    if (href.kind === "route-ref") {
      urlPath = resolveRoute(routeMap, href.section, href.key);
      if (urlPath === undefined) {
        // Function-valued route (e.g. a detail-page builder) or unresolved —
        // nav items should never point at parametric routes; skip silently,
        // it isn't something this audit can statically resolve.
        continue;
      }
    } else {
      urlPath = href.path;
    }
    if (countsAsNav) allNavPaths.add(urlPath);
    if (!pagePathExists(urlPath)) {
      deadLinks.push({ group: groupName, urlPath, source: href.kind === "route-ref" ? `ROUTES.${href.section}.${href.key}` : `"${href.path}"` });
    }
  }
}

/*
 * The runtime-injected user nav. Dead-link checked like everything else, and
 * it DOES count as nav — these items are how a real user reaches those pages,
 * regardless of the static array being empty.
 */
const runtimeBlock = extractRuntimeNavBlock(navSource);
if (runtimeBlock) {
  for (const href of extractHrefs(runtimeBlock)) {
    let urlPath;
    if (href.kind === "route-ref") {
      urlPath = resolveRoute(routeMap, href.section, href.key);
      if (urlPath === undefined) continue;
    } else {
      urlPath = href.path;
    }
    allNavPaths.add(urlPath);
    if (!pagePathExists(urlPath)) {
      deadLinks.push({
        group: "getUserNavGroups()",
        urlPath,
        source: href.kind === "route-ref" ? `ROUTES.${href.section}.${href.key}` : `"${href.path}"`,
      });
    }
  }
}

// ─── Orphan (report-only) pass ─────────────────────────────────────────────

const orphans = [];
for (const [dirName, urlPrefix] of [["admin", "/admin"], ["store", "/store"], ["user", "/user"]]) {
  const candidates = [];
  walkPages(join(APP_DIR, dirName), urlPrefix, candidates);
  for (const url of candidates) {
    if (!allNavPaths.has(url)) orphans.push(url);
  }
}

// ─── Report ─────────────────────────────────────────────────────────────

if (deadLinks.length > 0) {
  console.log(`\naudit-nav-page-wiring: ${deadLinks.length} dead nav link(s) — FAIL\n`);
  for (const d of deadLinks) {
    console.log(`  🔴 ${d.group}: ${d.source} -> "${d.urlPath}" has no matching page.tsx`);
  }
  console.log(
    "\nFix: create src/app/[locale]<path>/page.tsx, or remove the dead nav entry\n" +
    "     from src/constants/navigation.tsx if the feature no longer exists.\n"
  );
}

if (orphans.length > 0) {
  console.log(`\naudit-nav-page-wiring: ${orphans.length} orphaned top-level page(s) (report-only, non-blocking):\n`);
  for (const o of orphans.sort()) {
    console.log(`  ⚠️  ${o} — page.tsx exists but no nav entry references it`);
  }
  console.log(
    "\nThese pages are only reachable by typing the exact URL. If this is a\n" +
    "real, finished feature, add it to ADMIN_NAV_GROUPS/STORE_NAV_GROUPS/\n" +
    "USER_NAV_GROUPS in src/constants/navigation.tsx.\n"
  );
}

if (deadLinks.length === 0 && orphans.length === 0) {
  console.log("audit-nav-page-wiring: clean.\n");
}

process.exit(deadLinks.length > 0 ? 1 : 0);
