#!/usr/bin/env node
/**
 * audit-media-limit-literals — strict-zero.
 *
 * ## Why this exists
 *
 * "How many images may a listing carry" had SIX answers, and no two of them
 * were reached by the same code path:
 *
 *   5   `CONTEXT_LIMITS.PRODUCT_IMAGE_MAX`      (server signed-URL guard)
 *   5   `CONTEXT_LIMITS.AUCTION_IMAGE_MAX`      (same guard, auctions)
 *   5   `CONTEXT_LIMITS.PREORDER_IMAGE_MAX`     (same guard, pre-orders)
 *   5   `images: z.array(...).max(5)`           (the seller/admin write schema)
 *   5   `maxItems={5}`                          (both product gallery controls)
 *   20  `images: z.array(...).max(20)`          (the _internal product schema)
 *   12  `maxItems = 12`                         (the MediaUploadList default)
 *
 * Which cap a seller actually hit therefore depended on which form they had
 * opened and which route saved it — and the guard's 5 was an INDEX ceiling
 * while the gallery's 5 was a COUNT, so the fifth image of a five-image
 * gallery arrived as index 6 and was rejected with a 400.
 *
 * Nothing prevented a seventh number. This does.
 *
 * ## The rule
 *
 * Product media counts come from `_internal/shared/media/limits.ts` —
 * `PRODUCT_MAX_IMAGES`, `PRODUCT_MAX_VIDEOS`, `PRODUCT_IMAGE_INDEX_MAX` — and
 * every consumer references those identifiers rather than restating a number.
 *
 * Flagged:
 *   - a numeric literal passed to `maxItems` / `maxImages` / `maxVideos`
 *   - `images: z.array(...).max(<number>)`
 *   - a `*_IMAGE_MAX` / `*_VIDEO_MAX` key assigned a numeric literal
 *
 * NOT flagged: the defaults inside `limits.ts` itself (that is the definition),
 * `MediaUploadList`'s own `maxItems = 12` parameter default (a generic
 * component's fallback for the callers that are not product galleries), and
 * per-entity caps for other documents — a blog's content-image allowance and a
 * prize-draw sub-item's two photos are different rules about different things,
 * not drifted copies of this one.
 *
 * Suppression: `// audit-media-limit-ok: <reason>` on the same line or the one
 * above.
 *
 * Exit 0 — clean. Exit 1 — a media count restated as a literal.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git", "__tests__"]);

/** The definition itself, and the generic component's own fallback. */
const ALLOW = new Set([
  "appkit/src/_internal/shared/media/limits.ts",
  "appkit/src/features/media/upload/MediaUploadList.tsx",
]);

/**
 * Files whose media caps govern a DIFFERENT entity. Listed explicitly, with
 * the entity named, so "is this the product rule?" stays a decision someone
 * made rather than a regex accident.
 */
const OTHER_ENTITY = new Map([
  ["appkit/src/features/blog/components/BlogPostForm.tsx", "blog post content/additional images"],
  ["appkit/src/features/catalogue/components/CatalogueItemEditorView.tsx", "personal catalogue item photos"],
  ["appkit/src/features/admin/components/AdminMediaView.tsx", "the standalone admin media tool"],
  ["appkit/src/features/products/components/PrizeDrawItemsEditor.tsx", "per prize-draw SUB-ITEM, not the listing gallery"],
  ["src/actions/review.actions.ts", "review photos"],
  ["appkit/src/features/reviews/api/[id]/route.ts", "review photos"],
]);

const SUPPRESS = /audit-media-limit-ok:/;

const RULES = [
  {
    id: "LITERAL_MAX_ITEMS",
    // maxItems={5} / maxImages={10} / maxVideos={1}
    re: /\b(maxItems|maxImages|maxVideos)\s*=\s*\{\s*(\d+)\s*\}/g,
    msg: (m) => `\`${m[1]}={${m[2]}}\` — use PRODUCT_MAX_IMAGES / PRODUCT_MAX_VIDEOS`,
  },
  {
    id: "LITERAL_IMAGES_ZOD_MAX",
    re: /images:\s*z\s*\.array\([^)]*\)\s*\.max\(\s*(\d+)/g,
    msg: (m) => `\`images: z.array(...).max(${m[1]})\` — use PRODUCT_MAX_IMAGES`,
  },
  {
    id: "LITERAL_CONTEXT_LIMIT",
    /*
     * The PRODUCT FAMILY only — product, auction, pre-order. Those three are
     * one flat rule by decision, so a literal in any of them is drift.
     *
     * REVIEW_/EVENT_/BLOG_/RICH_TEXT_ caps live in the same object and are
     * deliberately NOT matched: they govern other entities with their own
     * allowances. A rule broad enough to catch them would either force nine
     * unrelated caps through one product constant, or teach people to
     * suppress it — and a suppressed audit is a decoration.
     */
    re: /\b((?:PRODUCT|AUCTION|PREORDER)_(?:IMAGE|VIDEO)_MAX)\s*:\s*(\d+)/g,
    msg: (m) => `\`${m[1]}: ${m[2]}\` — use PRODUCT_IMAGE_INDEX_MAX / PRODUCT_MAX_VIDEOS`,
  },
];

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(full);
  }
  return out;
}

const rel = (f) => relative(ROOT, f).split("\\").join("/");

function main() {
  const violations = [];

  for (const root of SCAN) {
    try { statSync(root); } catch { continue; }
    for (const file of walk(root)) {
      const relPath = rel(file);
      if (ALLOW.has(relPath) || OTHER_ENTITY.has(relPath)) continue;

      const raw = readFileSync(file, "utf8");
      // Strip comments first: this audit's own docstring quotes every pattern
      // it blocks, and four previous audits shipped flagging their own
      // documentation.
      const src = stripComments(raw);
      const rawLines = raw.split(/\r?\n/);
      const lines = src.split(/\r?\n/);

      for (const rule of RULES) {
        rule.re.lastIndex = 0;
        let m;
        while ((m = rule.re.exec(src)) !== null) {
          const line = src.slice(0, m.index).split(/\r?\n/).length;
          const here = rawLines[line - 1] ?? "";
          const above = rawLines[line - 2] ?? "";
          if (SUPPRESS.test(here) || SUPPRESS.test(above)) continue;
          violations.push({ file: relPath, line, id: rule.id, msg: rule.msg(m) });
        }
        void lines;
      }
    }
  }

  if (violations.length === 0) {
    console.log(
      `audit-media-limit-literals: clean ✓ (${OTHER_ENTITY.size} non-product media cap(s) excluded by name)`,
    );
    return 0;
  }

  console.error(`audit-media-limit-literals: ${violations.length} violation(s) found.\n`);
  for (const v of violations) {
    console.error(`  [${v.id}] ${v.file}:${v.line}`);
    console.error(`      ${v.msg}`);
  }
  console.error(
    "\n  Product media counts live in appkit/src/_internal/shared/media/limits.ts.",
  );
  console.error(
    "  If this cap governs a different entity, add the file to OTHER_ENTITY with the entity named.",
  );
  return 1;
}

process.exit(main());
