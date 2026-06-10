#!/usr/bin/env node
/**
 * audit-route-nav-field-constants.mjs
 *
 * Enforces three rules that have no other audit coverage:
 *
 *   R1 — Hardcoded route literals (`href="/admin/products"`, `router.push("/...")`)
 *        must use ROUTES.* from `appkit/src/next/routing/route-map.ts`.
 *
 *   R2 — Inline nav-group arrays in `src/app/**\/layout.tsx` files must come from
 *        `@/constants/navigation` (ADMIN_NAV_GROUPS / STORE_NAV_GROUPS / USER_NAV_GROUPS /
 *        SIDEBAR_SUPPORT_LINKS / FOOTER_LINK_GROUPS / MAIN_NAV_ITEMS).
 *
 *   R3 — Raw Firestore field strings in `where("field", ...)` / `orderBy("field", ...)`
 *        calls must use the corresponding `*_FIELDS` constant from
 *        `appkit/src/constants/field-names.ts`.
 *
 * Suppression markers (per-line, with reason in the same line/block):
 *   // audit-route-ok          — legit hardcoded route string (e.g. external redirect target)
 *   // audit-nav-ok            — legit inline nav array (e.g. test fixture)
 *   // audit-field-name-ok     — dynamic field path constructed at runtime
 *
 * Exits 0 on clean, 1 on any violation.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, sep } from "path";

const ROOT = process.cwd();

// ---------------------------------------------------------------------------
// File walking
// ---------------------------------------------------------------------------

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  ".git",
  "coverage",
  "playwright-report",
  "test-results",
]);

function walk(absDir, files = []) {
  let entries;
  try {
    entries = readdirSync(absDir);
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    if (entry.startsWith(".")) continue;
    const full = join(absDir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      walk(full, files);
    } else if (/\.(tsx|ts)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function rel(absPath) {
  return absPath.startsWith(ROOT) ? absPath.slice(ROOT.length + 1) : absPath;
}

function norm(p) {
  return p.split(sep).join("/");
}

// ---------------------------------------------------------------------------
// R3 — Schema field-name corpus
// ---------------------------------------------------------------------------
//
// Parse `appkit/src/constants/field-names.ts`. For every
// `export const X_FIELDS = { ... } as const;` block, collect the right-hand
// string-literal values of *leaf* keys. Nested objects (STATUS_VALUES,
// TYPE_VALUES, etc.) are NOT field names — skip them.
//
// Result: Map<fieldName, Array<{ constName, key }>>.

function parseFieldNameCorpus() {
  const file = join(ROOT, "appkit", "src", "constants", "field-names.ts");
  const text = readFileSync(file, "utf8");
  const corpus = new Map(); // fieldName -> [{ constName, key }]

  // Match each `export const NAME_FIELDS = { ... } as const;` block by
  // brace-tracking from the opening `{`.
  const headerRe = /export\s+const\s+([A-Z_]+_FIELDS|OAUTH_STATE_VALUES|SCHEMA_DEFAULTS)\s*=\s*\{/g;
  let m;
  while ((m = headerRe.exec(text)) !== null) {
    const constName = m[1];
    // SCHEMA_DEFAULTS and OAUTH_STATE_VALUES hold values, not field names.
    if (constName === "SCHEMA_DEFAULTS" || constName === "OAUTH_STATE_VALUES") {
      continue;
    }

    const openIdx = text.indexOf("{", m.index + m[0].length - 1);
    if (openIdx < 0) continue;
    let depth = 0;
    let i = openIdx;
    for (; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    const body = text.slice(openIdx + 1, i);

    // Walk only the top-level entries by tracking braces.
    let entry = "";
    let bDepth = 0;
    const entries = [];
    for (const ch of body) {
      if (ch === "{") bDepth++;
      if (ch === "}") bDepth--;
      if (ch === "," && bDepth === 0) {
        entries.push(entry);
        entry = "";
      } else {
        entry += ch;
      }
    }
    if (entry.trim().length > 0) entries.push(entry);

    for (const raw of entries) {
      const e = raw.trim();
      if (!e) continue;
      // Skip nested-object entries (e.g. `STATUS_VALUES: { ... }`).
      if (/^[A-Z_]+\s*:\s*\{/.test(e)) continue;
      // Match `KEY: "value"` or `KEY: 'value'`.
      const leaf = e.match(/^([A-Z_][A-Z0-9_]*)\s*:\s*["']([^"']+)["']/);
      if (!leaf) continue;
      const key = leaf[1];
      const value = leaf[2];
      // Skip dotted field paths (e.g. `stats.views`) — they are usually
      // intentional and not bare field names.
      if (value.includes(".")) continue;
      // Skip extremely short / generic tokens that collide with common
      // identifiers (`id` is fine; we keep it because it appears in queries).
      if (!corpus.has(value)) corpus.set(value, []);
      corpus.get(value).push({ constName, key });
    }
  }
  return corpus;
}

// ---------------------------------------------------------------------------
// R3 — Scan repository / data / API files for raw `where("...")`/`orderBy("...")`.
// ---------------------------------------------------------------------------

const R3_SKIP_PATTERNS = [
  // Source-of-truth — corpus and schema definitions.
  /[\\/]appkit[\\/]src[\\/]constants[\\/]field-names\.ts$/,
  /[\\/]appkit[\\/]src[\\/]features[\\/][^\\/]+[\\/]schemas[\\/]firestore\.ts$/,
  /[\\/]appkit[\\/]src[\\/]features[\\/][^\\/]+[\\/]schemas[\\/]index\.ts$/,
];

function shouldSkipR3(file) {
  return R3_SKIP_PATTERNS.some((p) => p.test(file));
}

const WHERE_RE = /\bwhere\s*\(\s*["']([a-zA-Z_][\w.]*)["']/g;
const ORDERBY_RE = /\borderBy\s*\(\s*["']([a-zA-Z_][\w.]*)["']/g;

function checkR3(file, content, corpus, violations) {
  if (shouldSkipR3(file)) return;
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("// audit-field-name-ok")) continue;

    const findInLine = (re, kind) => {
      re.lastIndex = 0;
      let mm;
      while ((mm = re.exec(line)) !== null) {
        const field = mm[1];
        // Firestore document-id sentinel — not a field name.
        if (field === "__name__") continue;
        // Dotted paths (e.g. `stats.itemsSold`) — caller may legitimately use
        // a nested field; constants for these exist under `*_FIELDS_FIELDS`
        // sub-objects and we don't enforce them here.
        if (field.includes(".")) continue;
        if (corpus.has(field)) {
          const hits = corpus.get(field);
          const suggestion = hits
            .map((h) => `${h.constName}.${h.key}`)
            .slice(0, 3)
            .join(" | ");
          violations.push({
            rule: "R3",
            file: norm(rel(file)),
            line: i + 1,
            message: `raw ${kind}("${field}", ...) — use ${suggestion}`,
          });
        }
      }
    };

    findInLine(WHERE_RE, "where");
    findInLine(ORDERBY_RE, "orderBy");
  }
}

// ---------------------------------------------------------------------------
// R1 — Hardcoded route literals in src/.
// ---------------------------------------------------------------------------
//
// Target string literals beginning with one of the public route segments,
// inside an actual routing context (href / router.push / etc.).
// Skips JSDoc/comment lines and ROUTES.* references.

const R1_SEGMENTS =
  "admin|store|user|products|stores|auctions|preorders|events|blog|cart|checkout|search|brands|categories|coupons|orders|messages|bundles|prize-draws|wishlist|notifications|sellers|signin|signup|seller|profile|sitemap";

const R1_ROUTE_RE = new RegExp(
  `["'](\\/(${R1_SEGMENTS})(?:\\/[A-Za-z0-9_\\-\\[\\]:.]+)*)["']`,
  "g",
);

const R1_CONTEXT_RE = new RegExp(
  `(?:href\\s*=|router\\.push\\s*\\(|router\\.replace\\s*\\(|redirect\\s*\\(|permanentRedirect\\s*\\(|<Link\\b[^>]*\\bhref\\s*=)`,
);

function isCommentLine(line) {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("*/")
  );
}

function checkR1(file, content, violations) {
  // Only scope to consumer `src/` and `appkit/src/_internal/`.
  const normFile = norm(file);
  const isInScope =
    normFile.includes("/src/app/") ||
    normFile.includes("/src/components/") ||
    normFile.includes("/src/constants/") === false /* skip constants/ */ &&
      (normFile.includes("/letitrip.in/src/") ||
        normFile.includes("/appkit/src/_internal/"));
  if (!isInScope) return;
  // Never scan the canonical sources.
  if (normFile.includes("/src/constants/api.ts")) return;
  if (normFile.includes("/src/constants/navigation.tsx")) return;
  if (normFile.includes("/appkit/src/next/routing/")) return;

  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isCommentLine(line)) continue;
    if (line.includes("// audit-route-ok")) continue;
    if (line.includes("ROUTES.")) continue;
    if (!R1_CONTEXT_RE.test(line)) continue;

    R1_ROUTE_RE.lastIndex = 0;
    let mm;
    while ((mm = R1_ROUTE_RE.exec(line)) !== null) {
      const route = mm[1];
      violations.push({
        rule: "R1",
        file: norm(rel(file)),
        line: i + 1,
        message: `hardcoded route "${route}" — use ROUTES.* from @mohasinac/appkit`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// R2 — Inline nav-group arrays in src/app/**\/layout.tsx files.
// ---------------------------------------------------------------------------
//
// Flag `(items|groups|links|navGroups)\s*[:=]\s*[` blocks that look like
// nav definitions (contain >2 `href:` keys) in layout files that don't
// import from @/constants/navigation.

function checkR2(file, content, violations) {
  const normFile = norm(file);
  if (!normFile.includes("/src/app/")) return;
  if (!normFile.endsWith("/layout.tsx")) return;
  if (content.includes('from "@/constants/navigation"')) return;
  if (content.includes('// audit-nav-ok')) return;

  const decl = /\b(items|groups|links|navGroups)\s*[:=]\s*\[/g;
  let m;
  while ((m = decl.exec(content)) !== null) {
    // Capture the bracket body.
    let depth = 0;
    let i = content.indexOf("[", m.index + m[0].length - 1);
    if (i < 0) continue;
    let j = i;
    for (; j < content.length; j++) {
      if (content[j] === "[") depth++;
      else if (content[j] === "]") {
        depth--;
        if (depth === 0) break;
      }
    }
    const body = content.slice(i + 1, j);
    const hrefHits = (body.match(/\bhref\s*:/g) || []).length;
    if (hrefHits > 2) {
      const lineNum = content.slice(0, m.index).split("\n").length;
      violations.push({
        rule: "R2",
        file: norm(rel(file)),
        line: lineNum,
        message: `inline nav-group "${m[1]}" with ${hrefHits} href entries — import from @/constants/navigation`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const corpus = parseFieldNameCorpus();
if (corpus.size === 0) {
  console.error("[audit-route-nav-field-constants] FATAL: empty field-name corpus — parsing failed");
  process.exit(2);
}

const SCAN_ROOTS = [
  join(ROOT, "src"),
  join(ROOT, "appkit", "src"),
];

const violations = [];
const allFiles = [];
for (const r of SCAN_ROOTS) allFiles.push(...walk(r));

for (const file of allFiles) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  checkR3(file, content, corpus, violations);
  checkR1(file, content, violations);
  checkR2(file, content, violations);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (violations.length === 0) {
  console.log(
    "[audit-route-nav-field-constants] OK — route, nav, and field-name constants honored.",
  );
  process.exit(0);
}

// Group by rule, then by file.
const byRule = { R1: [], R2: [], R3: [] };
for (const v of violations) byRule[v.rule].push(v);

console.error("\n[audit-route-nav-field-constants] VIOLATIONS\n");

const titles = {
  R1: "R1 — hardcoded route literals (use ROUTES.*)",
  R2: "R2 — inline nav-group arrays in layouts (use @/constants/navigation)",
  R3: "R3 — raw Firestore field strings (use *_FIELDS constants)",
};

for (const rule of ["R1", "R2", "R3"]) {
  const list = byRule[rule];
  if (list.length === 0) continue;
  console.error(`\n${titles[rule]} — ${list.length} violation(s):`);

  const byFile = new Map();
  for (const v of list) {
    if (!byFile.has(v.file)) byFile.set(v.file, []);
    byFile.get(v.file).push(v);
  }
  for (const [file, items] of byFile) {
    console.error(`\n  ${file}`);
    for (const v of items) {
      console.error(`    :${v.line}  ${v.message}`);
    }
  }
}

console.error(
  `\nTotal: ${violations.length} violation(s) — R1=${byRule.R1.length}, R2=${byRule.R2.length}, R3=${byRule.R3.length}.`,
);
console.error(
  "Suppression markers: // audit-route-ok | // audit-nav-ok | // audit-field-name-ok (add a reason).\n",
);

process.exit(1);
