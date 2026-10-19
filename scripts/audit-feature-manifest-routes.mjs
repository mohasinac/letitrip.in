#!/usr/bin/env node
/*
 * audit-feature-manifest-routes — report-only. A7.
 *
 * A `FeatureManifest.routes[].exports.default` is a claim: "the page at this
 * segment renders this component." Nothing reads the manifest at runtime —
 * it exists for humans mapping the codebase — so a wrong claim drifts
 * silently forever. `search/manifest.ts` said `SearchView` while the real
 * route rendered a component that didn't even exist under that name by the
 * time this audit was written; the manifest was the one place in the repo
 * actively lying about the feature.
 *
 * Checks, per `routes[]` entry across every feature's `manifest.ts`
 * (appkit/src/features/<name>/manifest.ts):
 *
 *   R1  the segment resolves to a real `page.tsx` (or `route.ts` for an API
 *       segment) under `src/app/**`
 *   R2  the named default export's identifier appears somewhere in that
 *       page's source — imported, or defined and rendered locally
 *
 * 🛑 R2 is deliberately a TEXT CHECK, not an import-graph walk. A page can
 * define its default inline (`export default function SearchPage() {…
 * <SearchResultsClient /> …}`) rather than import a same-named symbol from
 * elsewhere, so "the identifier appears in the file" is the honest signal;
 * resolving imports transitively would need a real module graph this
 * script does not have.
 *
 * REPORT-ONLY, not strict-zero. Unlike the search-specific audits in this
 * sweep, this one touches 27 OTHER features' manifests that were never part
 * of this work and have not been individually verified — failing the build
 * on a gap found by a wide static sweep, in files nobody asked to fix today,
 * is the bulk-conversion mistake `listing-delegation`'s own header warns
 * against. `MIGRATE=strict` fails everything, same convention as the two
 * staged ratchets in CLAUDE.md.
 *
 * Negative control: point `search/manifest.ts` at a component the page does
 * not reference → must report it.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FEATURES_DIR = join(ROOT, "appkit", "src", "features");
const APP_DIR = join(ROOT, "src", "app");
const STRICT = process.env.MIGRATE === "strict";

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".next") continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** `"[locale]/search"` -> the real page file, resolving `[param]` segments loosely. */
function findPageFile(segment, kind) {
  const parts = segment.split("/").filter(Boolean);
  let dir = APP_DIR;
  for (const part of parts) {
    if (!existsSync(dir)) return null;
    const exact = join(dir, part);
    if (existsSync(exact) && statSync(exact).isDirectory()) {
      dir = exact;
      continue;
    }
    // A literal segment the manifest wrote (e.g. "search") against a real
    // dynamic folder (e.g. "[slug]") — accept any single bracketed child.
    const dyn = readdirSync(dir).find(
      (d) => d.startsWith("[") && statSync(join(dir, d)).isDirectory(),
    );
    if (!dyn) return null;
    dir = join(dir, dyn);
  }
  if (!existsSync(dir)) return null;
  const file = kind === "api" ? "route.ts" : "page.tsx";
  const path = join(dir, file);
  return existsSync(path) ? path : null;
}

const findings = [];
let manifestsChecked = 0;
let routesChecked = 0;

if (!existsSync(FEATURES_DIR)) {
  console.error("[audit-feature-manifest-routes] appkit/src/features not found.");
  process.exit(1);
}

for (const entry of readdirSync(FEATURES_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const manifestPath = join(FEATURES_DIR, entry.name, "manifest.ts");
  if (!existsSync(manifestPath)) continue;
  manifestsChecked++;

  const src = readFileSync(manifestPath, "utf8");

  /*
   * A line-oriented scan of the `routes: [...]` array. Brace-aware JSON
   * parsing would be more correct but every manifest here is a small,
   * hand-written literal — the pattern this project's other `*.mjs` audits
   * already use for comparable TS object literals.
   */
  const routeBlockMatch = /routes:\s*\[([\s\S]*?)\]\s*,?\s*\n\s*(apiRoutes|};)/.exec(src);
  if (!routeBlockMatch) continue;
  const routeEntries = [
    ...routeBlockMatch[1].matchAll(
      /segment:\s*["']([^"']+)["'][^}]*?exports:\s*\{\s*default:\s*["']([^"']+)["']/g,
    ),
  ];

  for (const [, segment, defaultExport] of routeEntries) {
    routesChecked++;
    const pageFile = findPageFile(segment, "page");
    if (!pageFile) {
      findings.push(
        `${relative(ROOT, manifestPath)} :: "${segment}" has no page.tsx under src/app — ` +
          `the manifest claims a route that does not exist.`,
      );
      continue;
    }
    const pageSrc = readFileSync(pageFile, "utf8");
    const identifierRe = new RegExp(`\\b${defaultExport}\\b`);
    if (!identifierRe.test(pageSrc)) {
      findings.push(
        `${relative(ROOT, manifestPath)} :: "${segment}" claims default export ` +
          `"${defaultExport}", but ${relative(ROOT, pageFile)} never references that ` +
          `identifier. The manifest is describing a page that does not exist.`,
      );
    }
  }
}

if (findings.length === 0) {
  console.log(
    `[audit-feature-manifest-routes] OK: 0 findings ` +
      `(${manifestsChecked} manifest(s), ${routesChecked} route(s) checked).`,
  );
  process.exit(0);
}

console.error(
  `\n[audit-feature-manifest-routes] ${findings.length} finding(s) ` +
    `${STRICT ? "(MIGRATE=strict)" : "(report-only — MIGRATE=strict to fail)"}:\n`,
);
for (const f of findings) console.error(`  - ${f}`);
console.error("");
process.exit(STRICT ? 1 : 0);
