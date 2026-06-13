#!/usr/bin/env node
/**
 * audit-hex-tokens.mjs — hardcoded hex colour detector (TS9).
 *
 * Every colour in source should reference a CSS custom property
 * (var(--appkit-color-*) or a Tailwind semantic token) so that theme
 * changes are a one-line edit in tokens.css, not a grep-and-replace
 * across dozens of files.
 *
 * VIOLATION CATEGORIES
 * --------------------
 * A  var(--appkit-xxx,#hex)   — CSS variable with a redundant hex fallback.
 *    The appkit token is always defined; the fallback is leftover copy-paste.
 *    --fix removes it automatically: var(--appkit-xxx,#hex) → var(--appkit-xxx)
 *
 * B  style={{ color: "#..." }} — raw hex in an inline style object.
 *    Use var(--appkit-color-*) or a Tailwind class instead.
 *
 * C  bg-[#...] / text-[#...] — raw hex in a Tailwind arbitrary value.
 *    Use a Tailwind semantic token or a named colour alias from the theme.
 *
 * D  Standalone hex literal — "#abc" or "#aabbcc" appearing in code.
 *    Typical in default prop values or gradient strings that belong in tokens.
 *
 * LEGITIMATE EXCEPTIONS (not flagged)
 * ------------------------------------
 * - Lines that are pure comments (// or * or /*)
 * - viewport themeColor metadata  (Next.js <head> meta — must be literal hex)
 * - Web App Manifest background_color / theme_color fields
 * - opengraph-image.tsx gradient strings (ImageResponse Canvas API)
 * - DevToolbar.tsx is flagged: it uses inline styles but CSS vars work there too
 *
 * USAGE
 * -----
 *   node scripts/audit-hex-tokens.mjs              # audit only
 *   node scripts/audit-hex-tokens.mjs --fix         # auto-fix Category A
 *   node scripts/audit-hex-tokens.mjs --baseline=N  # pass if violations ≤ N
 *   node scripts/audit-hex-tokens.mjs --strict       # baseline=0
 *   node scripts/audit-hex-tokens.mjs --warn-only    # exit 0 even on violations
 *
 * Exits 0 on clean (or within baseline), 1 on violations.
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, extname, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
// Walked source roots — both the consumer `src/` and the appkit library's `src/`.
// appkit/src was originally out of scope; extended 2026-06-13 because the
// canonical brand surfaces (AppLayoutShell, BrandDetailPageView, admin views)
// live there and were silently drifting.
const SRC_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];

// ---------------------------------------------------------------------------
// Known token set — parsed from appkit/src/tokens/tokens.css
// Only tokens in this set are safe to auto-fix (their hex fallbacks are redundant).
// A var(--appkit-xxx,#hex) where --appkit-xxx is NOT in this set has a
// load-bearing fallback — flag it but don't auto-strip.
// ---------------------------------------------------------------------------
function loadKnownTokens() {
  const tokensPath = join(ROOT, "appkit", "src", "tokens", "tokens.css");
  try {
    const css = readFileSync(tokensPath, "utf8");
    const names = new Set();
    for (const m of css.matchAll(/^\s*(--appkit-[a-z0-9-]+)\s*:/gm)) {
      names.add(m[1]);
    }
    return names;
  } catch {
    return new Set(); // fallback: treat all as unknown (conservative)
  }
}
const KNOWN_TOKENS = loadKnownTokens();

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const FIX_MODE  = argv.includes("--fix");
const WARN_ONLY = argv.includes("--warn-only");

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

/** Matches any 3- or 6-digit hex colour that is NOT inside a comment.
 *  Negative lookbehind for `&` excludes HTML entities like `&#123;` (which is `{`). */
const HEX_RE = /(?<!&)#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;

/** Category A: hex used as a fallback inside a CSS var(). */
const VAR_FALLBACK_RE = /var\((--appkit-[a-z0-9-]+)\s*,\s*#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\)/g;

/** Category C: Tailwind arbitrary hex value. */
const TAILWIND_ARBITRARY_HEX_RE = /(?:bg|text|border|ring|fill|stroke|from|to|via|shadow|outline|caret)-\[#[0-9a-fA-F]{3,8}[^\]]*\]/g;

// ---------------------------------------------------------------------------
// Exceptions — lines/files where hex is legitimately required
// ---------------------------------------------------------------------------

/** File names exempt from ALL checks (hex is required by the platform API). */
const EXEMPT_FILENAMES = new Set([
  "opengraph-image.tsx", // ImageResponse Canvas API uses raw hex
  "twitter-image.tsx",
  "og.tsx",              // appkit OG renderers — ImageResponse Canvas API
  "og-layout.tsx",       // appkit OG layout helper
  "manifest.ts",         // Web App Manifest theme/background colors
  "tokens.css",          // tokens definition file itself
  "color.helper.ts",     // hex parser / blender — needs raw hex in tests
  "email.ts",            // HTML emails — email clients ignore CSS vars
  "consent-otp.ts",      // OTP email template
  "GlobalError.tsx",     // renders without CSS framework on CSS-load failure
  "ErrorBoundary.tsx",   // renders without CSS framework on CSS-load failure
]);

/** Per-line escape hatch: `// audit-hex-tokens-ok: <reason>` */
const SUPPRESS_RE = /(?:\/\/|\/\*)\s*audit-hex-tokens-ok\b/;

/** Path-pattern exemptions (relative to ROOT, forward-slash). */
const EXEMPT_PATH_PATTERNS = [
  /[\\/]tokens[\\/]/,                    // appkit tokens module
  /[\\/]seed[\\/]/,                       // seed data — hex is part of seeded site-settings
  /[\\/]_internal[\\/]server[\\/]features[\\/][^\\/]+[\\/]og\.tsx?$/, // belt-and-suspenders
  /[\\/]features[\\/]contact[\\/]/,      // email templates
  /[\\/]features[\\/]auth[\\/]consent/,  // OTP email templates
  /[\\/]admin[\\/]components[\\/]analytics[\\/]/, // chart palettes — decorative
  /AdminAnalyticsCharts\.tsx?$/,
  /DashboardStats\.tsx?$/,
  /CharacterHotspot\.tsx?$/,             // dynamic positioning from Firestore data
  /HeroBanner\.tsx?$/,                   // dynamic theme tokens from CMS
  /HeroCarousel\.tsx?$/,                 // dynamic gradients from CMS
  /PromoGrid\.tsx?$/,                    // dynamic theme tokens from CMS
  /GoogleReviewsSection\.tsx?$/,         // official Google brand colors
  /WhatsAppCommunitySection\.tsx?$/,     // official WhatsApp brand colors
  /SellerWhatsAppSettingsView\.tsx?$/,   // WhatsApp brand chrome
  /CharacterHotspotForm\.tsx?$/,         // letitrip brand red palette in form editor preview
  /NewsletterBanner\.tsx?$/,             // CMS-driven gradient seed values
];

/**
 * Returns true for lines where the hex is required/expected and should not
 * be reported as a violation.
 *
 * Covers:
 *  - pure comment lines
 *  - Next.js viewport themeColor (browser meta tag)
 *  - Web App Manifest colour fields
 */
function isExemptLine(line) {
  const t = line.trim();
  // Pure comment lines
  if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return true;
  // Next.js viewport metadata themeColor — browser requires literal hex
  if (t.includes("themeColor") || t.includes("prefers-color-scheme")) return true;
  // Web App Manifest colour fields — browser requires literal hex
  if (t.includes("background_color") || t.includes("theme_color")) return true;
  return false;
}

// ---------------------------------------------------------------------------
// File walker
// ---------------------------------------------------------------------------

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "dist" || entry.name === "__tests__") continue;
    if (entry.isDirectory()) {
      walk(join(dir, entry.name), files);
    } else {
      const ext = extname(entry.name);
      if (ext === ".tsx" || ext === ".ts") {
        files.push(join(dir, entry.name));
      }
    }
  }
  return files;
}

function isExemptPath(file) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  return EXEMPT_PATH_PATTERNS.some((rx) => rx.test(rel));
}

// ---------------------------------------------------------------------------
// Violation collector
// ---------------------------------------------------------------------------

const violations = []; // { file, line, col, category, text, fixable }

const allFiles = SRC_DIRS.flatMap((d) => walk(d));
for (const file of allFiles) {
  const name = basename(file);
  if (EXEMPT_FILENAMES.has(name)) continue;
  if (isExemptPath(file)) continue;

  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");
  let fixedContent = content;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isExemptLine(line)) continue;
    if (SUPPRESS_RE.test(line)) continue;
    if (i > 0 && SUPPRESS_RE.test(lines[i - 1])) continue;

    const rel = relative(ROOT, file);

    // --- Category A: var(--appkit-xxx,#hex) fallbacks -----------------------
    const varMatches = [...line.matchAll(new RegExp(VAR_FALLBACK_RE.source, "g"))];
    for (const m of varMatches) {
      const tokenName = m[1];
      const isKnown = KNOWN_TOKENS.size === 0 || KNOWN_TOKENS.has(tokenName);
      if (isKnown) {
        violations.push({
          file: rel,
          line: i + 1,
          category: "A",
          label: "var() fallback hex (redundant)",
          text: m[0],
          hint: `Remove the hex fallback — ${tokenName} is always defined by appkit tokens.\n    Fix: ${m[0]} → var(${tokenName})`,
          fixable: true,
        });
      } else {
        violations.push({
          file: rel,
          line: i + 1,
          category: "A",
          label: "var() fallback hex (token undefined)",
          text: m[0],
          hint: `${tokenName} is NOT defined in appkit/src/tokens/tokens.css — the hex fallback is load-bearing.\n    Either add ${tokenName} to tokens.css, or replace with a defined token (e.g. var(--appkit-color-surface)).`,
          fixable: false,
        });
      }
    }

    // Auto-fix Category A (known tokens only) if --fix
    if (FIX_MODE && varMatches.length > 0) {
      fixedContent = fixedContent.replace(
        new RegExp(`var\\((--appkit-[a-z0-9-]+)\\s*,\\s*#[0-9a-fA-F]{3,6}\\)`, "g"),
        (match, tokenName) => KNOWN_TOKENS.has(tokenName) ? `var(${tokenName})` : match,
      );
    }

    // --- Category C: Tailwind arbitrary hex values --------------------------
    const twMatches = [...line.matchAll(new RegExp(TAILWIND_ARBITRARY_HEX_RE.source, "g"))];
    for (const m of twMatches) {
      violations.push({
        file: rel,
        line: i + 1,
        category: "C",
        label: "Tailwind arbitrary hex",
        text: m[0],
        hint: "Use a named Tailwind token (bg-primary, text-secondary) or a semantic alias from tailwind.config.js theme.extend.colors.",
        fixable: false,
      });
    }

    // --- Category B/D: raw hex in style props or standalone strings ---------
    // Skip lines that already matched A or C (they've been reported above).
    // We strip all var(...,#hex) and Tailwind arbitrary matches first to avoid
    // double-counting, then look for remaining bare hex literals.
    const stripped = line
      .replace(new RegExp(VAR_FALLBACK_RE.source, "g"), "var(--stripped)")
      .replace(new RegExp(TAILWIND_ARBITRARY_HEX_RE.source, "g"), "STRIPPED");

    // Look for remaining hex literals not inside a var() at all.
    for (const m of stripped.matchAll(new RegExp(HEX_RE.source, "g"))) {
      const hex = `#${m[1]}`;
      // Skip if surrounded by var( — already in a variable reference (no fallback)
      const before = stripped.slice(Math.max(0, m.index - 4), m.index);
      if (before.includes("var(")) continue;

      const isStyle = line.includes("style=") || line.includes("style:");
      violations.push({
        file: rel,
        line: i + 1,
        category: isStyle ? "B" : "D",
        label: isStyle ? "inline style hex" : "standalone hex literal",
        text: hex,
        hint: isStyle
          ? `Replace "${hex}" with var(--appkit-color-*) — CSS custom properties work in inline style objects.`
          : `Replace "${hex}" with a var(--appkit-color-*) token or a Tailwind semantic class.`,
        fixable: false,
      });
    }
  }

  // Write back fixed file if anything changed
  if (FIX_MODE && fixedContent !== content) {
    writeFileSync(file, fixedContent, "utf8");
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const fixableCount = violations.filter((v) => v.fixable).length;
const manualCount  = violations.length - fixableCount;

if (FIX_MODE && fixableCount > 0) {
  console.log(`audit-hex-tokens: auto-fixed ${fixableCount} Category A (var fallback) violation(s).`);
  if (manualCount === 0) {
    console.log("audit-hex-tokens: 0 remaining violations ✓");
    process.exit(0);
  }
  console.log(`audit-hex-tokens: ${manualCount} violation(s) remain (manual fix required).\n`);
}

if (violations.length === 0) {
  console.log("audit-hex-tokens: clean ✓");
  process.exit(0);
}

// Group by file for readable output
const byFile = new Map();
for (const v of violations) {
  if (FIX_MODE && v.fixable) continue; // already fixed, don't re-report
  if (!byFile.has(v.file)) byFile.set(v.file, []);
  byFile.get(v.file).push(v);
}

if (byFile.size === 0 && FIX_MODE) {
  // All were fixable and were fixed
  process.exit(0);
}

const totalRemaining = [...byFile.values()].reduce((s, vs) => s + vs.length, 0);

process.stderr.write(
  `audit-hex-tokens: ${totalRemaining} violation(s) found.\n\n`,
);

for (const [file, vs] of byFile) {
  process.stderr.write(`  ${file}\n`);
  for (const v of vs) {
    process.stderr.write(
      `    [${v.category}] line ${v.line}  "${v.text}"\n` +
      `       ${v.hint}\n`,
    );
  }
  process.stderr.write("\n");
}

const categories = {
  A: "var() fallback hex  — redundant: run --fix to auto-strip; undefined token: add to tokens.css",
  B: "inline style hex    — replace with var(--appkit-color-*)",
  C: "Tailwind arbitrary  — replace with named token",
  D: "standalone literal  — replace with var(--appkit-color-*)",
};
const seen = new Set([...byFile.values()].flat().map((v) => v.category));
process.stderr.write("Category legend:\n");
for (const [cat, label] of Object.entries(categories)) {
  if (seen.has(cat)) process.stderr.write(`  [${cat}] ${label}\n`);
}
process.stderr.write("\n");

if (WARN_ONLY) {
  process.exit(0);
} else {
  process.exit(1);
}
