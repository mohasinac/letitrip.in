#!/usr/bin/env node
/**
 * audit-prose-ink-owner.mjs — prose ink has exactly one owner, and it is the
 * consumer's `tailwind.config.js`.
 *
 * WHY THIS AUDIT EXISTS (2026-10-23). Reported as "can you read?" against the
 * category intro prose: links rendered near-black on a near-black page. The
 * cause was not a missing rule — it was a rule that could never win.
 *
 * `@tailwindcss/typography` emits `.prose { --tw-prose-links: <gray-900> }`,
 * and the consumer's `important: true` makes every one of those `!important`
 * inside `@layer utilities`. appkit answered with an UNLAYERED
 * `:root .prose { --tw-prose-links: … !important }` and justified itself in a
 * comment: "(0,2,0) against `.prose`'s (0,1,0), so specificity decides and the
 * outcome does not depend on bundle order."
 *
 * 🛑 Specificity is never consulted. For the IMPORTANT tier, cascade-layer
 * order is REVERSED and unlayered sorts LOWEST — a layered `!important` beats
 * an unlayered one at any specificity. So Tailwind's hardcoded light-mode grays
 * won in EVERY theme, in light as well as dark, and the override was dead from
 * the day it was written. Nothing caught it: the CSS was present, valid and
 * correct-looking in `dist/styles.css`, and only a rendered page shows a rule
 * losing a cascade.
 *
 * The fix was to stop competing. Setting the values in the typography config
 * makes the plugin emit the appkit tokens in the first place, so exactly one
 * declaration exists and there is no contest to lose.
 *
 * This audit keeps it that way, in both directions:
 *
 *   R1  appkit CSS must not declare any `--tw-prose-*`. Re-adding one does not
 *       restore anything — it recreates the losing rule.
 *   R2  `tailwind.config.js` must still own them, bound to `--appkit-color-*`
 *       so they re-theme. If the typography block is deleted, the plugin falls
 *       back to its hardcoded grays and the original bug returns silently.
 *   R3  `--tw-prose-links` specifically must resolve to `--appkit-color-link`,
 *       the token that inverts per theme. Binding it to `primary-600` instead
 *       is the mistake that looks right: in `default-dark` that ramp is a
 *       CRIMSON, so every link would read as an error.
 *
 * NO SUPPRESSION MARKER — `audit-no-suppression-comments` bans them, and there
 * is no legitimate second declaration of these variables.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, relative } from "path";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, "..");
const APPKIT_SRC = join(ROOT, "appkit", "src");
const TW_CONFIG = join(ROOT, "tailwind.config.js");

const violations = [];

/* ---- R1: appkit must not declare prose variables ------------------------ */

function walkCss(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === "dist") continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) -(full, out);
    else if (entry.endsWith(".css")) out.push(full);
  }
  return out;
}

for (const file of walkCss(APPKIT_SRC)) {
  const src = readFileSync(file, "utf8");
  const lines = src.split(/\r?\n/);
  lines.forEach((line, i) => {
    // A DECLARATION (`--tw-prose-x:`), not a mention inside a comment or a
    // `var(--tw-prose-x)` read, which are both legitimate.
    const m = line.match(/(--tw-prose-[a-z-]+)\s*:/);
    if (!m) return;
    const before = line.slice(0, line.indexOf(m[0]));
    if (before.includes("*") || before.includes("//")) return;
    violations.push({
      rule: "R1 APPKIT_DECLARES_PROSE_VAR",
      file: relative(ROOT, file).replace(/\\/g, "/"),
      line: i + 1,
      detail: `${m[1]} declared in appkit CSS. Unlayered, so it loses the important-tier cascade to the typography plugin's own layered declaration — it cannot win, whatever its specificity. Set it in tailwind.config.js instead.`,
    });
  });
}

/* ---- R2 + R3: the consumer config owns them, bound to theme tokens ------- */

let config = "";
try {
  config = readFileSync(TW_CONFIG, "utf8");
} catch {
  violations.push({
    rule: "R2 CONFIG_UNREADABLE",
    file: "tailwind.config.js",
    line: 0,
    detail: "Could not read tailwind.config.js — the owner of prose ink.",
  });
}

if (config) {
  const REQUIRED = ["--tw-prose-body", "--tw-prose-headings", "--tw-prose-links"];
  for (const key of REQUIRED) {
    const rx = new RegExp(`["']${key}["']\\s*:\\s*["']([^"']+)["']`);
    const m = config.match(rx);
    if (!m) {
      violations.push({
        rule: "R2 CONFIG_MISSING_PROSE_VAR",
        file: "tailwind.config.js",
        line: 0,
        detail: `${key} is not set in theme.extend.typography. Without it the typography plugin emits its hardcoded Tailwind gray, which does not invert — the original near-black-on-near-black bug.`,
      });
      continue;
    }
    if (!m[1].includes("--appkit-color-")) {
      violations.push({
        rule: "R2 CONFIG_PROSE_VAR_NOT_TOKEN",
        file: "tailwind.config.js",
        line: 0,
        detail: `${key} is "${m[1]}", which is not an --appkit-color-* token. A literal does not re-theme.`,
      });
    }
  }

  const link = config.match(/["']--tw-prose-links["']\s*:\s*["']([^"']+)["']/);
  if (link && !link[1].includes("--appkit-color-link")) {
    violations.push({
      rule: "R3 LINKS_NOT_BOUND_TO_LINK_TOKEN",
      file: "tailwind.config.js",
      line: 0,
      detail: `--tw-prose-links is "${link[1]}". It must be var(--appkit-color-link): the correct link ramp differs per theme, and default-dark's primary is a crimson that reads as an error.`,
    });
  }
}

if (violations.length > 0) {
  console.error(`[audit-prose-ink-owner] FAIL: ${violations.length} violation(s).\n`);
  for (const v of violations) {
    console.error(`  ${v.file}${v.line ? `:${v.line}` : ""}  [${v.rule}]`);
    console.error(`      ${v.detail}\n`);
  }
  console.error("  There is no suppression marker for this audit — see the header.");
  process.exit(1);
}

console.log(
  "[audit-prose-ink-owner] OK — prose ink has one owner (tailwind.config.js), bound to theme tokens.",
);
