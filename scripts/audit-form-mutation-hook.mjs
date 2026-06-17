#!/usr/bin/env node
/**
 * audit-form-mutation-hook.mjs
 *
 * Strict-zero. Flags any source file that renders a `<Form>` JSX element
 * AND issues a raw `fetch(...)` call in the same file. The canonical
 * pattern (from Phase 12 of the Theme/Tokens/Variants refactor) is:
 *
 *   const mutation = useApiMutation({ mutationFn: (p) => apiClient.X(URL, p), ... });
 *   ...
 *   <Form onSubmit={(e) => e.preventDefault()}>
 *     <Button onClick={() => mutation.mutate(payload)}>Save</Button>
 *   </Form>
 *
 * Raw `fetch()` calls in form-submit handlers bypass the unified error /
 * loading-state plumbing in `useApiMutation` + `apiClient`.
 *
 * Allowed exception: a per-line `// audit-form-mutation-hook-ok: <reason>`
 * marker on the line above or the same line as the `fetch(` call. Reserve
 * for non-form-submit fetches (CSV downloads, binary blobs, etc.).
 *
 * Scope: `src/**` + `appkit/src/**`, excluding the test/mock dirs.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "__tests__",
  "__mocks__",
  "scripts",
  "seed",
]);

const FORM_RE = /<Form\b/;
const FETCH_TEST_RE = /\bfetch\s*\(/;
const FETCH_ALL_RE = /\bfetch\s*\(/g;
const MARKER_RE = /audit-form-mutation-hook-ok/;

function walk(dir, files = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) { walk(full, files); continue; }
    if (!e.name.endsWith(".tsx")) continue;
    files.push(full);
  }
  return files;
}

const violations = [];
for (const root of SCAN_DIRS) {
  for (const file of walk(root)) {
    const text = readFileSync(file, "utf8");
    if (!FORM_RE.test(text)) continue;
    if (!FETCH_TEST_RE.test(text)) continue;
    const lines = text.split("\n");
    for (const match of text.matchAll(FETCH_ALL_RE)) {
      const before = text.slice(0, match.index ?? 0);
      const lineIdx = before.split("\n").length - 1;
      const hasMarker =
        MARKER_RE.test(lines[lineIdx]) ||
        (lineIdx > 0 && MARKER_RE.test(lines[lineIdx - 1]));
      if (hasMarker) continue;
      violations.push({
        file: relative(ROOT, file).replace(/\\/g, "/"),
        line: lineIdx + 1,
        snippet: lines[lineIdx]?.trim().slice(0, 80) ?? "",
      });
    }
  }
}

if (violations.length === 0) {
  console.log("audit-form-mutation-hook: clean ✓");
  process.exit(0);
}

console.error(
  `audit-form-mutation-hook: STRICT-ZERO violation(s) — ${violations.length} raw fetch() call(s) in <Form>-rendering file(s).\n`,
);
console.error(
  "Replace each with apiClient.X() inside a useApiMutation block.\n" +
    "Suppress with `// audit-form-mutation-hook-ok: <reason>` only for genuine non-form fetches (CSV blob downloads etc).\n",
);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  ${v.snippet}`);
}
process.exit(1);
