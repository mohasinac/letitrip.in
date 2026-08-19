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
  const dir = join(APP_DIR, ...segments);
  return existsSync(join(dir, "page.tsx"));
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
    if (!isDynamic && !isExcluded) {
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

for (const groupName of NAV_GROUP_NAMES) {
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
    allNavPaths.add(urlPath);
    if (!pagePathExists(urlPath)) {
      deadLinks.push({ group: groupName, urlPath, source: href.kind === "route-ref" ? `ROUTES.${href.section}.${href.key}` : `"${href.path}"` });
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
