#!/usr/bin/env node
/**
 * audit-centred-scroller — `justify-center` on a horizontal flex SCROLLER makes
 * its leading items permanently unreachable.
 *
 * Strict zero. Suppression: `// audit-centred-scroller-ok: <reason>`.
 *
 * ── The defect ─────────────────────────────────────────────────────────────
 * When flex content overflows a `justify-content: center` container, the
 * overflow is distributed to BOTH ends. The trailing half can be scrolled to;
 * the leading half CANNOT, because `scrollLeft` is clamped at 0 and there is no
 * negative scroll position. The items are not clipped-but-reachable — they are
 * gone.
 *
 * Measured on the main navbar at a 1024px viewport (2026-10-15), before the fix:
 *
 *     scrollWidth 1245  clientWidth 990  scrollLeft 0  maxScroll 255
 *     "Home"      x = -238   →  still -238 after scrolling fully left
 *     "Products"  x = -148   →  still -148
 *
 * i.e. the site's two most important links were unreachable at the commonest
 * laptop width. The navbar even ships left/right chevrons for this case, and
 * they could not help: `canScrollLeft` is derived from `scrollLeft > 0`, which
 * is pinned at 0, so the control built for the problem was disabled BY the
 * problem.
 *
 * ── Why an audit and not a code review note ────────────────────────────────
 * It is invisible at most widths. The row fits on a wide monitor (centred, no
 * overflow, looks deliberate) and collapses to a different layout on mobile.
 * It only misbehaves in the band where the content overflows but the breakpoint
 * has not changed — which is exactly the band nobody tests, and nothing errors.
 *
 * ── The fix ────────────────────────────────────────────────────────────────
 * `justify-content: safe center` — centre while it fits, fall back to `start`
 * the moment it would overflow. In Tailwind: `justify-[safe_center]`.
 *
 * `safe` is the whole point: a plain `justify-start` would also be correct but
 * loses the centring on the wide screens where it is wanted.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const SUPPRESS = "audit-centred-scroller-ok";
const SCAN_DIRS = ["appkit/src", "src"];
const SKIP_DIRS = new Set(["node_modules", "dist", ".next", "__tests__"]);

/** Horizontal scrolling is opted into with one of these. */
const SCROLLER = /\boverflow-x-(?:auto|scroll)\b|\boverflow="x-auto"|\boverflow="x-scroll"/;
/** Unsafe centring — `justify-[safe_center]` and `justify-center-safe` are fine. */
const UNSAFE_CENTER = /\bjustify-center(?!-safe)\b|\bjustify-\[center\]/;

function collectFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (SKIP_DIRS.has(e.name)) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(tsx|jsx)$/.test(e.name)) out.push(p);
    }
  })(dir);
  return out;
}

/**
 * Both signals must be on the SAME element, so the search window is one JSX
 * opening tag rather than one line — `className` is routinely split across
 * several lines, and a line-scoped rule would miss every multi-line tag.
 *
 * 🛑 It is NOT enough for both strings to appear in the same file: a centred
 * header beside an unrelated scroller is correct code, and reporting it is how
 * an audit earns a blanket suppression.
 */
function openingTags(src) {
  const tags = [];
  const re = /<[A-Za-z][A-Za-z0-9.]*\s/g;
  let m;
  while ((m = re.exec(src))) {
    let i = m.index;
    let depth = 0;
    let quote = null;
    for (; i < src.length; i++) {
      const c = src[i];
      if (quote) {
        if (c === "\\") i++;
        else if (c === quote) quote = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") {
        quote = c;
        continue;
      }
      if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0) break;
    }
    tags.push({ start: m.index, text: src.slice(m.index, i + 1) });
    re.lastIndex = i;
  }
  return tags;
}

function main() {
  const violations = [];
  for (const dir of SCAN_DIRS) {
    for (const file of collectFiles(path.join(ROOT, dir))) {
      const src = fs.readFileSync(file, "utf8");
      if (!SCROLLER.test(src) || !UNSAFE_CENTER.test(src)) continue; // cheap reject
      const lines = src.split(/\r?\n/);
      for (const tag of openingTags(src)) {
        if (!SCROLLER.test(tag.text) || !UNSAFE_CENTER.test(tag.text)) continue;
        const line = src.slice(0, tag.start).split(/\r?\n/).length;
        const window = lines.slice(Math.max(0, line - 7), line).join("\n");
        if (window.includes(SUPPRESS) || tag.text.includes(SUPPRESS)) continue;
        violations.push({
          file: path.relative(ROOT, file).replace(/\\/g, "/"),
          line,
          snippet: tag.text.replace(/\s+/g, " ").slice(0, 110),
        });
      }
    }
  }

  if (violations.length === 0) {
    console.log("[audit-centred-scroller] clean ✓ — no centred horizontal scrollers.");
    return 0;
  }

  console.error(
    `[audit-centred-scroller] ${violations.length} centred horizontal scroller(s):\n`,
  );
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}`);
    console.error(`      ${v.snippet}`);
  }
  console.error(
    `\n  A centred flex container splits its overflow across BOTH ends, and the\n` +
      `  leading half cannot be scrolled to — scrollLeft stops at 0. Those items\n` +
      `  are unreachable, not merely clipped.\n` +
      `  Fix: \`justify-[safe_center]\` — centres while it fits, falls back to\n` +
      `  start the moment it would overflow.\n` +
      `  Genuine exception: \`// ${SUPPRESS}: <reason>\`.`,
  );
  return 1;
}

process.exit(main());
