#!/usr/bin/env node
/**
 * audit-hover-reveal-pointer-events — catches the exact bug class root-caused
 * 2026-08-20: an element hidden via `opacity-0` and revealed via
 * `group-hover:opacity-100` (or `hover:opacity-100`) stays fully interactive
 * while invisible — opacity alone does not remove an element from hit-testing.
 * `:hover` never fires on touch devices, so on mobile the element is
 * permanently invisible but still sits in the DOM intercepting taps. For
 * `BaseListingCard.Checkbox` specifically (a real `<button>` that calls
 * `e.stopPropagation()`), this silently swallowed the tap meant to open the
 * card's side panel/drawer — "cards don't open on mobile" with no visible
 * cause, since the blocking element was never seen.
 *
 * Rule HOVER_REVEAL_MISSING_POINTER_EVENTS (hard-fail, strict zero) — any
 * className string containing `opacity-0` and `group-hover:opacity-100` (or
 * `hover:opacity-100`) must also contain `pointer-events-none` in the same
 * string (so the hidden state is never interactive) — and if it also
 * contains `pointer-events-none`, must additionally restore interactivity on
 * reveal via `group-hover:pointer-events-auto` / `hover:pointer-events-auto`
 * UNLESS the element has no interactive purpose of its own (a purely
 * decorative overlay never needs pointer-events restored — only elements
 * that are themselves clickable, like BaseListingCard.Checkbox, do). Since a
 * static audit can't reliably tell "decorative" from "interactive" apart,
 * this rule only requires the unconditional half (`pointer-events-none`
 * present) — that alone is what prevents the mobile tap-swallowing bug
 * regardless of whether reveal-on-hover interactivity is also restored.
 *
 * Suppression: `// audit-hover-reveal-ok: <reason>` on the same line or the
 * line above, for the rare legitimate case (e.g. an element that must stay
 * hit-testable even while visually hidden, such as an accessibility-only
 * focus target).
 *
 * Exits 1 on any violation.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_DIRS = [join(ROOT, "appkit", "src"), join(ROOT, "src")];

const SUPPRESS_RE = /audit-hover-reveal-ok:/;
const REVEAL_RE = /opacity-0[^"'`]*?(?:group-hover:opacity-100|hover:opacity-100)|(?:group-hover:opacity-100|hover:opacity-100)[^"'`]*?opacity-0/;
const POINTER_EVENTS_NONE_RE = /pointer-events-none/;

function walkFiles(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out);
    } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
      out.push(full);
    }
  }
}

const files = [];
for (const dir of SCAN_DIRS) walkFiles(dir, files);

const violations = [];

for (const file of files) {
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const lines = src.split("\n");

  // Scan for className-ish string literals/template strings spanning one or
  // a few lines — most call sites in this codebase keep the whole
  // opacity-0/group-hover pair within a single quoted string, so a per-line
  // check with a 1-line lookback covers both single-line and the common
  // "ternary across 2 lines" shape found during the initial 2026-08-20 sweep.
  for (let i = 0; i < lines.length; i++) {
    const windowText = lines.slice(Math.max(0, i - 1), i + 1).join("\n");
    if (!REVEAL_RE.test(windowText)) continue;
    if (POINTER_EVENTS_NONE_RE.test(windowText)) continue;
    const suppressWindow = lines.slice(Math.max(0, i - 1), i + 1).join("\n");
    if (SUPPRESS_RE.test(suppressWindow)) continue;
    violations.push({ file: relative(ROOT, file), line: i + 1, text: lines[i].trim() });
  }
}

// Dedupe violations that the sliding window would otherwise report twice
// (once when the reveal pattern starts on line N, again when the window
// including N+1 also matches).
const seen = new Set();
const deduped = violations.filter((v) => {
  const key = `${v.file}:${v.line}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

if (deduped.length > 0) {
  console.log(`\naudit-hover-reveal-pointer-events: ${deduped.length} HOVER_REVEAL_MISSING_POINTER_EVENTS violation(s) — FAIL\n`);
  for (const v of deduped) {
    console.log(`  🔴 ${v.file}:${v.line}`);
    console.log(`     ${v.text}`);
  }
  console.log(
    "\nFix: add `pointer-events-none` to the same className string as\n" +
    "     `opacity-0` — a hover-revealed element must not be clickable/\n" +
    "     tappable while invisible (touch devices never fire :hover, so the\n" +
    "     element stays permanently invisible-but-interactive on mobile,\n" +
    "     silently swallowing taps meant for whatever is underneath it).\n" +
    "     If the element is itself meant to become clickable once revealed\n" +
    "     (e.g. BaseListingCard.Checkbox), also add\n" +
    "     `group-hover:pointer-events-auto` / `hover:pointer-events-auto`.\n" +
    "     Genuine exceptions: `// audit-hover-reveal-ok: <reason>`.\n"
  );
  process.exit(1);
}

console.log("audit-hover-reveal-pointer-events: clean.\n");
process.exit(0);
