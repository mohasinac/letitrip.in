#!/usr/bin/env node
/**
 * audit-table-column-priority — strict-zero.
 *
 * ## Why this exists
 *
 * A `TableColumn` without a `priority` renders at every breakpoint. That is the
 * safe default (see `resolveColumnPriority`), but it means a wide table renders
 * ALL its columns at 320px — cells wrap, rows grow to different heights, and
 * the list stops being scannable. Before `priority` existed, every table in
 * this codebase did exactly that: `TableColumn.hidden` was documented as
 * hiding a column and **neither DataTable ever read it**, so column-level
 * responsive behaviour was 0% implemented.
 *
 * This audit does not demand a priority on every column — most columns should
 * show always, and the field dictionary in `build-columns.ts` already infers a
 * breakpoint for common field names. It demands one where the absence actually
 * hurts:
 *
 * 1. WIDE_TABLE_NO_PRIORITY — a `columns` array with more than
 *    `MAX_UNPRIORITISED` entries where NOT ONE declares `priority`, and none of
 *    its keys is covered by the inference dictionary. Such a table is
 *    guaranteed unreadable below `lg`.
 * 2. NEVER_IN_A_ROW — a column keyed on a field that is detail-page content,
 *    never a cell. A `description` or `tags` column is what makes rows ragged;
 *    render a count pill or a presence icon instead.
 *
 * Suppression: `// audit-column-priority-ok: <reason>` on the offending line or
 * the line above. Legitimate for a genuinely narrow table whose every column
 * must always show.
 *
 * Exit 0 — clean.  Exit 1 — any violation.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git", "__tests__", "coverage"]);
const EXTS = [".ts", ".tsx"];

/** Above this many columns, a table with zero responsive intent is a problem. */
const MAX_UNPRIORITISED = 4;

/**
 * Fields that are detail-page content, never a table cell. Putting one in a row
 * is what produces wrapped, ragged rows — render a count or an icon instead.
 */
const NEVER_IN_A_ROW = new Set([
  "description",
  "bio",
  "notes",
  "message",
  "body",
  "content",
  "returnPolicy",
  "seoTitle",
  "seoDescription",
  "evidenceUrls",
]);

/** Keys the inference dictionary in `build-columns.ts` already handles. */
const INFERRED_KEYS = new Set([
  "status", "price", "total", "totalAmount", "amount", "listingType", "type",
  "category", "categorySlug", "brand", "brandSlug", "store", "storeName", "storeId",
  "quantity", "stockQuantity", "rating", "scope", "role",
  "createdAt", "updatedAt", "publishedAt", "id", "slug", "views", "viewCount",
  "productCount", "createdBy", "updatedBy",
]);

/** The primitives that DEFINE the contract are not call sites. */
const SELF = new Set([
  "appkit/src/contracts/extend.ts",
  "appkit/src/ui/columns/build-columns.ts",
  "scripts/audit-table-column-priority.mjs",
]);

const SUPPRESS = /\/\/\s*audit-column-priority-ok:/;

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(full, out);
    else if (EXTS.some((e) => name.endsWith(e))) out.push(full);
  }
  return out;
}

const rel = (f) => relative(ROOT, f).split("\\").join("/");
const lineOf = (src, i) => src.slice(0, i).split("\n").length;

function isSuppressed(lines, lineNo) {
  return SUPPRESS.test(lines[lineNo - 1] ?? "") || SUPPRESS.test(lines[lineNo - 2] ?? "");
}

/**
 * Find each `columns` array literal and return its span.
 *
 * Walks brackets rather than matching `\[[^\]]*\]` — a column's `render` body
 * contains its own brackets and braces, so a non-greedy regex stops at the
 * first one inside the first cell and reads the array as one entry.
 */
function findColumnArrays(source) {
  const found = [];
  // Matches `export const productAdminColumns: TableColumn<X>[] = [` as well as
  // a bare `columns = [`. A `\bColumns` anchor does NOT work — in
  // `productAdminColumns` the character before "Columns" is a word character,
  // so there is no boundary there, and the first version of this audit matched
  // exactly ZERO arrays while cheerfully reporting itself clean.
  const re = /[A-Za-z_$][\w$]*[Cc]olumns\s*(?::[^=\n]*)?=\s*\[/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    // The bracket the MATCH ends on — not the first `[` at or after m.index.
    // In `accountAdminColumns: TableColumn<UserProfile>[] = [` the first
    // bracket belongs to the TYPE's `[]`, so an indexOf lookup captured the
    // empty pair, found no `key:` inside it, and skipped every array in the
    // codebase while reporting `0 column array(s) checked` as success.
    const start = m.index + m[0].length - 1;
    let depth = 0;
    let quote = null;
    let j = start;
    for (; j < source.length; j++) {
      const c = source[j];
      const p = source[j - 1];
      if (quote) {
        if (c === quote && p !== "\\") quote = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") {
        quote = c;
        continue;
      }
      if (c === "[" || c === "{" || c === "(") depth++;
      else if (c === "]" || c === "}" || c === ")") {
        depth--;
        if (depth === 0) break;
      }
    }
    found.push({ start, body: source.slice(start, j + 1) });
    re.lastIndex = j + 1;
  }
  return found;
}

function main() {
  const violations = [];
  let arraysChecked = 0;

  for (const rootDir of SCAN) {
    for (const file of walk(rootDir)) {
      const relPath = rel(file);
      if (SELF.has(relPath)) continue;
      const raw = readFileSync(file, "utf8");
      if (!/\bkey:\s*["']/.test(raw)) continue;
      const lines = raw.split("\n");

      for (const arr of findColumnArrays(raw)) {
        const keys = [...arr.body.matchAll(/\bkey:\s*["']([^"']+)["']/g)].map((k) => k[1]);
        if (keys.length === 0) continue;
        arraysChecked++;
        const lineNo = lineOf(raw, arr.start);
        if (isSuppressed(lines, lineNo)) continue;

        for (const k of keys) {
          if (NEVER_IN_A_ROW.has(k)) {
            violations.push(
              `${relPath}:${lineNo}  NEVER_IN_A_ROW — column \`${k}\` is detail-page content. ` +
                `It wraps, so rows stop having a uniform height. Render a count pill or a ` +
                `presence icon instead, and put the text on the detail page.`,
            );
          }
        }

        const declares = /\bpriority:\s*["']/.test(arr.body);
        const inferable = keys.some((k) => INFERRED_KEYS.has(k));
        if (keys.length > MAX_UNPRIORITISED && !declares && !inferable) {
          violations.push(
            `${relPath}:${lineNo}  WIDE_TABLE_NO_PRIORITY — ${keys.length} columns, none declaring ` +
              `\`priority\` and none whose key the inference dictionary covers. This table renders ` +
              `all ${keys.length} columns at 320px. Give the audit-metadata columns \`priority: "xl"\` ` +
              `and the relational ones \`"lg"\`.`,
          );
        }
      }
    }
  }

  if (violations.length === 0) {
    console.log(`audit-table-column-priority: clean ✓ (${arraysChecked} column array(s) checked)`);
    process.exit(0);
  }

  console.error(`\naudit-table-column-priority: ${violations.length} violation(s).\n`);
  console.error(
    "  A column with no `priority` renders at every breakpoint. That is the safe\n" +
      "  default, but a wide table with no responsive intent at all is unreadable\n" +
      "  on a phone — and `TableColumn.hidden` does NOT do this (nothing reads it).\n" +
      "  Set `priority` per the field dictionary: audit metadata `xl`, relational\n" +
      "  context `lg`, one state + one number `md`, identity `always`.\n",
  );
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

main();
