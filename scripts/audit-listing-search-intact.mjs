#!/usr/bin/env node
/**
 * audit-listing-search-intact.mjs — the per-collection search boxes keep working.
 *
 * Every listing view — ~33 admin/seller tables plus the public `/stores`,
 * `/auctions`, `/blog` boxes — filters through one mechanism: the repository
 * pushes the longest token down as `array-contains` on `searchTxt` and refines
 * the remaining terms in memory. Three things have to be true for that to be a
 * search rather than a decoration, and **each fails silently**:
 *
 *   R1  WINDOW_TRIPLE_BROKEN
 *       `beginSearchWindow` is a THREE-part conversion and the parts only work
 *       together: fetch a window, RAISE `maxPageSize` to that window, and hand
 *       `finish` the requested page to slice. Its own docstring says doing 1
 *       and 3 without 2 "reads exactly like a working conversion and is the
 *       half that no-ops" — Sieve clamps the window back to a page and the
 *       result is the original bug with a larger constant.
 *
 *   R2  NO_REFINE
 *       A file that pushes `array-contains` on the searchTxt field must apply
 *       the REMAINING terms somewhere — `finish`, `refineSearchTxt`, or
 *       `matchesAllSearchTerms`. Without it a two-word search returns every row
 *       matching the longest word, and reports that as a complete result.
 *       🛑 This is not hypothetical: `supportTickets` shipped exactly this, and
 *       carried a comment three lines up asserting the refine happened. The
 *       claim was the only thing standing where the implementation should have
 *       been (Root Cause #50's shape).
 *
 *   R3  NO_EMPTY_GUARD
 *       A query that normalises to no usable term ("!!!", "—") must return
 *       NOTHING. Falling through to an unfiltered list is how a punctuation
 *       search returns the entire published catalogue AS SEARCH RESULTS, which
 *       `/api/products` did until A2.
 *
 * 🛑 THE POINT OF THIS AUDIT IS THAT IT GUARDS WORKING CODE. It was written
 * alongside a cross-resource search feature built *around* these repositories,
 * and its job is to fail if that work quietly degrades one of them. All three
 * rules were at zero when it landed, except the `supportTickets` R2 violation
 * it was written to pin shut.
 *
 * 🛑 It also deliberately covers the HAND-ROLLED readers. `faqs` uses
 * `parseSearchTxtQuery` rather than `planSearchTxt` and guards by hand, so a
 * rule keyed only on `planSearchTxt` would not look at it at all — and a rule
 * that stops looking is indistinguishable from a rule that is satisfied
 * (Root Cause #84).
 *
 * Suppression: `// audit-listing-search-ok: <reason>` on the same line or the
 * line above the offending construct. Reserve it for a reader whose contract
 * genuinely differs (an unpaginated full read whose callers page in memory).
 *
 * Strict zero.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const APPKIT = join(ROOT, "appkit", "src");
const SUPPRESS = "audit-listing-search-ok";

/**
 * The module that DEFINES the helpers. Its own `beginSearchWindow` /
 * `maxPageSize` / `finish` are the implementation, not a call site, and
 * counting them would make the definition look like a broken consumer.
 */
const DEFINITION_FILE = "appkit/src/utils/search-txt-query.ts";

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
    if (e.name === "node_modules" || e.name === "dist") continue;
    if (e.isDirectory()) walk(full, out);
    else if (/\.ts$/.test(e.name) && !/\.d\.ts$/.test(e.name)) out.push(full);
  }
  return out;
}

/**
 * Blank out comments while PRESERVING line structure.
 *
 * 🛑 The usual `stripComments` deletes block comments outright, which collapses
 * lines — so an index into the stripped source no longer matches the real file
 * and the report points at the wrong place. The first run of this audit blamed
 * a prose line in a header comment for a `NO_REFINE` violation. A finding with
 * the wrong line number is a finding people learn to distrust.
 */
function maskComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

/**
 * The marker may sit on the line itself, or anywhere in the CONTIGUOUS comment
 * block immediately above it.
 *
 * 🛑 One line above is not enough and this audit proved it on itself: a real
 * exemption here needs to say *where the guard actually lives*, which does not
 * fit on one line, and a rule that only reads one line silently ignores the
 * reason and keeps failing. `audit-dead-underscore-prop` already scans the
 * block for exactly this — "multi-line word-wrapped explanations are scanned,
 * not just the single line directly above".
 */
function suppressedNear(rawLines, idx) {
  if ((rawLines[idx] ?? "").includes(SUPPRESS)) return true;
  for (let i = idx - 1; i >= 0; i--) {
    const line = (rawLines[i] ?? "").trim();
    if (line === "") continue;
    const isComment = line.startsWith("//") || line.startsWith("*") || line.startsWith("/*");
    if (!isComment) return false;
    if (line.includes(SUPPRESS)) return true;
  }
  return false;
}

const count = (src, re) => (src.match(re) ?? []).length;

for (const file of walk(APPKIT)) {
  const rel = relative(ROOT, file).split(sep).join("/");
  if (rel === DEFINITION_FILE) continue;

  const raw = readFileSync(file, "utf8");
  const src = maskComments(raw);
  const rawLines = raw.split(/\r?\n/);
  // Index into the MASKED lines so a finding can never land on a comment.
  const lines = src.split(/\r?\n/);

  const usesPlan = /\bplanSearchTxt\s*\(/.test(src);
  const usesParse = /\bparseSearchTxtQuery\s*\(/.test(src);
  if (!usesPlan && !usesParse) continue;

  /*
   * A file that only ASKS whether the query normalised away — `list-public.ts`
   * calls `planSearchTxt(q).empty` and delegates the actual query to the
   * repository — is a guard, not a reader. It has no clause to refine.
   */
  const pushesSearchClause =
    /array-contains["']?\s*,/.test(src) && /SEARCH_TXT|searchTxt/.test(src);

  // ── R1 ────────────────────────────────────────────────────────────────────
  const nWindow = count(src, /\bbeginSearchWindow\s*\(/g);
  if (nWindow > 0) {
    const nMax = count(src, /\.maxPageSize\s*\(/g);
    const nFinish = count(src, /\.finish\s*\(/g);
    if (nMax !== nWindow || nFinish !== nWindow) {
      const idx = lines.findIndex((l) => /\bbeginSearchWindow\s*\(/.test(l));
      if (!suppressedNear(rawLines, idx)) {
        violations.push({
          file: rel,
          line: idx + 1,
          rule: "WINDOW_TRIPLE_BROKEN",
          snippet: `beginSearchWindow ×${nWindow}, maxPageSize ×${nMax}, finish ×${nFinish}`,
          hint:
            "All three move together. Raising maxPageSize to the window is the part that\n" +
            "      no-ops when omitted: Sieve clamps the fetch back to one page and the\n" +
            "      conversion reads as working while changing nothing.",
        });
      }
    }
  }

  // ── R2 ────────────────────────────────────────────────────────────────────
  if (pushesSearchClause) {
    /*
     * 🛑 A HAND-ROLLED refine counts, and the first version of this rule did
     * not know that. `searchEverything` filters with
     * `plan.rest.every((t) => txt.includes(t))` — a real AND-refine using no
     * helper at all — and was reported as broken. What matters is that the
     * remaining terms are consulted, not which function consults them.
     */
    const refines =
      nWindow > 0 ||
      /\brefineSearchTxt\s*\(/.test(src) ||
      /\bmatchesAllSearchTerms\s*\(/.test(src) ||
      /\bplan\.rest\b/.test(src) ||
      /\bterms\.slice\s*\(\s*1\s*\)/.test(src);
    if (!refines) {
      const idx = lines.findIndex((l) => /array-contains/.test(l));
      if (!suppressedNear(rawLines, idx)) {
        violations.push({
          file: rel,
          line: idx + 1,
          rule: "NO_REFINE",
          snippet: rawLines[idx]?.trim().slice(0, 110) ?? "array-contains push-down",
          hint:
            "One token is pushed down; the rest must be AND-refined in memory. Without it a\n" +
            "      two-word search returns everything matching the longest word — and reports\n" +
            "      it as a complete result, so it looks like a working search.",
        });
      }
    }
  }

  // ── R3 ────────────────────────────────────────────────────────────────────
  /*
   * 🛑 PER CALL SITE, not per file — and that distinction is the whole rule.
   *
   * The first version tested the whole file for a guard. A repository with
   * several search methods therefore passed if ANY ONE of them guarded, so
   * deleting the guard from `listByStore` changed nothing: the audit stayed
   * green against the exact defect it exists to catch. Found by running the
   * negative control, not by reading the rule (Root Cause #87 — never trust an
   * audit you have not seen fail).
   *
   * Proximity, because that is how these are actually written: the guard is
   * the next statement after the plan. Measured on the real callers — support
   * 8 lines, faqs 6, searchEverything 10 — so a 20-line window is comfortable
   * and still tight enough to be about one method.
   *
   * `!plan.head` counts: it is the same guard by another spelling, and is what
   * `searchEverything` uses.
   */
  const GUARD_WINDOW = 20;
  const GUARD_RE = /\.empty\b|\bemptySearchResult\s*\(|terms\.length\s*===\s*0|!\s*plan\.head\b/;
  if (pushesSearchClause) {
    lines.forEach((line, idx) => {
      if (!/\bplanSearchTxt\s*\(|\bparseSearchTxtQuery\s*\(/.test(line)) return;
      if (/^\s*import\b/.test(line)) return; // the import names them; it is not a call site
      const near = lines.slice(idx, idx + GUARD_WINDOW).join("\n");
      if (GUARD_RE.test(near)) return;
      if (suppressedNear(rawLines, idx)) return;
      violations.push({
        file: rel,
        line: idx + 1,
        rule: "NO_EMPTY_GUARD",
        snippet: rawLines[idx]?.trim().slice(0, 110) ?? "search entry",
        hint:
          'A query that yields no usable term must return NOTHING. "!!!" falling through to\n' +
          "      an unfiltered list returns the whole collection AS SEARCH RESULTS.\n" +
          `      Guard within ${GUARD_WINDOW} lines of this call.`,
      });
    });
  }
}

violations.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

if (violations.length > 0) {
  console.error(`[audit-listing-search-intact] FAIL: ${violations.length} violation(s).\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.rule}]`);
    console.error(`      ${v.snippet}`);
    console.error(`      ${v.hint}\n`);
  }
  console.error(`  Suppress a genuinely different contract with: // ${SUPPRESS}: <reason>`);
  process.exit(1);
}

console.log("[audit-listing-search-intact] OK: 0 violations (window triple, refine, empty guard).");
