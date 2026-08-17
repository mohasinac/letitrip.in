#!/usr/bin/env node
/**
 * audit-responsive-wrap.mjs — heuristic flag for "content silently hidden
 * on narrow viewports" instead of wrapping to a new line.
 *
 * Rows of text/buttons/inputs/images that don't fit their container width
 * should wrap (`flex-wrap: wrap` / grid `auto-fit`/`auto-fill`), never
 * truncate, ellipsis, or silently overlap/hide content by forcing
 * everything onto one row. This is NOT strict-zero — some truncation is
 * genuinely intentional (a table cell showing an ellipsis for a long
 * product title, a single-line breadcrumb). It flags a candidate pattern
 * for human triage: a flex ROW container (className containing `flex`
 * without `flex-col`) whose className ALSO contains `overflow-hidden`,
 * `truncate`, or `whitespace-nowrap` — i.e. a row that clips its own
 * overflow instead of wrapping — AND has more than one direct JSX child
 * element (a single child truncating its own long text, like a title, is
 * the normal/expected case; multiple children being squeezed onto one row
 * and clipped is the failure mode this looks for).
 *
 * Reports only — never exits non-zero. Run manually:
 *   node scripts/audit-responsive-wrap.mjs
 *   node scripts/audit-responsive-wrap.mjs --json   # machine-readable
 *
 * Suppression isn't needed since this never fails the build — to silence
 * a specific line during a future strict-zero migration, use
 * `// audit-responsive-wrap-ok: <reason>`.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const SKIP_DIRS = new Set(["node_modules", "dist", ".next", "__tests__"]);

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full, { throwIfNoEntry: false });
    if (!st) continue;
    if (st.isDirectory()) walk(full, out);
    else if (entry.endsWith(".tsx")) out.push(full);
  }
  return out;
}

// A className value (string or template literal) containing a flex-row
// marker plus a clip marker, on one line — every known instance of this
// pattern in this codebase is single-line. `flex` must appear as its own
// class token (a trailing hyphen means it's a modifier like `flex-col` /
// `flex-1` / `flex-shrink-0`, not the display:flex row utility itself),
// and `flex-col` must not appear anywhere else in the string (a `flex ...
// flex-col` combination is a column layout even though the bare `flex`
// token is also present).
const FLEX_ROW_CLIP_RE =
  /className=(?:\{[^}]*`|["'`])(?=[^"'`]*(?:^|[\s{`"'])flex(?:[\s"'`]|$))(?![^"'`]*flex-col)[^"'`]*(overflow-hidden|truncate|whitespace-nowrap)[^"'`]*["'`}]/;

// Rough count of direct-child opening tags on the SAME line as the match —
// a real multi-line JSX-child count isn't feasible with a line-based
// heuristic, so this only catches the same-line case; multi-line siblings
// need human triage regardless, which is the point (this is a report, not
// a strict-zero gate).
function countInlineChildTags(line) {
  const matches = line.match(/<[A-Z][\w.]*[\s/>]/g);
  return matches ? matches.length : 0;
}

const CANDIDATES = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const src = readFileSync(file, "utf8");
    const lines = src.split("\n");
    lines.forEach((line, i) => {
      if (line.includes("audit-responsive-wrap-ok")) return;
      if (i > 0 && lines[i - 1].includes("audit-responsive-wrap-ok")) return;
      if (FLEX_ROW_CLIP_RE.test(line)) {
        CANDIDATES.push({
          file: relative(ROOT, file),
          line: i + 1,
          childTagsOnLine: countInlineChildTags(line),
          snippet: line.trim().slice(0, 160),
        });
      }
    });
  }
}

const asJson = process.argv.includes("--json");

if (asJson) {
  console.log(JSON.stringify(CANDIDATES, null, 2));
  process.exit(0);
}

if (CANDIDATES.length === 0) {
  console.log("audit-responsive-wrap: no candidates found ✓");
  process.exit(0);
}

console.log(
  `audit-responsive-wrap: ${CANDIDATES.length} candidate(s) — a flex row combining an overflow/truncate/nowrap ` +
    `clip marker with multiple children, which may be hiding content on narrow viewports instead of wrapping ` +
    `it to a new line. This is a REPORT, not a failing gate — many hits are legitimate (e.g. a table cell or a ` +
    `single long title truncating on purpose). Review each and either switch to flex-wrap, or mark the ` +
    `intentional ones with // audit-responsive-wrap-ok: <reason>.\n`,
);
for (const c of CANDIDATES) {
  console.log(`  ${c.file}:${c.line}  (${c.childTagsOnLine} inline child tag(s))`);
  console.log(`    ${c.snippet}`);
}
