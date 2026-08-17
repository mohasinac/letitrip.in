#!/usr/bin/env node
/**
 * audit-raw-sticky-toolbar.mjs — strict-zero.
 *
 * `<StickyToolbar>` (appkit/src/ui/components/StickyToolbar.tsx) is the one
 * primitive for the recurrent "sticky bar under the header" pattern —
 * offset resolution, translucent/border/padding tone, and (as of Phase 7,
 * 2026-08-17) the dismiss/collapse control that closes the mobile-overlap
 * complaint hand-rolled copies never had. This audit blocks any `className`
 * combining `sticky` with a `top-[` arbitrary-value offset outside
 * StickyToolbar.tsx itself, so a new hand-rolled copy can't reintroduce the
 * duplication this session consolidated (27 near-identical call sites into
 * one primitive).
 *
 * Suppression: `// audit-raw-sticky-toolbar-ok: <reason>` on the same line
 * — reserved for a genuinely different sticky pattern (e.g. a sticky
 * element with no header-offset/translucency concern at all, like a sticky
 * table header cell).
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const SKIP_DIRS = new Set(["node_modules", "dist", ".next", "__tests__"]);
const PRIMITIVE_FILE = join("ui", "components", "StickyToolbar.tsx");

// Matches `className="...sticky...top-[...]..."` or the template-literal
// equivalent — `sticky` and a `top-[` arbitrary value co-occurring in the
// same className expression, in either order, on one line (every known
// instance of this pattern is single-line).
const PATTERN = /className=(?:\{[^}]*`|["'`])[^"'`]*\bsticky\b[^"'`]*top-\[[^"'`]*["'`}]/;
const PATTERN_REVERSED = /className=(?:\{[^}]*`|["'`])[^"'`]*top-\[[^"'`]*\bsticky\b[^"'`]*["'`}]/;

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

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    if (file.endsWith(PRIMITIVE_FILE)) continue;
    const src = readFileSync(file, "utf8");
    const lines = src.split("\n");
    lines.forEach((line, i) => {
      if (line.includes("audit-raw-sticky-toolbar-ok")) return;
      if (PATTERN.test(line) || PATTERN_REVERSED.test(line)) {
        violations.push(`${relative(ROOT, file)}:${i + 1}`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error("audit-raw-sticky-toolbar: FAILED — hand-rolled sticky-toolbar pattern found outside the primitive:\n");
  for (const v of violations) console.error(`  ✗ ${v}`);
  console.error(
    `\n${violations.length} violation(s). Use <StickyToolbar offset=... tone=... border padding=...> ` +
      `from @mohasinac/appkit/client instead, or suppress a genuinely different sticky pattern with ` +
      `// audit-raw-sticky-toolbar-ok: <reason>.`,
  );
  process.exit(1);
}

console.log("audit-raw-sticky-toolbar: clean ✓");
