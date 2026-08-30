#!/usr/bin/env node
/**
 * audit-nav-metadata — strict-zero.
 *
 * ## R1 · NAV_ITEM_WITHOUT_HELPER
 *
 * Every sidebar entry goes through `adminItem` / `storeItem` / `userItem`,
 * because those are what derive the `id`. A bare `{ href, label }` literal in
 * a nav group has no id — and `filterNavItems` opens with
 * `if (!item.id) return true;`, so an item without one is **exempt from both
 * the admin toggle and its own `requiredPermission`**. That is how 91 admin
 * entries came to be visible to every employee regardless of permissions: not
 * a broken check, an un-run one.
 *
 * ## R2 · HAND_WRITTEN_NAV_ID
 *
 * `id:` typed into a nav item. The id is also the `navConfig` key, so one that
 * drifts from its href silently un-toggles the entry: the admin hides
 * "Payouts", the toggle writes a key nothing reads, and the item stays.
 *
 * ## R3 · NAV_METADATA_COVERAGE
 *
 * Every item needs a `description` and at least two `keywords`. The search
 * that reads them is the whole point of W6 — an item without them can only be
 * found by the name already printed on it, which is what the sidebar search
 * did before and why "refund" found nothing.
 *
 * Two keywords rather than one because a single keyword is almost always just
 * the label again in the plural.
 *
 * Suppression: `// audit-nav-metadata-ok: <reason>`.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TARGET = "src/constants/navigation.tsx";
const MIN_KEYWORDS = 2;

const raw = readFileSync(join(ROOT, TARGET), "utf8");
const src = stripComments(raw);
const rawLines = raw.split("\n");
const lineOf = (index) => src.slice(0, index).split("\n").length;
const suppressed = (line) =>
  /audit-nav-metadata-ok:/.test(rawLines[line - 1] ?? "") ||
  /audit-nav-metadata-ok:/.test(rawLines[line - 2] ?? "");

const violations = [];
const report = (line, rule, detail) => violations.push({ line, rule, detail });

/** The text of the call whose opening `(` is at `openIndex`, paren-counted. */
function callArgs(text, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < text.length; i += 1) {
    if (text[i] === "(") depth += 1;
    else if (text[i] === ")") {
      depth -= 1;
      if (depth === 0) return text.slice(openIndex + 1, i);
    }
  }
  return "";
}

/** The three `*_NAV_GROUPS` literals, by name. */
function navGroupBlocks() {
  const blocks = [];
  for (const name of ["ADMIN_NAV_GROUPS", "STORE_NAV_GROUPS", "USER_NAV_GROUPS"]) {
    const start = src.indexOf(`export const ${name}`);
    if (start === -1) continue;
    const end = src.indexOf("\n];", start);
    blocks.push({ name, start, text: src.slice(start, end) });
  }
  return blocks;
}

// R1 — a bare item literal inside a nav group.
for (const block of navGroupBlocks()) {
  for (const m of block.text.matchAll(/\{\s*href:\s*[^}]*?label:\s*"([^"]+)"/g)) {
    const line = lineOf(block.start + m.index);
    if (suppressed(line)) continue;
    report(
      line,
      "NAV_ITEM_WITHOUT_HELPER",
      `"${m[1]}" in ${block.name} is a bare literal — it has no id, so filterNavItems short-circuits and its requiredPermission never runs`,
    );
  }
}

// R2 — a hand-written id.
for (const m of src.matchAll(/^\s*id:\s*["'`]/gm)) {
  const line = lineOf(m.index);
  if (suppressed(line)) continue;
  report(line, "HAND_WRITTEN_NAV_ID", "ids are derived by navItemId(portal, href), never typed");
}

// R3 — metadata coverage on every helper call.
const CALL = /\b(adminItem|storeItem|userItem)\(/g;
let items = 0;
for (const m of src.matchAll(CALL)) {
  const open = m.index + m[0].length - 1;
  const args = callArgs(src, open);
  // The helper DEFINITIONS match too; they have typed params, not a string.
  const label = args.match(/,\s*"([^"]+)"/);
  if (!label) continue;
  items += 1;
  const line = lineOf(m.index);
  if (suppressed(line)) continue;

  if (!/description:\s*"/.test(args)) {
    report(line, "NAV_METADATA_COVERAGE", `"${label[1]}" has no description`);
    continue;
  }
  const kw = args.match(/keywords:\s*\[([^\]]*)\]/);
  const count = kw ? (kw[1].match(/"/g) ?? []).length / 2 : 0;
  if (count < MIN_KEYWORDS) {
    report(
      line,
      "NAV_METADATA_COVERAGE",
      `"${label[1]}" has ${count} keyword(s); at least ${MIN_KEYWORDS} are needed — one is usually just the label again`,
    );
  }
}

if (violations.length === 0) {
  console.log(
    `audit-nav-metadata: clean ✓ (${items} nav item(s), all with a derived id, a description and ≥${MIN_KEYWORDS} keywords)`,
  );
  process.exit(0);
}

console.error(`[audit-nav-metadata] ${violations.length} violation(s) in ${TARGET}:\n`);
for (const v of violations) {
  console.error(`  ${TARGET}:${v.line}  [${v.rule}]`);
  console.error(`      ${v.detail}\n`);
}
console.error("  Suppression: // audit-nav-metadata-ok: <reason>");
process.exit(1);
