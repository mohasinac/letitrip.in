#!/usr/bin/env node
/**
 * audit-column-renderers — strict-zero.
 *
 * ## Why this exists
 *
 * `column-renderers.ts` promised a JSX sibling in its own docstring and that
 * file was never written — so for months every table cell without a
 * hand-written `render` fell back to `String(value)`. A status was grey text, a
 * price was `1499`, a date was a raw ISO string. That is the whole of the
 * "bland admin" report.
 *
 * `cell-renderers.tsx` now exists. This audit stops the codebase drifting back:
 *
 * 1. BLAND_CELL — a column whose key names a kind we have a renderer for
 *    (`status`, `*At`, `price`/`total`/`amount`, `image*`/`thumbnail`) whose
 *    `render` returns a bare `String(...)` or a plain template literal. That is
 *    a cell doing by hand, worse, what a shared renderer already does.
 * 2. LOCAL_TONE_MAP — a second copy of the status tone→class map. There were
 *    two, they had already drifted in the `neutral` case, and both carried the
 *    same broken `isSold`/`removed` entry with two backgrounds and two inks on
 *    one element (Recurrent Root Cause #67). `STATUS_TONE_CLASSES` in
 *    `cell-renderers.tsx` is the one copy.
 *
 * Suppression: `// audit-column-renderer-ok: <reason>` on the offending line or
 * the line above.
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

/** The module that DEFINES the shared map is not a duplicate of it. */
const SELF = new Set(["appkit/src/ui/columns/cell-renderers.tsx"]);

/** Column keys that have a dedicated renderer in `cell-renderers.tsx`. */
const KIND_BY_KEY = [
  { test: (k) => k === "status", renderer: "renderStatusBadge" },
  { test: (k) => /(^|[a-z])At$/.test(k), renderer: "renderRelativeDate" },
  {
    test: (k) => ["price", "total", "totalAmount", "amount", "subtotal"].includes(k),
    renderer: "renderMoney",
  },
  {
    test: (k) => /^(image|thumbnail|mainImage|photo|avatar)/.test(k),
    renderer: "renderThumbnail",
  },
];

const SUPPRESS = /\/\/\s*audit-column-renderer-ok:/;

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

function main() {
  const violations = [];
  let filesChecked = 0;

  for (const rootDir of SCAN) {
    for (const file of walk(rootDir)) {
      const relPath = rel(file);
      if (SELF.has(relPath)) continue;
      const raw = readFileSync(file, "utf8");
      const lines = raw.split("\n");
      let touched = false;

      // Rule 2 — a second tone map.
      const toneIdx = raw.indexOf("STATUS_TONE_CLASSES");
      if (toneIdx !== -1 && /(?:const|let)\s+STATUS_TONE_CLASSES\s*[:=]/.test(raw)) {
        const lineNo = lineOf(raw, toneIdx);
        if (!isSuppressed(lines, lineNo)) {
          touched = true;
          violations.push(
            `${relPath}:${lineNo}  LOCAL_TONE_MAP — a second copy of the status tone→class map. ` +
              `Import \`STATUS_TONE_CLASSES\` from \`ui/columns/cell-renderers\` instead. The two ` +
              `previous copies had already drifted, and both shipped the same broken entry with ` +
              `two backgrounds and two inks on one element.`,
          );
        }
      }

      // Rule 1 — a bland cell where a renderer exists.
      const re = /\bkey:\s*["']([^"']+)["']([\s\S]{0,400}?)\brender:\s*\([^)]*\)\s*=>\s*([^\n,]+)/g;
      let m;
      while ((m = re.exec(raw)) !== null) {
        const [, key, between, body] = m;
        // Only pair a key with the render that follows it in the SAME object.
        if (between.includes("key:")) continue;
        const kind = KIND_BY_KEY.find((k) => k.test(key));
        if (!kind) continue;
        const bland = /^\s*String\(/.test(body) || /^\s*`[^`]*\$\{/.test(body);
        if (!bland) continue;
        const lineNo = lineOf(raw, m.index);
        if (isSuppressed(lines, lineNo)) continue;
        touched = true;
        violations.push(
          `${relPath}:${lineNo}  BLAND_CELL — column \`${key}\` renders a raw string, but ` +
            `\`${kind.renderer}()\` exists for exactly this kind. That fallback is why admin ` +
            `tables read as plain text.`,
        );
      }

      if (touched || raw.includes("cell-renderers")) filesChecked++;
    }
  }

  if (violations.length === 0) {
    console.log(`audit-column-renderers: clean ✓ (${filesChecked} renderer-related file(s) checked)`);
    process.exit(0);
  }

  console.error(`\naudit-column-renderers: ${violations.length} violation(s).\n`);
  console.error(
    "  A table cell that stringifies its value is the default this codebase\n" +
      "  spent months in: `String(value)` for every column nobody hand-wrote.\n" +
      "  `ui/columns/cell-renderers.tsx` has a renderer per kind — status badge,\n" +
      "  thumbnail, money, relative date, boolean icon, count pill, type chip.\n",
  );
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

main();
