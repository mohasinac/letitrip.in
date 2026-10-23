#!/usr/bin/env node
/**
 * audit-typography.mjs — Enforce appkit Typography primitives
 *
 * Catches raw HTML elements that should use appkit primitives:
 *   <ANY className="text-sm/font-bold/text-zinc-*"> → use appkit <Text>, <Span>, <Heading>, <Button>
 *   <strong> / <b>                  → <Span weight="bold">
 *   <p className="...">             → <Text>
 *   <h1>...<h6>                     → <Heading level={N}>
 *   <em>                            → <Span className="italic">
 *   <small>                         → <Caption> or <Text size="xs">
 *   <button>                        → <Button> (appkit primitive)
 *
 * Baseline mode: violations at or below baseline pass; regressions block.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { stripComments } from "./lib/strip-comments.mjs";
import { join, relative } from "path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const DIRS = [
  join(ROOT, "appkit", "src"),
  join(ROOT, "src"),
];

const IGNORE_DIRS = ["node_modules", ".next", "dist", "__tests__", "scripts"];
const EXTENSIONS = [".tsx", ".jsx"];

// Files where raw HTML is acceptable (rich text renderers, markdown, etc.)
const ALLOWLIST = [];

// File-name patterns where raw HTML is acceptable (internal documentation)
const ALLOWLIST_PATTERNS = [];

/*
 * ── The primitive layer ──────────────────────────────────────────────────────
 *
 * 🛑 These rules all say "use appkit <X>", which cannot coherently be asked of
 * the file that DEFINES <X>. `Button.tsx` has to render a native `<button>`;
 * `Semantic.tsx` has to render a native `<table>`; `FallbackShell.tsx` exists
 * precisely to avoid every primitive (Root Cause #32 — it is the crash
 * boundary, so it must render with no Tailwind context at all).
 *
 * The list is CLAUDE.md's own, from § "Theme / Tokens / Variants Architecture":
 * *"Primitive source directories … own the underlying CSS — that's the only
 * place raw utility classes / inline styles are allowed."* `ui/**` is used
 * rather than the three `ui/*` subdirectories it names, because `DataTable.tsx`
 * sits directly in `ui/` and is unambiguously the `<Table>` primitive.
 *
 * 🛑 This is NOT the emptied allowlist coming back. That was a per-FILE list of
 * ordinary feature components with no stated reason, and draining it was right.
 * This is a layer boundary with a reason that holds for every file inside it.
 *
 * Measured when added: 51 of the 64 raw `<button>` sites, 3 of 20 `<p>` and
 * 4 of 5 `<table>` are inside it.
 */
const PRIMITIVE_DIRS = [
  "appkit/src/ui/",
  "appkit/src/features/email/",
  "appkit/src/features/media/",
  "appkit/src/_internal/client/",
];

/*
 * Email bodies are raw HTML by necessity — an email client renders neither our
 * primitives nor our stylesheet, so `<p>` and `<table>` are the only layout
 * available. `features/email/` above is the primitive set; this is the file
 * that composes real messages with them.
 */
const RAW_HTML_FILES = ["appkit/src/features/contact/email.tsx"];

function isExempt(rel) {
  return (
    PRIMITIVE_DIRS.some((d) => rel.startsWith(d)) || RAW_HTML_FILES.includes(rel)
  );
}

/*
 * ── Ratchet ──────────────────────────────────────────────────────────────────
 *
 * What remains outside the primitive layer once the regexes below actually
 * match. A ratchet, not a baseline: every entry is named, the list may only
 * shrink, and a NEW site fails the build (CLAUDE.md § "Staged audits — a
 * ratchet is not a baseline"). `MIGRATE=strict` fails these too.
 *
 * All nine `<button>` entries are layout chrome that should be `<Button>` or
 * `<IconButton>` — the hamburger, the sidebar backdrop, the bottom-nav items.
 * They are not converted here because each one carries bespoke positioning CSS
 * that `.appkit-button`'s `min-height` would fight under `important: true`
 * (Root Cause #80), and getting that wrong breaks navigation on every page.
 */
const RATCHET = new Set([
  "RAW_BUTTON appkit/src/features/layout/AppLayoutShell.tsx:213",
  "RAW_BUTTON appkit/src/features/layout/AppLayoutShell.tsx:419",
  "RAW_BUTTON appkit/src/features/layout/AppLayoutShell.tsx:530",
  "RAW_BUTTON appkit/src/features/layout/AppLayoutShell.tsx:555",
  "RAW_BUTTON appkit/src/features/layout/AppLayoutShell.tsx:842",
  "RAW_BUTTON appkit/src/features/layout/AppLayoutShell.tsx:852",
  "RAW_BUTTON appkit/src/features/layout/BottomNavbar.tsx:298",
  "RAW_BUTTON appkit/src/features/layout/BottomNavbar.tsx:409",
  "RAW_BUTTON appkit/src/features/layout/MainNavbar.tsx:79",
]);
/*
 * 🛑 A tenth entry — `RAW_EM AdminBlogEditorView.tsx:530` — was in this list
 * for about a minute and was WRONG. My survey script applied the corrected
 * regex but not `isInsideString` below, and that line is
 * `html={draft.content || "<em>No content yet…</em>"}` — a string literal the
 * audit already skips. The stale-entry report above is what caught it on the
 * first run.
 *
 * Generating a ratchet from a run of the rule protects you from typing the
 * list wrong; it does not protect you from a SURVEY that is not the rule
 * (CLAUDE.md Recurrent Root Cause #84, both directions).
 */

const STRICT = process.env.MIGRATE === "strict";

// ── Patterns ─────────────────────────────────────────────────────────────────
// Each rule: { id, label, regex, baseline }
// regex runs per-line on TSX source (outside comments/strings is best-effort)

const TYPOGRAPHY_CLASSES = "text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)|font-(?:normal|medium|semibold|bold|extrabold|black|light|thin)|text-(?:zinc|slate|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)";

const RULES = [
  // ── Catch-all: ANY lowercase HTML element with typography/color classes ────
  {
    id: "HTML_TYPOGRAPHY_CLASSES",
    label: "Raw HTML element with typography/color classes (use appkit <Text>, <Span>, <Heading>, <Button>)",
    regex: new RegExp(`<(?!svg|img|iframe|input|select|option|textarea|video|audio|source|track|details|summary|hr|code|pre)[a-z][a-z0-9]*\\s[^>]*className[^>]*(?:${TYPOGRAPHY_CLASSES})`),
  },
  {
    id: "APPKIT_SPAN_RAW_CLASSES",
    label: "Appkit <Span> using raw Tailwind size/weight classes in className instead of size/weight props",
    regex: /(<Span\s[^>]*className\s*=\s*["'{][^"'>]*(text-(?:xs|sm|base|lg|xl)\b|font-(?:normal|medium|semibold|bold)))/,
  },
  {
    id: "RAW_STRONG",
    label: "Raw <strong> (use <Span weight=\"bold\"> or <Span weight=\"semibold\">)",
    regex: /<strong\b/,
  },
  {
    id: "RAW_P_TAG",
    label: "Raw <p> tag (use <Text>)",
    regex: /<p\s+className/,
  },
  {
    id: "RAW_HEADING",
    label: "Raw <h1>-<h6> (use <Heading level={N}>)",
    regex: /<h[1-6]\b/,
  },
  {
    id: "RAW_SMALL",
    label: "Raw <small> (use <Caption> or <Text size=\"xs\">)",
    regex: /<small\b/,
  },
  {
    id: "RAW_B_TAG",
    label: "Raw <b> (use <Span weight=\"bold\">)",
    regex: /<b\b/,
  },
  {
    id: "RAW_EM",
    label: "Raw <em> (use <Span className=\"italic\">)",
    regex: /<em\b/,
  },
  {
    id: "RAW_BUTTON",
    label: "Raw <button> (use appkit <Button>)",
    regex: /<button\b/,
  },
];

// ── Scanner ──────────────────────────────────────────────────────────────────

function walkFiles(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (IGNORE_DIRS.includes(entry)) continue;
    const stat = statSync(full, { throwIfNoEntry: false });
    if (!stat) continue;
    if (stat.isDirectory()) {
      results.push(...walkFiles(full));
    } else if (EXTENSIONS.some(ext => entry.endsWith(ext))) {
      if (ALLOWLIST.includes(entry)) continue;
      if (ALLOWLIST_PATTERNS.some(rx => rx.test(entry))) continue;
      results.push(full);
    }
  }
  return results;
}

function isInsideComment(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*");
}

function isInsideString(line, matchIndex) {
  // Rough heuristic: if the match is inside a template literal or string
  const before = line.slice(0, matchIndex);
  const singleQuotes = (before.match(/'/g) || []).length;
  const doubleQuotes = (before.match(/"/g) || []).length;
  const backticks = (before.match(/`/g) || []).length;
  return (singleQuotes % 2 !== 0) || (doubleQuotes % 2 !== 0) || (backticks % 2 !== 0);
}

// Extra filter for RAW_B_TAG to avoid false positives
// <b> matches things like <button, <br, <body — need exact match
function isRealBTag(line, match) {
  const idx = line.indexOf(match);
  if (idx < 0) return false;
  const afterB = line[idx + 2];
  // <b> or <b  (space) — real b tag
  return afterB === ">" || afterB === " " || afterB === "\n" || afterB === "\t";
}

const violations = {};
for (const rule of RULES) violations[rule.id] = [];

/*
 * Ratchet entries actually hit this run. A stale entry — one whose site was
 * fixed or whose line moved — is reported so the list shrinks instead of
 * quietly granting an allowance to whatever now sits on that line.
 *
 * 🛑 This is the inverted-stale-check trap from CLAUDE.md § "Staged audits":
 * four audits once deleted from their own "stale" set on every branch, so each
 * reported "now fixed" while meaning "the file is gone". Here the set is
 * written ONLY when an entry matches, and the diff is taken at the end.
 */
const ratchetSeen = new Set();

for (const dir of DIRS) {
  const files = walkFiles(dir);
  for (const file of files) {
    /*
     * 🛑 Comments blanked with the SHARED stateful stripper, because
     * `isInsideComment` below is PER-LINE and cannot see that it is inside a
     * multi-line block.
     *
     * It tests whether a line STARTS with `//`, `*` or `/*`. A JSX block
     * comment whose continuation lines start with ordinary prose therefore
     * sails straight through — which is how a comment in
     * `MarketplaceHomepageView.tsx` explaining WHY a heading had moved
     * ("… measured against the hero <h1>") was reported as a raw heading.
     * Documenting a typography decision tripped the typography audit, which is
     * the strongest possible disincentive to write the comment at all.
     *
     * `stripComments` preserves byte offsets and newlines, so every line
     * number reported below still points at the original file, and it is
     * regex-literal aware — eight of ten hand-rolled copies mistook the `//`
     * ending a pattern like `/^https?:\/\//` for a line comment and blanked
     * the rest of the line.
     */
    const content = stripComments(readFileSync(file, "utf-8"));
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isInsideComment(line)) continue;

      for (const rule of RULES) {
        const match = rule.regex.exec(line);
        if (!match) continue;
        if (isInsideString(line, match.index)) continue;

        // Extra validation for <b> to avoid <button, <br, etc.
        if (rule.id === "RAW_B_TAG" && !isRealBTag(line, match[0])) continue;

        const rel = relative(ROOT, file).replace(/\\/g, "/");
        // The primitive layer authors the native element these rules replace.
        if (!STRICT && isExempt(rel)) continue;

        const key = `${rule.id} ${rel}:${i + 1}`;
        if (!STRICT && RATCHET.has(key)) {
          ratchetSeen.add(key);
          continue;
        }

        violations[rule.id].push({
          file: rel,
          line: i + 1,
          text: line.trim().slice(0, 100),
        });
      }
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────────────

let totalViolations = 0;

for (const rule of RULES) {
  const hits = violations[rule.id];
  totalViolations += hits.length;

  if (hits.length > 0) {
    console.error(`\n[${rule.id}] ${hits.length} violation(s) — ${rule.label}`);
    for (const v of hits.slice(0, 10)) {
      console.error(`  ${v.file}:${v.line} — ${v.text}`);
    }
    if (hits.length > 10) console.error(`  ... and ${hits.length - 10} more`);
  }
}

console.log("");

const stale = [...RATCHET].filter((k) => !ratchetSeen.has(k));
if (stale.length) {
  console.log(
    `audit-typography: ${stale.length} ratchet entr${stale.length === 1 ? "y is" : "ies are"} stale — the site moved or was fixed. Remove from RATCHET:`,
  );
  for (const s of stale) console.log(`  ${s}`);
}

if (totalViolations === 0) {
  console.log(
    `audit-typography: clean ✓ (${ratchetSeen.size} site(s) staged on RATCHET; MIGRATE=strict includes them)`,
  );
  process.exit(0);
}

console.error(`audit-typography: ${totalViolations} violation(s).`);
process.exit(1);
