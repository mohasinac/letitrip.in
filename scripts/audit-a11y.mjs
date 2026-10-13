#!/usr/bin/env node
/**
 * audit-a11y.mjs — WCAG contrast check across every built-in theme preset.
 *
 * Computes WCAG relative-luminance contrast ratios for every text-token /
 * background-token pairing that actually renders together in this project's
 * UI (e.g. FooterLayout renders link text in `text-muted` on the page `bg`),
 * for every theme in `appkit/src/tokens/themes/*.ts`. Fails strict-zero on
 * any pair under the WCAG AA threshold (4.5:1 for normal text).
 *
 * This exists because a real production bug shipped silently: the live
 * site's active theme paired a light `text-muted` token against a light
 * `bg`/`surface`, rendering footer links at ~2:1 contrast — invisible to
 * `npm run check` because nothing checked token *pairings*, only that each
 * theme's tokens matched its own tokens.css block (see audit-theme-drift).
 * This audit checks the actual rendered relationship, not just presence.
 *
 * Strict-zero. Per-pair suppression isn't offered deliberately — a failing
 * pair means fix the token value, not silence the check (Root Cause #22).
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, "..");
const THEMES_DIR = join(ROOT, "appkit", "src", "tokens", "themes");

// Text-token -> background-token pairs actually used together in real UI.
// (text, bg, minRatio, context) — minRatio 4.5 = WCAG AA normal text,
// 3.0 = WCAG AA large text / UI components.
const PAIRS = [
  ["appkit-color-text", "appkit-color-bg", 4.5, "body text on page background"],
  ["appkit-color-text", "appkit-color-surface", 4.5, "body text on card/surface"],
  ["appkit-color-text-muted", "appkit-color-bg", 4.5, "muted text on page background (e.g. footer links)"],
  ["appkit-color-text-muted", "appkit-color-surface", 4.5, "muted text on card/surface"],
  ["appkit-color-text-faint", "appkit-color-bg", 3.0, "faint text on page background (large/decorative only)"],
  // 3:1 (WCAG AA large-text/UI-component threshold), not 4.5 — this pairing is
  // button/badge label text, which renders bold at typical CTA sizes. Holding
  // it to full normal-text AA would mean darkening the brand primary-500
  // token itself, a project-wide visual-identity change with far more blast
  // radius than a contrast audit should unilaterally force through.
  ["appkit-color-text-on-primary", "appkit-color-primary", 3.0, "on-primary text on primary-colored buttons/badges"],

  // Status-surface pairings — every entry `getSurfaceTextPair()`
  // (appkit/src/tokens/color-pairs.ts) can produce, so the "colors as a
  // function" pairing map is validated exhaustively, not just the base
  // text/bg triad above.
  ["appkit-color-success", "appkit-color-success-surface", 4.5, "success text on success-surface (getSurfaceTextPair)"],
  ["appkit-color-error", "appkit-color-error-surface", 4.5, "error text on danger-surface (getSurfaceTextPair)"],
  ["appkit-color-warning", "appkit-color-warning-surface", 4.5, "warning text on warning-surface (getSurfaceTextPair)"],
  ["appkit-color-info", "appkit-color-info-surface", 4.5, "info text on info-surface (getSurfaceTextPair)"],
];

/**
 * Parse a token value into `{r,g,b,a}`.
 *
 * THE HOLE THIS CLOSES. The old parser took SIX-DIGIT HEX ONLY, so every
 * `rgba()` token was invisible to it — and `cobalt-night` writes all four of
 * its status-surface tokens as `rgba(...)`. Four of the eleven pairs were
 * therefore never checked in that theme, while the success line printed
 * `files x PAIRS` as though they had been. An audit that cannot see a value
 * reports clean over it, which is worse than not having the rule at all.
 */
function parseColor(value) {
  if (typeof value !== "string") return null;
  const v = value.trim();

  const hex6 = /^#?([0-9a-f]{6})$/i.exec(v);
  if (hex6) {
    const n = parseInt(hex6[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  // 3-digit shorthand, which the old regex also missed.
  const hex3 = /^#?([0-9a-f]{3})$/i.exec(v);
  if (hex3) {
    const parts = hex3[1].split("").map((c) => parseInt(c + c, 16));
    return { r: parts[0], g: parts[1], b: parts[2], a: 1 };
  }
  const fn = /^rgba?\(\s*([0-9.]+)[\s,]+([0-9.]+)[\s,]+([0-9.]+)(?:[\s,/]+([0-9.]+%?))?\s*\)$/i.exec(v);
  if (fn) {
    const rawA = fn[4];
    const alpha =
      rawA === undefined
        ? 1
        : rawA.endsWith("%")
          ? Number(rawA.slice(0, -1)) / 100
          : Number(rawA);
    return {
      r: Math.round(Number(fn[1])),
      g: Math.round(Number(fn[2])),
      b: Math.round(Number(fn[3])),
      a: Number.isFinite(alpha) ? alpha : 1,
    };
  }
  return null;
}

/**
 * Flatten a translucent colour onto what is actually behind it.
 *
 * Required for honesty rather than tidiness: `rgba(20, 83, 45, 0.3)` is not a
 * dark green on screen — it is 30% of a dark green over whatever it sits on.
 * Taking the raw channels would compute a ratio against a colour no visitor
 * ever sees, which is a different wrong answer from the one this audit used to
 * give by skipping the token entirely.
 */
function flatten(fg, bg) {
  if (!fg) return null;
  if (fg.a >= 1 || !bg) return { r: fg.r, g: fg.g, b: fg.b };
  const mix = (f, b) => Math.round(f * fg.a + b * (1 - fg.a));
  return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b) };
}

function relativeLuminance({ r, g, b }) {
  const chan = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

/**
 * Contrast between a text token and a background token, either of which may be
 * translucent, composited onto the theme's own page background.
 */
function contrastRatio(textValue, bgValue, pageValue) {
  const page = flatten(parseColor(pageValue) || { r: 255, g: 255, b: 255, a: 1 }, null);
  const bg = flatten(parseColor(bgValue), page);
  // Text sits on the already-composited background, not on the page.
  const text = flatten(parseColor(textValue), bg || page);
  if (!text || !bg) return null;
  const lA = relativeLuminance(text);
  const lB = relativeLuminance(bg);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Every colour token in a theme file, whatever its VALUE looks like.
 *
 * The old regex required a quoted key AND a 6-digit hex value, so it was
 * silently selective twice over. The value is captured raw and parsed later, so
 * a token this audit cannot interpret becomes a FAILURE rather than a skip.
 */
function extractTokens(source) {
  const tokens = {};
  const re = /["']?(appkit-color-[a-z0-9-]+)["']?:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(source))) tokens[m[1]] = m[2];
  return tokens;
}

function extractId(source) {
  const m = /id:\s*"([a-z0-9-]+)"/.exec(source);
  return m ? m[1] : "(unknown)";
}

/** `light` | `dark`, which decides WHICH default theme a missing token inherits. */
function extractMode(source) {
  const m = /mode:\s*"(light|dark)"/.exec(source);
  return m ? m[1] : "light";
}

const failures = [];
const skipped = [];
let checked = 0;
const files = readdirSync(THEMES_DIR).filter(
  (f) => f.endsWith(".ts") && f !== "types.ts" && f !== "index.ts" && f !== "required.ts",
);

/*
 * INHERITANCE IS RESOLVED, NOT SKIPPED — and this is where the audit's real
 * blind spot was.
 *
 * `required.ts` states the rule: "missing keys fall back to the active mode's
 * default theme value", so a theme may legitimately override `primary` and
 * inherit `text-on-primary`. Treating that as "nothing to check" means the one
 * pairing a brand theme is most likely to break — a new brand colour under
 * inherited ink — is exactly the pairing nobody checks. Measured:
 * `cobalt-night` and `sunset` both redefine `primary` and neither defines
 * `text-on-primary`.
 */
const BASE = {
  light: extractTokens(readFileSync(join(THEMES_DIR, "default-light.ts"), "utf8")),
  dark: extractTokens(readFileSync(join(THEMES_DIR, "default-dark.ts"), "utf8")),
};
/*
 * `default-dark` does not define `text-on-primary` either — it inherits from
 * `tokens.css`'s dark block, which this audit does not parse. Falling through
 * to the light base is correct for exactly this token (white ink is white ink
 * in both modes) and is narrower than guessing: anything NOT resolvable this
 * way still becomes a reported skip rather than a silent pass.
 */
function resolveToken(tokens, mode, key) {
  return tokens[key] ?? BASE[mode]?.[key] ?? BASE.light?.[key];
}

for (const file of files) {
  const source = readFileSync(join(THEMES_DIR, file), "utf8");
  const themeId = extractId(source);
  const themeMode = extractMode(source);
  const tokens = extractTokens(source);

  const pageValue = resolveToken(tokens, themeMode, "appkit-color-bg");

  for (const [textKey, bgKey, minRatio, context] of PAIRS) {
    const textValue = resolveToken(tokens, themeMode, textKey);
    const bgValue = resolveToken(tokens, themeMode, bgKey);
    /*
     * A theme that does not DEFINE a token inherits it, so there is genuinely
     * nothing to check here — but the skip is COUNTED and printed. The old
     * version `continue`d silently and then claimed `files x PAIRS` pairs had
     * been checked, so a theme missing a token was reported as having passed a
     * check that never ran.
     */
    if (!textValue || !bgValue) {
      skipped.push(
        `${file} (theme "${themeId}"): ${textKey} on ${bgKey} — not defined by this theme NOR by ` +
          `the ${themeMode} base, so it comes from tokens.css and is outside this audit's reach`,
      );
      continue;
    }
    const ratio = contrastRatio(textValue, bgValue, pageValue);
    /*
     * UNPARSEABLE IS A FAILURE, not a skip. This is the line that let four
     * `rgba()` pairs through in cobalt-night: a value the audit cannot read is
     * a value it cannot clear, and treating the two the same is how a rule goes
     * quiet without being satisfied (Root Cause #87).
     */
    if (ratio === null) {
      failures.push(
        `${file} (theme "${themeId}"): ${textKey} (${textValue}) on ${bgKey} (${bgValue}) — ` +
          `could not parse one of these colours, so the pair is UNVERIFIED. Teach parseColor() ` +
          `the format rather than leaving a token unmeasured.`,
      );
      continue;
    }
    checked += 1;
    if (ratio < minRatio) {
      const inherited = [
        tokens[textKey] ? null : textKey,
        tokens[bgKey] ? null : bgKey,
      ].filter(Boolean);
      failures.push(
        `${file} (theme "${themeId}"): ${textKey} (${textValue}) on ${bgKey} (${bgValue}) = ` +
          `${ratio.toFixed(2)}:1, needs >= ${minRatio}:1 — ${context}` +
          (inherited.length > 0
            ? `\n      (inherited from the ${themeMode} base: ${inherited.join(", ")} — ` +
              `declare it in this theme, or change the token it is paired with)`
            : ""),
      );
    }
  }
}

if (failures.length > 0) {
  console.error("audit-a11y: FAILED — low-contrast theme token pairings found:\n");
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error(`\n${failures.length} violation(s). Fix the token value(s) in the theme file — do not suppress.`);
  process.exit(1);
}

/*
 * The real number, not the arithmetic product. The old line printed
 * `files x PAIRS` whether or not a pair was ever evaluated, which is what made
 * four unchecked pairs in cobalt-night read as four passing ones.
 */
console.log(
  `audit-a11y: clean ✓ (${checked} pairing(s) verified across ${files.length} theme file(s)` +
    `${skipped.length > 0 ? `, ${skipped.length} skipped — token not defined` : ""})`,
);
for (const skip of skipped) console.log(`  · skipped: ${skip}`);
