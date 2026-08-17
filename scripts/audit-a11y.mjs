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

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function relativeLuminance({ r, g, b }) {
  const chan = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

function contrastRatio(hexA, hexB) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) return null;
  const lA = relativeLuminance(a);
  const lB = relativeLuminance(b);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

function extractTokens(source) {
  const tokens = {};
  const re = /"(appkit-color-[a-z0-9-]+)":\s*"(#[0-9a-fA-F]{6})"/g;
  let m;
  while ((m = re.exec(source))) tokens[m[1]] = m[2];
  return tokens;
}

function extractId(source) {
  const m = /id:\s*"([a-z0-9-]+)"/.exec(source);
  return m ? m[1] : "(unknown)";
}

const failures = [];
const files = readdirSync(THEMES_DIR).filter(
  (f) => f.endsWith(".ts") && f !== "types.ts" && f !== "index.ts" && f !== "required.ts",
);

for (const file of files) {
  const source = readFileSync(join(THEMES_DIR, file), "utf8");
  const themeId = extractId(source);
  const tokens = extractTokens(source);

  for (const [textKey, bgKey, minRatio, context] of PAIRS) {
    const textHex = tokens[textKey];
    const bgHex = tokens[bgKey];
    if (!textHex || !bgHex) continue; // theme doesn't define this token — nothing to check
    const ratio = contrastRatio(textHex, bgHex);
    if (ratio === null) continue;
    if (ratio < minRatio) {
      failures.push(
        `${file} (theme "${themeId}"): ${textKey} (${textHex}) on ${bgKey} (${bgHex}) = ` +
          `${ratio.toFixed(2)}:1, needs >= ${minRatio}:1 — ${context}`,
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

console.log(`audit-a11y: clean ✓ (${files.length} theme files, ${PAIRS.length} pairings each checked)`);
