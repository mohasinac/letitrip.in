#!/usr/bin/env node
/**
 * audit-theme-invariant-hover.mjs — a hover fill must follow the theme.
 *
 * `--appkit-color-surface-hover` / `-raised` / `--appkit-color-primary-surface`
 * INVERT with the active theme. A named palette tint (`zinc-50`, `primary-100`)
 * does not: `--color-zinc-50` is #fafafa in every theme, and
 * `--appkit-color-primary-50` is a near-white rose in `default-dark`. Sitting
 * under `dark:hover:text-*` white ink, that is white-on-white.
 *
 * WHY THIS AUDIT EXISTS (2026-08-27). Reported as "hovering any link shows a
 * white background behind white text in dark mode". Two causes, both silent:
 *
 * 1. ~30 sites had no dark half at all and had never worked in a dark theme.
 *
 * 2. ~20 more carried TWO competing unprefixed hover fills on one element —
 *    a `zinc-50` tint beside an arbitrary `surface-elevated` fill. That
 *    shape was manufactured by `scripts/migrate-dark-classes.mjs`, which
 *    rewrote `dark:hover:bg-zinc-800` into an UNPREFIXED arbitrary utility and
 *    left the light class beside it. Both configs set `important: true`, so the
 *    two tie at specificity (0,2,0) AND both carry `!important` — EMISSION
 *    ORDER decides, Tailwind v4 emits arbitrary values before named palette
 *    ones, and the hardcoded zinc-50 was emitted last and won. Measured in the
 *    built CSS: appkit/dist/tailwind-utilities.css offsets 137741 vs 143036.
 *
 * That is why the fix is to REMOVE the light class rather than add a `dark:`
 * one, and why DUPLICATE_HOVER_BG is a rule in its own right: two competing
 * fills are decided by build-time emission order, which no author can see, and
 * `src/app/globals.css` already documents that Turbopack chunk-splitting makes
 * even that non-deterministic across chunks.
 *
 * NO SUPPRESSION MARKER, deliberately — matching audit-public-projection-parity
 * and audit-nav-page-wiring. The one genuine exception, a control on a fixed
 * dark scrim, has a first-class spelling: `hover:bg-white/NN` (with an alpha),
 * which this audit does not flag. If you are reaching for a marker, you want
 * that instead.
 */

const BASELINE = 0;

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];

const SKIP_DIRS = new Set([
  "node_modules", ".next", "dist", "build", ".git", "coverage", "__mocks__", "__tests__",
]);
const SKIP_FILE_RE = /\.(d\.ts|test\.[jt]sx?|spec\.[jt]sx?)$/;
const CODE_EXT_RE = /\.(tsx?|jsx?)$/;

const PALETTE = [
  "zinc", "slate", "gray", "neutral", "stone", "primary", "secondary", "accent",
  "cobalt", "red", "rose", "green", "emerald", "amber", "sky", "blue", "teal",
  "purple", "indigo", "violet", "orange", "lime", "cyan",
].join("|");

/**
 * A leading character class rather than a lookbehind: it is what excludes
 * `dark:hover:bg-…` and `group-hover:bg-…` while still matching at a string
 * start or after whitespace / a quote / a template brace.
 */
const TINT_RE = new RegExp(
  String.raw`(?:^|[\s"'\`{])hover:bg-(?:${PALETTE})-(?:50|100|200)(?![\w./-])`,
);
/** Bare white/black with NO alpha. `hover:bg-white/90` is the legitimate scrim case. */
const PLAIN_RE = /(?:^|[\s"'`{])hover:bg-(?:white|black)(?![\w./-])/;

const NEUTRALS = /^(?:zinc|slate|gray|neutral|stone)$/;

/**
 * The INK axis — same defect, one property over.
 *
 * 🛑 This audit matched `hover:bg-` ONLY until 2026-10-19, and the scan even
 * early-`continue`d on `if (!source.includes("hover:bg-"))`, so a file whose
 * only defect was on the text axis was never read at all. The header above has
 * always DESCRIBED the ink case ("under `dark:hover:text-*` white ink, that is
 * white-on-white") while the implementation could not see it — a rule narrower
 * than the property it claims, which is Root Cause #84's shape.
 *
 * Removing the gate found the same two failure modes on `hover:text-`:
 *   - 16 elements carrying TWO competing unprefixed hover inks, e.g.
 *     `hover:text-zinc-700 hover:text-[var(--appkit-color-text-muted)]`. The
 *     second resolves to the RESTING colour, so the hover changes nothing at
 *     all — on the notification bell, the admin sidebar, the admin nav and
 *     page header, the /categories tab row, and the mobile bottom-nav item.
 *   - 14 carrying a neutral-palette ink with no `dark:` pair.
 *
 * Same codemod signature as the fill case, same fix: keep exactly ONE, themed.
 */
const INK_TINT_RE = new RegExp(
  String.raw`(?:^|[\s"'\`{])hover:text-(?:${PALETTE})-(?:\d{2,3})(?![\w./-])`,
);

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(join(dir, e.name), out);
    } else {
      out.push(join(dir, e.name));
    }
  }
  return out;
}

/**
 * Blank out comment bodies, preserving newlines so reported line numbers stay
 * accurate. A class name QUOTED IN PROSE — this audit's own header, a Root
 * Cause note in CLAUDE.md-style docs, the `Icon` primitive explaining what it
 * replaces — is documentation, not a violation. Quote-aware, so a `//` inside a
 * string (a URL) is not mistaken for a comment.
 */
function stripComments(src) {
  let out = "";
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (quote) {
      out += c;
      if (c === "\\") {
        out += n ?? "";
        i += 2;
        continue;
      }
      if (c === quote) quote = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      out += c;
      i++;
      continue;
    }
    if (c === "/" && n === "/") {
      while (i < src.length && src[i] !== "\n") {
        out += " ";
        i++;
      }
      continue;
    }
    if (c === "/" && n === "*") {
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        out += src[i] === "\n" ? "\n" : " ";
        i++;
      }
      out += "  ";
      i += 2;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

const rel = (p) => relative(ROOT, p).replace(/\\/g, "/");

/**
 * Hover classes of one family that genuinely COMPETE, i.e. land on the same
 * element at the same time.
 *
 * 🛑 Scoped to a single STRING LITERAL, not to the line. A line-wide count
 * flags a ternary — `cond ? "… hover:text-white" : "… hover:text-primary-600"`
 * — where the two are mutually exclusive alternatives and nothing competes.
 * That false positive appeared immediately on `BrandDetailPageView` and
 * `CartRouteClient` the first time the ink rule ran, and "fixing" it would have
 * meant deleting one arm of a correct conditional.
 *
 * Two classes inside ONE literal are both applied, which is the real defect.
 */
function competingIn(line, prefix) {
  const literals = line.match(/["'`][^"'`]*["'`]/g) ?? [line];
  let worst = [];
  for (const lit of literals) {
    const found = lit
      .slice(1, -1)
      .split(/\s+/)
      .filter((t) => t.startsWith(prefix));
    if (found.length > worst.length) worst = found;
  }
  return worst;
}

const violations = [];

// ---------------------------------------------------------------------------
// Rules 1 + 2 — className strings in code
// ---------------------------------------------------------------------------
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    if (!CODE_EXT_RE.test(file) || SKIP_FILE_RE.test(file)) continue;
    const source = readFileSync(file, "utf8");
    // Both axes — see INK_TINT_RE. Gating on `hover:bg-` alone is what hid the
    // ink defects: a file with only `hover:text-` problems was never opened.
    if (!source.includes("hover:bg-") && !source.includes("hover:text-")) continue;
    const lines = stripComments(source).split(/\r?\n/);

    lines.forEach((line, i) => {
      const tint = TINT_RE.exec(line);
      if (tint) {
        const cls = tint[0].trim();
        const pal = cls.replace(/^hover:bg-/, "").replace(/-(?:50|100|200)$/, "");
        const token = NEUTRALS.test(pal) ? "surface-hover" : "primary-surface";
        violations.push({
          file: rel(file),
          line: i + 1,
          rule: "HARDCODED_HOVER_TINT",
          snippet: cls,
          hint:
            `\`${cls}\` is the SAME near-white fill in every theme, so under\n` +
            `      \`dark:hover:text-*\` ink it renders white-on-white.\n` +
            `      Use \`hover:bg-${token}\` — it inverts with the theme, and needs no dark: pair.`,
        });
      }

      const plain = PLAIN_RE.exec(line);
      if (plain) {
        violations.push({
          file: rel(file),
          line: i + 1,
          rule: "HARDCODED_HOVER_TINT",
          snippet: plain[0].trim(),
          hint:
            `A bare white/black hover fill does not follow the theme.\n` +
            `      On an ordinary surface use \`hover:bg-surface-hover\`.\n` +
            `      On a fixed dark scrim (lightbox, media overlay) use an ALPHA — \`hover:bg-white/90\`.`,
        });
      }

      // Two competing unprefixed hover fills on one element.
      const bare = competingIn(line, "hover:bg-");
      if (bare.length > 1) {
        violations.push({
          file: rel(file),
          line: i + 1,
          rule: "DUPLICATE_HOVER_BG",
          snippet: bare.join("  +  "),
          hint:
            `Two unprefixed hover fills on one element. Both configs set \`important: true\`,\n` +
            `      so they tie at (0,2,0) with equal !important and EMISSION ORDER decides —\n` +
            `      not source order, not specificity. Tailwind v4 emits arbitrary values before\n` +
            `      named palette ones, so the named class wins. Keep exactly one, themed.`,
        });
      }

      /*
       * ── The same two rules on the INK axis ───────────────────────────────
       *
       * 🛑 One guard the FILL rule deliberately does not have: a light-neutral
       * FILL is wrong even when paired, because `hover:bg-zinc-50` is the same
       * near-white in both themes and the dark half cannot undo it being
       * emitted. An INK is different — `hover:text-zinc-900
       * dark:hover:text-white` is a complete, correct pairing, and flagging it
       * would churn working code into "fixes" that change nothing. Only an
       * UNPAIRED hardcoded ink is a defect.
       */
      const inkHasDarkPair = /dark:hover:text-/.test(line);
      const ink = inkHasDarkPair ? null : INK_TINT_RE.exec(line);
      if (ink) {
        const cls = ink[0].trim();
        const pal = cls.replace(/^hover:text-/, "").replace(/-\d{2,3}$/, "");
        violations.push({
          file: rel(file),
          line: i + 1,
          rule: "HARDCODED_HOVER_INK",
          snippet: cls,
          hint:
            `\`${cls}\` is the SAME ink in every theme — ${NEUTRALS.test(pal) ? "a dark neutral that\n      disappears on a dark surface" : "a fixed brand shade that\n      ignores the active theme"}.\n` +
            `      Use \`hover:text-[var(--appkit-color-text)]\` for neutral ink, or pair a brand\n` +
            `      shade with its dark half: \`hover:text-primary-600 dark:hover:text-primary-400\`.`,
        });
      }

      const bareInk = competingIn(line, "hover:text-");
      if (bareInk.length > 1) {
        violations.push({
          file: rel(file),
          line: i + 1,
          rule: "DUPLICATE_HOVER_TEXT",
          snippet: bareInk.join("  +  "),
          hint:
            `Two unprefixed hover inks on one element — EMISSION ORDER decides, exactly as\n` +
            `      for fills. Worse than a wrong colour when one of them resolves to the element's\n` +
            `      RESTING colour (\`hover:text-[var(--appkit-color-text-muted)]\` beside a muted\n` +
            `      base): the hover then changes nothing and reads as "hover is broken".\n` +
            `      Keep exactly one, themed.`,
        });
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Rule 3 — component CSS `:hover` on a light neutral token with no .dark twin
// ---------------------------------------------------------------------------
const RULE_RE = /([^{}]+)\{([^{}]*)\}/g;
const CSS_BAD_RE =
  /background(?:-color)?\s*:\s*var\(--appkit-color-(?:zinc|slate|gray|neutral)-(?:50|100|200)\)/;

for (const file of walk(join(ROOT, "appkit", "src"))) {
  if (!file.endsWith(".css")) continue;
  if (rel(file).endsWith("tokens/tokens.css")) continue;
  const source = readFileSync(file, "utf8");
  const rules = [...source.matchAll(RULE_RE)].map((m) => ({
    sel: m[1].trim(),
    body: m[2],
    index: m.index,
  }));
  const darkBases = new Set(
    rules
      .filter((r) => r.sel.includes(".dark"))
      .map((r) => r.sel.replace(/\.dark\s*/g, "").trim()),
  );
  for (const r of rules) {
    if (!r.sel.includes(":hover") || r.sel.includes(".dark")) continue;
    if (!CSS_BAD_RE.test(r.body)) continue;
    if (darkBases.has(r.sel)) continue;
    violations.push({
      file: rel(file),
      line: source.slice(0, r.index).split(/\r?\n/).length,
      rule: "CSS_HOVER_NEUTRAL_NO_DARK",
      snippet: `${r.sel} { background: var(--appkit-color-zinc-*) }`,
      hint:
        `--appkit-color-zinc-* is declared ONCE under :root and never inverts.\n` +
        `      Use var(--appkit-color-surface-hover) — then no .dark twin is needed at all.`,
    });
  }
}

const seenKey = new Set();
const deduped = violations.filter((v) => {
  const k = `${v.file}:${v.line}:${v.rule}:${v.snippet}`;
  if (seenKey.has(k)) return false;
  seenKey.add(k);
  return true;
});
deduped.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

if (deduped.length > BASELINE) {
  console.error(
    `[audit-theme-invariant-hover] FAIL: ${deduped.length} violation(s) (baseline ${BASELINE}).\n`,
  );
  for (const v of deduped) {
    console.error(`  ${v.file}:${v.line}  [${v.rule}]`);
    console.error(`      ${v.snippet}`);
    console.error(`      ${v.hint}\n`);
  }
  console.error("  Hover fills:  neutral -> hover:bg-surface-hover");
  console.error("                brand   -> hover:bg-primary-surface");
  console.error("                on a fixed dark scrim -> hover:bg-white/NN (alpha)");
  console.error("  There is no suppression marker for this audit — see the header.");
  process.exit(1);
}

console.log(
  `[audit-theme-invariant-hover] OK: 0 violations across ${SCAN_DIRS.length} scan roots.`,
);
