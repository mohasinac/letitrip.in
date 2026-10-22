#!/usr/bin/env node
/**
 * audit-redundant-grid-base.mjs — a base `grid-cols-1` / `col-span-1` sitting
 * beside a breakpoint-prefixed override is a cross-chunk cascade race.
 *
 * ## The defect, measured in production 2026-10-22
 *
 * `/faqs` rendered its category sidebar stacked ABOVE the FAQ list at every
 * width. The reported diagnosis was "the `lg:` variants are not applying", and
 * that was wrong: `lg:hidden` hid the mobile strip and `lg:block` showed the
 * sidebar, both confirmed by computed style at 1280px. The one variant that did
 * not apply was `lg:grid-cols-12`, and what beat it was the `grid-cols-1`
 * sitting in the same `className`.
 *
 * Both are `!important` utilities in `@layer utilities` with equal specificity,
 * so neither layer order nor specificity decides between them — **emission
 * order** does. And the page loads TWO stylesheet chunks:
 *
 *   052xia3bg2w69.css  (1st)  .grid-cols-1 @242690   .lg\:grid-cols-12 @369133
 *   1mi5wbondtzo9.css  (2nd)  .grid-cols-1 @40088    .lg\:grid-cols-12 ABSENT
 *
 * The override exists in the first chunk only, while the base exists in both —
 * so chunk 2's `.grid-cols-1` is later in document order and wins at every
 * viewport width. The grid computed `984px 0px ×8`: NINE tracks, because the
 * children's `span 3` / `span 9` created eight implicit columns inside a
 * one-track grid. Deleting the base class took it to twelve equal 74px tracks,
 * verified live; at 800px it stays one track with the sidebar hidden.
 *
 * `src/app/globals.css` already warns that Turbopack chunk-splitting makes
 * "later wins" non-deterministic across chunks. This is that warning happening.
 * Root Cause #79 is the same mechanism between two hover classes in one file,
 * and its conclusion applies here verbatim: **delete the competitor, never add
 * a third rule.**
 *
 * ## Why only `-1`
 *
 * Scoped to a base of exactly `1` because that is the case where the base
 * class is nearly redundant — a `display:grid` box with no
 * `grid-template-columns` already lays out in a single column. A ladder like
 * `grid-cols-2 md:grid-cols-4` is the intended Tailwind idiom and is NOT
 * flagged: both halves are load-bearing, and the only real fix there is a
 * single-class preset, which is a design decision rather than a cleanup.
 *
 * 🛑 "Nearly" is doing work in that sentence, and it is why this is a RATCHET
 * rather than strict zero. `grid-cols-1` is `repeat(1, minmax(0, 1fr))`, while
 * an implicit track is `auto` — so a child with wide unbreakable content (a
 * long token, a table, a `white-space: nowrap` row) can grow an implicit track
 * past the container where `minmax(0,1fr)` would have clamped it. Removing the
 * base class is therefore safe *per layout*, verified by looking, and not
 * safely bulk-appliable. The FAQ fix was confirmed in a real browser at 1280px
 * and 800px before it was written.
 *
 * ## The ratchet
 *
 * `KNOWN` lists the sites that existed when the rule was written. They do not
 * fail; a NEW one does. Removing an entry is the goal, and each removal wants
 * one visual check of that layout at its breakpoints.
 *
 * 🛑 Seeded from a run of THIS rule, never from the grep used while designing
 * it (Root Cause #84 — `listing-delegation` was seeded from a hand grep that
 * found 45 where the rule found 61).
 *
 * The migration target, where the proportions allow it, is a single-class
 * preset — `<Grid cols="sidebar">` and friends in `Layout.style.css` are one
 * declaration block with the media query INSIDE, so they cannot be split
 * across chunks at all. `cols="sidebar"` was not used for `/faqs` because it
 * is `280px 1fr` while that layout is 4/12 · 8/12, and adopting it would have
 * silently narrowed the sidebar.
 *
 * `MIGRATE=strict` fails everything.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const STRICT = process.env.MIGRATE === "strict";

/** Known at introduction, 2026-10-22. May only shrink. */
const KNOWN = new Set([
  "appkit/src/features/about/components/TrackOrderView.tsx",
  "appkit/src/features/admin/components/AdminAdEditorView.tsx",
  "appkit/src/features/admin/components/AdminFilterBar.tsx",
  "appkit/src/features/admin/components/AdminSectionsView.tsx",
  "appkit/src/features/categories/components/BundleDetailView.tsx",
  "appkit/src/features/categories/components/BundleDynamicRuleEditor.tsx",
  "appkit/src/features/corporate/components/CorporateInquiryForm.tsx",
  "appkit/src/features/events/components/AdminEventEntriesView.tsx",
  "appkit/src/features/faq/components/ContactCTA.tsx",
  "appkit/src/features/homepage/components/HowItWorksSection.tsx",
  "appkit/src/features/homepage/components/PromoGrid.tsx",
  "appkit/src/features/homepage/components/WelcomeSection.tsx",
  "appkit/src/features/layout/FooterLayout.tsx",
  "appkit/src/features/media/upload/MediaUploadList.tsx",
  "appkit/src/features/scams/components/ScamAwarenessModal.tsx",
  "appkit/src/features/stores/components/StoreGuideHubView.tsx",
  "appkit/src/ui/components/Form.tsx",
  "src/app/[locale]/store/analytics/page.tsx",
  "src/components/user/ProfileActivityPanel.tsx",
]);

const SCAN_DIRS = ["src", "appkit/src"];
const BP = "(?:sm|md|lg|xl|2xl)";

/**
 * One regex over a whole class STRING, not per line — a className can wrap, and
 * both halves of the pair have to be seen together to make the finding.
 *
 * 🛑 Matches the string literal rather than walking JSX attributes, because
 * this codebase's dominant idiom for long class lists includes module-scope
 * `const` maps and template literals, and a `className=`-only walk misses
 * them — the blind spot a negative control exposed in `audit-dead-css-classes`
 * (Root Cause #106).
 */
const PAIR_RE = new RegExp(
  `"[^"]*\\b(grid-cols-1|col-span-1)\\b[^"]*\\b${BP}:(?:grid-cols|col-span)-\\d+[^"]*"` +
    `|"[^"]*\\b${BP}:(?:grid-cols|col-span)-\\d+\\b[^"]*\\b(?:grid-cols-1|col-span-1)\\b[^"]*"`,
  "g",
);

/**
 * Comments are stripped FIRST, line positions preserved.
 *
 * The rule's own first run fired on Layout.tsx:20 and :545, which are the
 * JSDoc examples DOCUMENTING THIS VERY ANTI-PATTERN ("Use instead of
 * <div className=grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4>").
 * An audit that flags the note explaining the problem is the
 * curly-brace-in-a-comment trap one audit over, and it is how a rule earns a
 * reputation for noise. Caught by running the rule and reading what it
 * pointed at, not by reasoning about it.
 */
/** CRLF-safe, and no regex literal to be mangled by a patch script. */
function splitLines(src) {
  return src.split("\n").map((l) => (l.endsWith("\r") ? l.slice(0, -1) : l));
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/^\s*\/\/.*$/gm, (m) => m.replace(/[^\n]/g, " "));
}

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next" || e.name === "dist") continue;
      out.push(...walk(full));
    } else if (e.name.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

const blocking = [];
const staged = [];

for (const d of SCAN_DIRS) {
  for (const file of walk(join(ROOT, d))) {
    const rel = relative(ROOT, file).split(sep).join("/");
    const lines = splitLines(stripComments(readFileSync(file, "utf8")));
    lines.forEach((line, i) => {
      PAIR_RE.lastIndex = 0;
      const m = PAIR_RE.exec(line);
      if (!m) return;
      const hit = {
        file: rel,
        line: i + 1,
        snippet: m[0].slice(0, 110),
      };
      if (!STRICT && KNOWN.has(rel)) staged.push(hit);
      else blocking.push(hit);
    });
  }
}

/*
 * 🛑 A KNOWN entry that no longer matches is reported, so the ratchet shrinks
 * deliberately rather than rotting. A list that quietly keeps names for files
 * that were already fixed reads as a bigger backlog than exists — which is
 * exactly how `unvalidated-request-body`'s "19 awaiting migration" turned out
 * to be partly fiction.
 */
const stillMatching = new Set(staged.map((s) => s.file));
const cleared = [...KNOWN].filter((f) => !stillMatching.has(f)).sort();

if (blocking.length > 0) {
  console.error(`[audit-redundant-grid-base] FAIL: ${blocking.length} new violation(s).\n`);
  for (const v of blocking) {
    console.error(`  ${v.file}:${v.line}`);
    console.error(`      ${v.snippet}`);
    console.error(
      "      A base `grid-cols-1`/`col-span-1` beside a breakpoint override is decided by\n" +
        "      CSS EMISSION ORDER, and the two classes can land in different Turbopack\n" +
        "      chunks — measured on /faqs, where the base won at every width and the grid\n" +
        "      computed nine tracks instead of twelve. Delete the base class (it is what a\n" +
        "      grid does with no grid-template-columns anyway), or move the whole ladder\n" +
        "      into one `Layout.style.css` preset so there is nothing to race.\n",
    );
  }
  if (cleared.length > 0) {
    console.error(`  Also: ${cleared.length} KNOWN entr(y/ies) no longer match — remove them:`);
    for (const f of cleared) console.error(`    - ${f}`);
  }
  process.exit(1);
}

let msg = `[audit-redundant-grid-base] OK: 0 new violations (${staged.length} staged across ${stillMatching.size} known file(s)).`;
if (cleared.length > 0) {
  msg +=
    `\n  ${cleared.length} KNOWN entr(y/ies) no longer match and should be removed from the ratchet:` +
    cleared.map((f) => `\n    - ${f}`).join("");
}
console.log(msg);
