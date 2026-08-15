#!/usr/bin/env node
/**
 * audit-comma-hack-multiselect.mjs — catches an array-valued form field
 * faked with a comma-separated text input instead of a real multi-value
 * primitive (`<TagInput>` for free-text tags, `<PaginatedSelect multiple>`
 * for a bounded option set).
 *
 * Real-world instance (2026-08-15): the seller product form's `tags` field
 * was a `type="text"` FormField doing:
 *
 *   value={(values.tags ?? []).join(", ")}
 *   onChange={(v) => onChange({ tags: v.split(",").map(t => t.trim()).filter(Boolean) })}
 *
 * — no chip UI, no per-tag delete, no keyboard affordance; just a plain text
 * box the user has to hand-punctuate. `<TagInput value={string[]}
 * onChange={(tags: string[]) => void}>` already exists in the primitive
 * catalogue and is a straight drop-in replacement.
 *
 * Heuristic: a line containing `.split(",")` chained (same or next line)
 * with both `.map(` and `.filter(Boolean)` — the specific "parse a
 * comma-string back into an array" shape. A plain `.split(",")` used for
 * something else (e.g. parsing a non-form CSV value) won't match unless it
 * also chains through `.map(...).filter(Boolean)`, which is specific to the
 * "rebuild an array-of-strings form value" pattern.
 *
 * Excluded: a `multiple` token within the 6 lines above the match — that
 * marks the value as already flowing through a real `<PaginatedSelect
 * multiple>`/`<XInlineSelect multiple>` component, where split/join is a
 * legitimate array-to-CSV-string serialization boundary for storage, not a
 * raw-text stand-in for the multi-select UI itself (confirmed false-positive
 * shape found in AdminSectionsView.tsx's 3 `ProductInlineSelect multiple`
 * builders during the first run of this audit).
 *
 * Suppression: `// audit-comma-hack-multiselect-ok: <reason>` on the same
 * line or the line above, for genuine non-form CSV parsing.
 *
 * Strict zero.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "__tests__", "__mocks__"]);
const SKIP_FILE_RE = /\.(d\.ts|test\.tsx?|spec\.tsx?)$/;

const SUPPRESSION_RE = /audit-comma-hack-multiselect-ok:/;

function walk(dir, files = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (extname(entry.name) === ".tsx" && !SKIP_FILE_RE.test(entry.name)) files.push(full);
  }
  return files;
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.includes('split(",")')) continue;
      // Chained onto the same statement — check this line plus the next 2
      // (onChange handlers are frequently wrapped across a couple of lines).
      const window = [line, lines[i + 1] ?? "", lines[i + 2] ?? ""].join(" ");
      if (!window.includes(".map(") || !window.includes(".filter(Boolean)")) continue;
      if (SUPPRESSION_RE.test(line) || SUPPRESSION_RE.test(lines[i - 1] ?? "")) continue;
      const precedingWindow = lines.slice(Math.max(0, i - 6), i).join(" ");
      if (/\bmultiple\b/.test(precedingWindow)) continue;
      violations.push({
        file: relative(ROOT, file).replace(/\\/g, "/"),
        line: i + 1,
        text: line.trim().slice(0, 100),
      });
    }
  }
}

if (violations.length === 0) {
  console.log("audit-comma-hack-multiselect: clean ✓");
  process.exit(0);
}

console.error(`audit-comma-hack-multiselect: ${violations.length} comma-hack multiselect hit(s) found.\n`);
console.error(
  "A `.split(\",\").map(...).filter(Boolean)` chain rebuilding a form field's array value from a\n" +
    "comma-separated string is a plain-text stand-in for a real multi-value primitive. Use\n" +
    "<TagInput value={string[]} onChange={(tags) => ...}> for free-text tags, or\n" +
    "<PaginatedSelect multiple> for a bounded option set.\n",
);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  ${v.text}`);
}
process.exit(1);
