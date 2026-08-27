#!/usr/bin/env node
/**
 * audit-search-semantics — guards the SHAPE of every `searchTxt` query.
 *
 * ## Why this exists
 *
 * Two fixes to `products.repository.ts` were silently reverted when a parallel
 * session re-applied its own `searchTokens` → `searchTxt` rename over the file:
 * it kept the rename and dropped the logic. The result typechecked cleanly and
 * passed a 34-point presence audit, because a revert that keeps the new NAMES
 * and restores the old LOGIC is invisible to both `tsc` and to any
 * grep-for-a-symbol check.
 *
 * So this audit asserts the shape of the BUGS, not the presence of the fixes.
 *
 * ## What it blocks
 *
 * R1 ARRAY_CONTAINS_ANY_OR — `array-contains-any` on a searchTxt field.
 *    That operator is OR: "red dranzer" matches anything containing either word,
 *    which reads as "search doesn't filter". Firestore allows one array operator
 *    per query, so the correct shape is a single `array-contains` on the most
 *    selective term with the rest AND-refined in memory.
 *
 * R2 EMPTY_FILTER_BRANCH — an `if` whose body is only a comment inside a
 *    filter-building block. This is how "search + categoriesIn" dropped BOTH
 *    filters and returned an unrelated superset, silently. An unsupported
 *    combination must pick one and refine the other, or fail loudly — never
 *    quietly emit neither.
 *
 * Suppression: `// audit-search-semantics-ok: <reason>` on the line or the line
 * above. Reserve it for a genuinely different query shape, not for restoring
 * either bug.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = process.cwd();
const SCAN_ROOTS = [join(REPO_ROOT, "appkit", "src"), join(REPO_ROOT, "src")];
const EXCLUDED_DIRS = new Set([
  "node_modules", "dist", ".next", "out", "__tests__", "__mocks__",
]);

const OK_RE = /\/\/\s*audit-search-semantics-ok\s*:/i;

/** Array fields that back partial-match search. */
const SEARCH_FIELDS = /(SEARCH_TXT|["'`]searchTxt["'`])/;

function* walk(root) {
  let entries;
  try { entries = readdirSync(root, { withFileTypes: true }); }
  catch { return; }
  for (const e of entries) {
    if (EXCLUDED_DIRS.has(e.name)) continue;
    const full = join(root, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith(".d.ts")) yield full;
  }
}

const violations = [];
let scanned = 0;

for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    if (file === fileURLToPath(import.meta.url)) continue;
    let src;
    try { src = readFileSync(file, "utf8"); } catch { continue; }
    if (!src.includes("searchTxt") && !src.includes("SEARCH_TXT")) continue;
    scanned += 1;

    const lines = src.split(/\r?\n/);
    const rel = relative(REPO_ROOT, file);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const suppressed = OK_RE.test(line) || (i > 0 && OK_RE.test(lines[i - 1]));
      if (suppressed) continue;

      // R1 — OR semantics on a search field.
      if (line.includes("array-contains-any") && SEARCH_FIELDS.test(line)) {
        violations.push({
          rule: "ARRAY_CONTAINS_ANY_OR",
          file: rel,
          line: i + 1,
          snippet: line.trim().slice(0, 120),
          why: "array-contains-any is OR — use one array-contains on the most selective term and AND-refine the rest",
        });
      }

      // R2 — `if (...) { <comment only> }` in a block that builds search filters.
      const opensIf = /^\s*(?:\}\s*else\s+)?if\s*\(.*\)\s*\{\s*$/.test(line);
      if (opensIf && /search|Search/.test(line)) {
        // Walk until the line that CLOSES this branch — any line starting with
        // `}`, which covers both a bare `}` and `} else if (…) {`.
        //
        // Two wrong versions of this walk were written before this one, and
        // each failed against a real shape:
        //   - a fixed 12-line window missed a branch that opens with a long
        //     explanatory comment (false positive on the correct code);
        //   - brace-DEPTH counting ran straight past `} else if (…) {`, whose
        //     braces net to zero, and swept up the next branch's statements
        //     (false negative on the actual bug).
        // Breaking on a leading `}` handles both. A nested block inside the
        // branch ends the walk early, which is safe: the walk then sees a
        // non-comment line and correctly reports nothing.
        const body = [];
        for (let j = i + 1; j < lines.length; j++) {
          const t = lines[j].trim();
          if (t.startsWith("}")) break;
          if (t !== "") body.push(t);
        }
        // Only comment lines and nothing else = the branch emits no clause.
        const isComment = (b) => b.startsWith("//") || b.startsWith("*") || b.startsWith("/*");
        const allComments = body.length > 0 && body.every(isComment);
        if (allComments) {
          violations.push({
            rule: "EMPTY_FILTER_BRANCH",
            file: rel,
            line: i + 1,
            snippet: line.trim().slice(0, 120),
            why: "branch emits no clause — an unsupported combination must pick one filter and refine the other, or fail loudly",
          });
        }
      }
    }
  }
}

if (violations.length > 0) {
  console.error(`audit-search-semantics: ${violations.length} violation(s) across ${scanned} file(s).`);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`      ${v.snippet}`);
    console.error(`      → ${v.why}`);
  }
  console.error("\nSuppress a genuine exception with: // audit-search-semantics-ok: <reason>");
  process.exit(1);
}

console.log(`audit-search-semantics: clean ✓ (${scanned} file(s) with searchTxt queries)`);
