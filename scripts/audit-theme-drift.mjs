#!/usr/bin/env node
/**
 * audit-theme-drift.mjs — Verify every theme preset TS file
 *                         (`default-light`, `default-dark`, `cobalt-night`,
 *                         `sunset`) stays aligned with its matching CSS
 *                         block in `tokens.css`, AND that the CSS selector
 *                         for each theme actually exists at all.
 *
 * The runtime ThemeProvider applies a theme record by writing each
 * `tokens[name]` value as `--name` on `<html data-theme={theme.id}>`. For
 * first-paint (before JS hydration) the same values must already live in
 * `:root` (light default) or `[data-theme="{id}"]` (every other theme,
 * keyed by the theme's real `id` — NOT its `mode`) so the page does not
 * flicker/flash-wrong-colour during hydration.
 *
 * A prior bug had the dark-theme CSS block selector as `[data-theme="dark"]`
 * — the theme's `mode`, not its `id` (`"default-dark"`) — which made that
 * whole block permanently unreachable (dead CSS) and caused a light-token
 * flash on every dark-mode page load. The SELECTOR_EXISTS check below exists
 * specifically so that class of bug can never regress silently again: it
 * fails loudly if any registered theme id has no matching CSS selector at
 * all, independent of whether the token values inside would have matched.
 *
 * This audit parses both sources and reports any mismatch (missing key,
 * different value, stray key, or missing selector). Strict-zero — any drift
 * blocks.
 *
 * It does NOT inspect admin-authored (non-template) themes; those are
 * validated at write time by the Site Settings server action.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, relative } from "path";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, "..");
const APPKIT_SRC = join(ROOT, "appkit", "src");
const THEMES_DIR = join(APPKIT_SRC, "tokens", "themes");

const TOKENS_CSS = join(APPKIT_SRC, "tokens", "tokens.css");

/**
 * Every theme this audit checks. `cssSelector: null` means the theme is the
 * default first-paint state and lives in a bare `:root { ... }` block
 * instead of an attribute selector.
 */
const THEMES = [
  { label: "default-light", id: "default-light", cssSelector: null, tsFile: "default-light.ts", tsExport: "DEFAULT_LIGHT_THEME" },
  { label: "default-dark", id: "default-dark", cssSelector: "default-dark", tsFile: "default-dark.ts", tsExport: "DEFAULT_DARK_THEME" },
  { label: "cobalt-night", id: "cobalt-night", cssSelector: "cobalt-night", tsFile: "cobalt-night.ts", tsExport: "COBALT_NIGHT_THEME" },
  { label: "sunset", id: "sunset", cssSelector: "sunset", tsFile: "sunset.ts", tsExport: "SUNSET_THEME" },
];

function rel(p) {
  return relative(ROOT, p).replace(/\\/g, "/");
}

/** Extract the body of a `:root { ... }` or `[data-theme="id"] { ... }` block, or null if absent. */
function extractBlock(source, selector) {
  const rx = selector
    ? new RegExp(`\\[data-theme="${selector}"\\]\\s*\\{([\\s\\S]*?)\\}`, "g")
    : /:root\s*\{([\s\S]*?)\}/g;
  const target = {};
  let found = false;
  let match;
  while ((match = rx.exec(source))) {
    found = true;
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
  return { found, tokens: target };
}

/**
 * Parse the `tokens: { ... }` object literal out of a theme TS file. Relies
 * on the file structure being a single export with `tokens: { ... }` holding
 * `"key": "value"` pairs.
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
  return value
    .replace(/;\s*$/, "")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

// Auxiliary `appkit-color-*` tokens that exist in `:root` (extended palette,
// social-brand colours, light-only helpers) without a required TS-preset
// counterpart. Exempt from MISSING_IN_TS so every theme file doesn't have to
// carry the entire extended palette — only the two default presets own it.
function isExemptColorKey(key, label) {
  if (/^appkit-color-(?:zinc|slate|emerald|amber|rose|sky|purple|teal|green|cobalt|accent|primary|secondary)-(?:\d+)$/.test(key)) {
    return true;
  }
  if (/^appkit-color-(?:instagram|facebook|tiktok|deviantart|whatsapp|youtube)$/.test(key)) return true;
  if (key === "appkit-color-error-hover") return true;
  if (key === "appkit-color-text-on-dark") return true;
  // Solid status fills (`--appkit-color-{status}-solid` / `-on-solid`) are
  // deliberately theme-INVARIANT — a dark saturated fill with white text in
  // every theme, so an overlay badge on a product photo stays legible whether
  // the page is light or dark. Making them theme-substitutable would let a
  // theme reintroduce exactly the white-on-white bug they exist to prevent.
  if (/^appkit-color-(?:success|warning|error|info)-(?:solid|on-solid)$/.test(key)) return true;
  if (key === "appkit-color-text-on-primary" && label !== "default-light") return true;
  if (key === "appkit-color-error-title" || key === "appkit-color-error-text") return true;
  // Theme templates (cobalt-night, sunset) deliberately only override the
  // subset of colours their CSS block redefines — everything else inherits
  // from the base mode's default theme, same as default-dark does against
  // :root. Only the two default presets are required to be exhaustive.
  if (label !== "default-light" && label !== "default-dark") return true;
  return false;
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

  for (const key of cssKeys) {
    if (!key.startsWith("appkit-color-")) continue;
    if (tsKeys.has(key)) continue;
    if (isExemptColorKey(key, label)) continue;
    issues.push({
      type: "MISSING_IN_TS",
      token: key,
      detail: `CSS block declares "${key}" but the TS preset (${label}) does not. Add it to the TS preset or document it as auxiliary.`,
    });
  }

  return issues;
}

// ---------------------------------------------------------------------------
// RULE 2 — THEME_INVARIANT_TEXT (ratchet)
// ---------------------------------------------------------------------------
/**
 * A component CSS rule setting `color:` from the raw neutral ramp
 * (`--appkit-color-zinc-*` / `--appkit-color-slate-*`) is theme-INVARIANT: the
 * ramp is declared once under `:root` and is not overridden by any theme block,
 * so the same grey renders in `default-dark`, `cobalt-night` and `sunset`.
 *
 * Rule 1 above proves the TS presets and tokens.css agree. It says nothing
 * about whether component CSS actually READS those tokens — and it did not.
 * `Typography.style.css` had `.appkit-color--muted` reading
 * `--appkit-color-text-FAINT` (one step lighter than its own name, for ~1,039
 * `color="muted"` call sites), `.appkit-color--faint` and `.appkit-label`
 * reading the raw ramp, and `.dark` overrides pinning all of them back to a
 * fixed grey — `.dark .appkit-color--faint` resolved to zinc-600 (#52525b) on a
 * near-black page. Fixed 2026-08-29; that file is at 0 and must stay there.
 *
 * The remaining 122 sites are the same defect in 38 other components, each
 * hand-rolling a light/dark pair off the ramp. They need a browser to
 * re-verify, so they are RATCHETED, not baselined: a file may never exceed its
 * recorded count, a file absent from the map must be at zero, and lowering a
 * count requires updating the map — so the debt cannot silently grow OR be
 * silently misreported. Removing an entry is the goal.
 *
 * Fix by reading `--appkit-color-text` / `-text-muted` / `-text-faint`, which
 * already invert per theme, and DELETING the paired `.dark` override — the
 * token does that job, and a second mechanism can only disagree with it.
 */
const THEME_INVARIANT_TEXT_RATCHET = {
  "ui/DataTable.style.css": 3,
  "ui/components/Accordion.style.css": 3,
  "ui/components/ActiveFilterChips.style.css": 4,
  "ui/components/Avatar.style.css": 2,
  "ui/components/Badge.style.css": 2,
  "ui/components/BaseListingCard.style.css": 1,
  "ui/components/Breadcrumb.style.css": 3,
  "ui/components/BulkActionBar.style.css": 1,
  "ui/components/Checkbox.style.css": 2,
  "ui/components/DescriptionField.style.css": 3,
  "ui/components/Divider.style.css": 1,
  "ui/components/Dropdown.style.css": 2,
  "ui/components/EmptyState.style.css": 1,
  "ui/components/FilterDrawer.style.css": 2,
  "ui/components/FormField.style.css": 2,
  "ui/components/IconButton.style.css": 3,
  "ui/components/ListingLayout.style.css": 2,
  "ui/components/PaginatedSelect.style.css": 2,
  "ui/components/Pagination.style.css": 4,
  "ui/components/PasswordStrengthIndicator.style.css": 3,
  "ui/components/PriceDisplay.style.css": 1,
  "ui/components/Progress.style.css": 1,
  "ui/components/Radio.style.css": 2,
  "ui/components/RatingDisplay.style.css": 4,
  "ui/components/RowActionMenu.style.css": 2,
  "ui/components/Select.style.css": 4,
  "ui/components/Semantic.style.css": 16,
  "ui/components/SideDrawer.style.css": 4,
  "ui/components/StarRating.style.css": 2,
  "ui/components/StatsGrid.style.css": 3,
  "ui/components/StepperNav.style.css": 4,
  "ui/components/SummaryCard.style.css": 4,
  "ui/components/TablePagination.style.css": 4,
  "ui/components/TagInput.style.css": 4,
  "ui/components/TextLink.style.css": 3,
  "ui/components/Tooltip.style.css": 3,
  "ui/components/ViewToggle.style.css": 2,
  "ui/rich-text/RichText.style.css": 13,
};

const RAW_RAMP_COLOR_RX = /(^|[^-\w])color:\s*var\(--appkit-color-(?:zinc|slate)-\d/;

function collectCssFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectCssFiles(full, out);
    else if (entry.endsWith(".css")) out.push(full);
  }
  return out;
}

function countRawRampText(file) {
  let count = 0;
  for (const line of readFileSync(file, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("/*") || trimmed.startsWith("*")) continue;
    // `background-color:` and `border-color:` end in "color:" too; the leading
    // boundary in the regex rejects them, but the fill/border ramp is a
    // legitimate use in either case.
    if (!RAW_RAMP_COLOR_RX.test(line)) continue;
    count += 1;
  }
  return count;
}

function checkThemeInvariantText() {
  const issues = [];
  for (const file of collectCssFiles(APPKIT_SRC)) {
    if (file === TOKENS_CSS) continue;
    const key = relative(APPKIT_SRC, file).replace(/\\/g, "/");
    const actual = countRawRampText(file);
    const allowed = THEME_INVARIANT_TEXT_RATCHET[key] ?? 0;
    if (actual > allowed) {
      issues.push({
        file: rel(file),
        detail:
          `THEME_INVARIANT_TEXT: ${actual} \`color:\` declaration(s) read the raw ` +
          `--appkit-color-{zinc,slate}-* ramp; the ratchet allows ${allowed}.\n` +
          `The ramp is declared once in :root and no theme overrides it, so this ` +
          `renders the same grey in every theme.\n` +
          `Read --appkit-color-text / -text-muted / -text-faint instead, and delete ` +
          `any paired \`.dark\` override — those tokens already invert per theme.`,
      });
    } else if (actual < allowed) {
      issues.push({
        file: rel(file),
        detail:
          `THEME_INVARIANT_TEXT: ${actual} site(s) remain but the ratchet still records ` +
          `${allowed}. Lower it to ${actual} (or delete the entry if 0) in ` +
          `scripts/audit-theme-drift.mjs — a ratchet that over-reports its debt stops ` +
          `being a measure of it.`,
      });
    }
  }
  return issues;
}

const cssSource = readFileSync(TOKENS_CSS, "utf-8");
const failures = [];

for (const issue of checkThemeInvariantText()) failures.push(issue);

for (const theme of THEMES) {
  const tsPath = join(THEMES_DIR, theme.tsFile);
  let tsSource;
  try {
    tsSource = readFileSync(tsPath, "utf-8");
  } catch (_err) {
    failures.push({ file: rel(tsPath), detail: `Theme file not found for "${theme.label}".` });
    continue;
  }

  const { found, tokens: cssTokens } = extractBlock(cssSource, theme.cssSelector);
  if (!found) {
    const selectorDesc = theme.cssSelector ? `[data-theme="${theme.cssSelector}"]` : ":root";
    failures.push({
      file: rel(TOKENS_CSS),
      detail: `SELECTOR_EXISTS: no ${selectorDesc} block found for theme id "${theme.id}" (${theme.tsExport} in ${theme.tsFile}). ` +
        `ThemeProvider sets data-theme to the theme's id at runtime — a missing/mismatched selector here means this theme's CSS never applies before hydration (dead CSS).`,
    });
    continue;
  }

  const tsTokens = parseTsTokens(tsSource);
  if (!tsTokens) {
    failures.push({ file: rel(tsPath), detail: `Could not parse \`tokens: {...}\` block in ${theme.tsFile}` });
    continue;
  }

  for (const issue of diff(theme.label, cssTokens, tsTokens)) {
    failures.push({
      file: `${rel(tsPath)} ↔ ${rel(TOKENS_CSS)}`,
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
  "Drift between a theme's TS preset and its tokens.css block will cause hydration flicker, " +
    "and a missing CSS selector means the theme never applies before hydration at all. " +
    "Either update the TS preset to match the CSS block, or update tokens.css to match the TS preset.",
);
process.exit(1);
