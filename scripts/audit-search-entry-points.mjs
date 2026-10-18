#!/usr/bin/env node
/**
 * audit-search-entry-points.mjs — site-wide search stays REACHABLE.
 *
 * 🛑 This rule exists because of a defect that every other gate passed.
 *
 * `/search` was built, correct, and completely unreachable. It renders real
 * federated results over nine collections; `searchEverything` was tested;
 * `audit-nav-page-wiring` was green (it blocks a nav href with no page, not a
 * page with no href); tsc, lint and ~150 audits were green. The only thing
 * wrong was that the header's `onSearch` still did
 * `router.push(SEARCH_ROUTE_MAP[type] + "?q=")` — the redirect the page was
 * built to replace had not been deleted, it had been MOVED into the handler.
 *
 * So a buyer searching "dranzer" went to `/products?q=dranzer` and never
 * learned there was also a category, a part, a blog post and an FAQ about it,
 * and nothing in the codebase could tell.
 *
 * Every existing gate asks "is this safe?". None asked "does this still
 * work?". That is the gap these three rules cover.
 *
 *   R1  HEADER_DOES_NOT_REACH_SEARCH
 *       The header's `onSearch` must navigate to `ROUTES.PUBLIC.SEARCH`.
 *
 *   R2  SEARCH_PAGE_UNREACHABLE
 *       `/search` must be referenced from live UI code — not only from
 *       JSON-LD (`SearchAction` sitelinks markup), the route map, and a
 *       metadata builder, which is exactly the set of references it had while
 *       being unreachable. Those three are therefore EXCLUDED from counting.
 *
 *       🛑 R2 IS THE WEAK ONE, and saying so is the point. It counts two
 *       references today and one of them is `CharacterHotspot.tsx`, whose
 *       `shopAllHref` DEFAULT is `ROUTES.PUBLIC.SEARCH` — a component with no
 *       mount under `src/`. So R2 would stay green on a default prop of
 *       something nothing renders. R1 is what actually guarantees
 *       reachability; R2 only catches "the header file was renamed and
 *       nothing replaced it", and R1 exits 2 outright in that case anyway.
 *       Do not read a green R2 as proof a user can get there.
 *
 *   R3  TYPE_TO_BROWSE_ROUTE_MAP
 *       No `Record<SearchResourceType, string>`-shaped literal mapping types
 *       to browse routes. It is the redirect in data form, and it is also a
 *       hand-written enumeration of the listing-type union that the plugin
 *       registry already owns (Root Cause #61).
 *
 * Suppression: `// audit-search-entry-ok: <reason>`.
 *
 * Strict zero.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SUPPRESS = "audit-search-entry-ok";

/** The file that owns the header search box's submit behaviour. */
const HEADER_FILE = "src/app/[locale]/LayoutShellClient.tsx";

/**
 * References that existed WHILE the page was unreachable, so they prove
 * nothing about reachability. Named individually rather than by directory —
 * a blanket `seo/` skip would also hide a real link added there later.
 */
const NON_UI_REFERENCES = [
  "appkit/src/seo/json-ld.ts", // SearchAction sitelinks markup, for Google
  "appkit/src/seo/metadata.ts", // canonical builder
  "appkit/src/next/routing/route-map.ts", // the constant itself
  "scripts/audit-search-entry-points.mjs", // this file
];

const SCAN_DIRS = ["src", "appkit/src"];

const violations = [];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.name === "node_modules" || e.name === "dist" || e.name === ".next") continue;
    if (e.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.d\.ts$/.test(e.name)) out.push(full);
  }
  return out;
}

/** Blank comments, preserving line structure so findings land on real code. */
function maskComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

const rel = (f) => relative(ROOT, f).split(sep).join("/");

// ── R1 — the header reaches /search ─────────────────────────────────────────
const headerPath = join(ROOT, HEADER_FILE);
if (!existsSync(headerPath)) {
  console.error(`audit-search-entry-points: cannot find ${HEADER_FILE} — did it move?`);
  process.exit(2);
}
const headerSrc = maskComments(readFileSync(headerPath, "utf8"));
if (!headerSrc.includes(SUPPRESS)) {
  const onSearch = /onSearch=\{[\s\S]{0,900}?\n\s{14}\}\}/.exec(headerSrc);
  const body = onSearch ? onSearch[0] : headerSrc;
  const reachesSearch = /ROUTES\.PUBLIC\.SEARCH/.test(body);
  if (!reachesSearch) {
    violations.push({
      file: HEADER_FILE,
      rule: "HEADER_DOES_NOT_REACH_SEARCH",
      detail: "the header's onSearch does not push ROUTES.PUBLIC.SEARCH",
      hint:
        "The cross-resource page is only reachable if the header sends people to it.\n" +
        "      Pushing a per-type browse route instead IS the redirect /search replaced —\n" +
        "      it was never deleted, only moved into this handler.",
    });
  }
}

// ── R2 + R3 — a live reference exists, and the map stays gone ───────────────
let uiReferences = 0;
for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const r = rel(file);
    const raw = readFileSync(file, "utf8");
    const src = maskComments(raw);

    if (/ROUTES\.PUBLIC\.SEARCH\b/.test(src) && !NON_UI_REFERENCES.includes(r)) {
      uiReferences++;
    }

    /*
     * R3. Matches the SHAPE — a Record keyed by SearchResourceType whose
     * values are browse paths — rather than the old identifier, so renaming
     * the constant does not evade it.
     */
    const mapShape = /Record<\s*SearchResourceType\s*,\s*string\s*>\s*=\s*\{/.exec(src);
    if (mapShape && !raw.includes(SUPPRESS)) {
      const line = src.slice(0, mapShape.index).split("\n").length;
      violations.push({
        file: r,
        line,
        rule: "TYPE_TO_BROWSE_ROUTE_MAP",
        detail: "Record<SearchResourceType, string> mapping types to routes",
        hint:
          "This is the redirect in data form. Per-type destinations belong in each\n" +
          "      group's `moreHref` in search-sources.ts, and nine of the fifteen entries\n" +
          "      duplicate pluginFor(t).browseRoute (Root Cause #61).",
      });
    }
  }
}

if (uiReferences === 0) {
  violations.push({
    file: "(whole tree)",
    rule: "SEARCH_PAGE_UNREACHABLE",
    detail: "no live UI code references ROUTES.PUBLIC.SEARCH",
    hint:
      "JSON-LD, the metadata builder and the route map all referenced it while the\n" +
      "      page was unreachable, so those do not count. Something a user can click\n" +
      "      has to point at it.",
  });
}

if (violations.length > 0) {
  console.error(`[audit-search-entry-points] FAIL: ${violations.length} violation(s).\n`);
  for (const v of violations) {
    console.error(`  ${v.file}${v.line ? ":" + v.line : ""}  [${v.rule}]`);
    console.error(`      ${v.detail}`);
    console.error(`      ${v.hint}\n`);
  }
  console.error(`  Suppress with: // ${SUPPRESS}: <reason>`);
  process.exit(1);
}

console.log(
  `[audit-search-entry-points] OK: 0 violations ` +
    `(header reaches /search, ${uiReferences} live UI reference(s), no type->route map).`,
);
