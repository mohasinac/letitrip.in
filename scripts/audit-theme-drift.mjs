#!/usr/bin/env node
/**
 * audit-theme-drift.mjs — Verify the built-in TS theme presets
 *                         (`default-light`, `default-dark`) stay aligned
 *                         with the matching CSS blocks in `tokens.css`.
 *
 * The runtime ThemeProvider applies the TS preset by writing each
 * `tokens[name]` value as `--name` on `<html>`. For first-paint (before JS
 * hydration) the same values must already live in `:root` (for light) and
 * `[data-theme="dark"]` (for dark) so the page does not flicker during
 * hydration.
 *
 * This audit parses both sources and reports any mismatch (missing key,
 * different value, or stray key). Strict-zero — any drift blocks.
 *
 * It does NOT inspect admin-authored themes; those are validated at write
 * time by the Site Settings server action.
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, relative } from "path";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, "..");
const APPKIT_SRC = join(ROOT, "appkit", "src");

const TOKENS_CSS = join(APPKIT_SRC, "tokens", "tokens.css");
const DEFAULT_LIGHT_TS = join(APPKIT_SRC, "tokens", "themes", "default-light.ts");
const DEFAULT_DARK_TS = join(APPKIT_SRC, "tokens", "themes", "default-dark.ts");

function rel(p) {
  return relative(ROOT, p).replace(/\\/g, "/");
}

/** Parse `:root { ... }` and `[data-theme="..."] { ... }` blocks out of tokens.css. */
function parseCssBlocks(source) {
  const blocks = { root: {}, dark: {} };
  const ROOT_RX = /:root\s*\{([\s\S]*?)\}/g;
  const DARK_RX = /\[data-theme="dark"\]\s*\{([\s\S]*?)\}/g;

  const harvest = (rx, target) => {
    let match;
    while ((match = rx.exec(source))) {
      const body = match[1];
      const lines = body.split(/\n|;/);
      for (const raw of lines) {
        const trimmed = raw.trim();
        if (!trimmed || trimmed.startsWith("/*")) continue;
        const m = trimmed.match(/^(--[a-zA-Z0-9-]+)\s*:\s*(.+?)\s*(?:\/\*.*\*\/)?$/);
        if (!m) continue;
        const name = m[1].slice(2); // strip leading --
        const value = m[2].replace(/\s+/g, " ").trim();
        target[name] = value;
      }
    }
  };

  harvest(ROOT_RX, blocks.root);
  harvest(DARK_RX, blocks.dark);
  return blocks;
}

/**
 * Parse the `tokens` object literal out of a default-{light,dark}.ts file.
 * We rely on the file structure being a single export with `tokens: { ... }`
 * holding `"key": "value"` pairs. The values may contain commas, so we capture
 * the string literal contents specifically.
 */
function parseTsTokens(source) {
  const blockMatch = source.match(/tokens:\s*\{([\s\S]*?)\n\s*\},\s*\n\s*gradients:/);
  if (!blockMatch) return null;
  const body = blockMatch[1];
  const tokens = {};
  const LINE_RX = /"([^"]+)"\s*:\s*"([^"]*)",/g;
  let m;
  while ((m = LINE_RX.exec(body))) {
    tokens[m[1]] = m[2].replace(/\\"/g, '"').replace(/\s+/g, " ").trim();
  }
  return tokens;
}

function normaliseValue(value) {
  // Strip trailing semicolons and collapse whitespace so CSS / TS strings compare cleanly.
  return value
    .replace(/;\s*$/, "")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

function diff(label, cssTokens, tsTokens) {
  const issues = [];
  const cssKeys = new Set(Object.keys(cssTokens));
  const tsKeys = new Set(Object.keys(tsTokens));

  for (const key of tsKeys) {
    if (!cssKeys.has(key)) {
      issues.push({
        type: "MISSING_IN_CSS",
        token: key,
        detail: `TS preset declares "${key}" but the matching CSS block does not. Add it to tokens.css.`,
      });
      continue;
    }
    const cssValue = normaliseValue(cssTokens[key]);
    const tsValue = normaliseValue(tsTokens[key]);
    if (cssValue !== tsValue) {
      issues.push({
        type: "MISMATCH",
        token: key,
        detail: `Drift between TS and CSS:\n        TS:  ${tsValue}\n        CSS: ${cssValue}`,
      });
    }
  }

  // Flag CSS-only colour tokens that TS does not declare (excluding the
  // extended Tailwind palette ramps and ungovernedscalars — TS presets only
  // own the semantic surface). Anything starting with `--appkit-color-` that
  // is not in TS is a candidate drift unless it's a ramp.
  for (const key of cssKeys) {
    if (!key.startsWith("appkit-color-")) continue;
    if (tsKeys.has(key)) continue;
    if (/^appkit-color-(?:zinc|slate|emerald|amber|rose|sky|purple|teal|green|cobalt|accent|primary|secondary)-(?:\d+)$/.test(key)) {
      continue;
    }
    if (/^appkit-color-(?:instagram|facebook|tiktok|deviantart|whatsapp|youtube)$/.test(key)) {
      continue;
    }
    if (key === "appkit-color-error-hover") continue; // light-only auxiliary
    if (key === "appkit-color-text-on-dark") continue; // light-only auxiliary
    if (key === "appkit-color-text-on-primary" && label === "default-dark") continue;
    if (key === "appkit-color-error-title" || key === "appkit-color-error-text") continue;
    issues.push({
      type: "MISSING_IN_TS",
      token: key,
      detail: `CSS block declares "${key}" but the TS preset (${label}) does not. Add it to the TS preset or document it as auxiliary.`,
    });
  }

  return issues;
}

const cssSource = readFileSync(TOKENS_CSS, "utf-8");
const lightTsSource = readFileSync(DEFAULT_LIGHT_TS, "utf-8");
const darkTsSource = readFileSync(DEFAULT_DARK_TS, "utf-8");

const { root: cssLight, dark: cssDark } = parseCssBlocks(cssSource);
const lightTsTokens = parseTsTokens(lightTsSource);
const darkTsTokens = parseTsTokens(darkTsSource);

const failures = [];

if (!lightTsTokens) {
  failures.push({
    file: rel(DEFAULT_LIGHT_TS),
    detail: "Could not parse `tokens: {...}` block in default-light.ts",
  });
}
if (!darkTsTokens) {
  failures.push({
    file: rel(DEFAULT_DARK_TS),
    detail: "Could not parse `tokens: {...}` block in default-dark.ts",
  });
}

if (lightTsTokens) {
  for (const issue of diff("default-light", cssLight, lightTsTokens)) {
    failures.push({
      file: rel(DEFAULT_LIGHT_TS) + " ↔ " + rel(TOKENS_CSS),
      detail: `[${issue.type} ${issue.token}] ${issue.detail}`,
    });
  }
}
if (darkTsTokens) {
  for (const issue of diff("default-dark", cssDark, darkTsTokens)) {
    failures.push({
      file: rel(DEFAULT_DARK_TS) + " ↔ " + rel(TOKENS_CSS),
      detail: `[${issue.type} ${issue.token}] ${issue.detail}`,
    });
  }
}

if (failures.length === 0) {
  console.log("audit-theme-drift: clean ✓");
  process.exit(0);
}

console.error("audit-theme-drift: " + failures.length + " drift issue(s) found.\n");
for (const f of failures) {
  console.error("  " + f.file);
  console.error("    " + f.detail.replace(/\n/g, "\n    "));
  console.error();
}
console.error(
  "Drift between the TS theme presets and tokens.css will cause hydration flicker. " +
    "Either update the TS preset to match the CSS block, or update tokens.css to match the TS preset.",
);
process.exit(1);
