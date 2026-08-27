#!/usr/bin/env node
/**
 * audit-search-parity — the wiring between a search box and the rows it returns.
 *
 * Every rule here is written against a defect that shipped, and every one of
 * them fails SILENTLY in production: search that returns wrong rows still
 * returns rows, with a 200.
 *
 * R1 BACKFILL_SOURCE_DRIFT
 *   `backfill-search-txt.mjs` re-implements the tokenizer and declares the
 *   source fields per collection, because it must run against a checkout whose
 *   appkit/dist may be stale. That makes it the one place that can disagree
 *   with the write path and never be caught by tsc.
 *
 *   It drifted: the products entry listed 9 sources while
 *   `buildProductSearchTxt` indexed 12, omitting card.setName, card.cardNumber
 *   and grading.service. Zero documents carried them, so it was invisible — but
 *   the first graded listing would have been findable by set name ONLY when
 *   written through the app, never when written by the backfill, with no error
 *   on either side.
 *
 *   This rule cross-checks the field names in the script's SOURCES map against
 *   the matching builder in appkit, per collection.
 *
 * R2 TOKENIZER_CONSTANT_DRIFT
 *   The script's tokenizer must match `appkit/src/utils/search-txt.ts`. If the
 *   caps diverge, the backfill writes tokens the query side cannot match — and
 *   re-running the backfill does NOT fix it, because you must first find the
 *   divergence. Compares MAX_PREFIX_LENGTH / MAX_TOKENS / LONG_WORD_LIMIT.
 *
 * R3 SEARCH_OPT_DROPPED
 *   `searchTxt` matching is `array-contains`, which Sieve cannot express, so a
 *   search term travels OUTSIDE `filters` as an opt. Any executor that
 *   destructures a query and rebuilds it for a downstream call must carry it.
 *   Both product executors dropped it: `defaultExecutor` called
 *   `productRepository.list(model)` with no second argument, so the repository's
 *   token search — fully implemented — was structurally unreachable on every
 *   SSR listing view.
 *
 * Suppression: `// audit-search-parity-ok: <reason>` on the line or the one above.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = process.cwd();
const OK_RE = /\/\/\s*audit-search-parity-ok\s*:/i;

const BACKFILL = join(REPO_ROOT, "appkit", "scripts", "backfill-search-txt.mjs");
const TOKENIZER = join(REPO_ROOT, "appkit", "src", "utils", "search-txt.ts");

/**
 * collection → the appkit module whose builder is the write path, and the
 * function to read the source list out of. Extend when a collection migrates.
 */
const BUILDERS = [
  // Every collection whose write-path derivation lives in the shared builders
  // module. Adding one here is what makes its backfill entry enforced.
  { collection: "products", file: "appkit/src/utils/search-txt-builders.ts", fn: "buildProductSearchTxt" },
  { collection: "stores", file: "appkit/src/utils/search-txt-builders.ts", fn: "buildStoreSearchTxt" },
  { collection: "events", file: "appkit/src/utils/search-txt-builders.ts", fn: "buildEventSearchTxt" },
  { collection: "blogPosts", file: "appkit/src/utils/search-txt-builders.ts", fn: "buildBlogSearchTxt" },
  { collection: "reviews", file: "appkit/src/utils/search-txt-builders.ts", fn: "buildReviewSearchTxt" },
  // faqs predates the shared module and keeps its builder in the repository.
  { collection: "faqs", file: "appkit/src/features/faq/repository/faqs.repository.ts", fn: "buildFaqSearchTxt" },
];

const violations = [];
const push = (rule, detail) => violations.push({ rule, detail });

/**
 * Field paths referenced inside a `[...]` source list, normalised so the two
 * sides are comparable despite writing the same field differently:
 *
 *   builder: `p.specifications?.map((s) => …)`   script: `(d.specifications ?? []).map(…)`
 *   builder: `input.question`                    script: `d.question`
 *
 * The root identifier varies (`p`, `d`, `input`) and is dropped; trailing
 * method calls are dropped. An earlier version required a SINGLE-letter root,
 * so it silently extracted nothing from `buildFaqSearchTxt` — and a rule that
 * extracts nothing compares nothing and passes.
 */
const METHODS = new Set([
  "map", "filter", "join", "replace", "split", "slice", "trim", "flat",
  "toLowerCase", "toUpperCase", "length", "forEach", "some", "includes", "text",
]);

function sourceFields(rawBody) {
  const out = new Set();
  // Comments must not contribute fields. A prose line ending in "…backfill."
  // sat directly above `d.card?.setName`, and with `\s*` spanning newlines the
  // regex glued them into `backfill . d . card . setName` — so the root was not
  // stripped and the field read as `d.card.setName`, which matched nothing on
  // the other side and produced a false positive on a correct file.
  const body = stripComments(rawBody);
  // `[ \t]*`, never `\s*`: a member access does not cross a line here.
  const re = /\b([A-Za-z_$][\w$]*)((?:[ \t]*\??\.[ \t]*[A-Za-z_$][\w$]*)+)/g;
  for (const m of body.matchAll(re)) {
    const segments = m[2]
      .replace(/\s+/g, "")
      .split(/\??\./)
      .filter(Boolean);
    // Drop trailing method calls (`specifications.map` → `specifications`).
    while (segments.length > 0 && METHODS.has(segments[segments.length - 1])) {
      segments.pop();
    }
    if (segments.length === 0) continue;
    out.add(segments.join("."));
  }
  return out;
}

/**
 * Blank out comments while preserving byte offsets, so line numbers stay exact
 * and prose describing a defect never trips the rule against it. Without this,
 * R3 fired on a doc comment that says `productRepository.list()` while
 * explaining the pattern it replaced.
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

/** Extract a balanced `[...]` array literal starting at `from`. */
function arrayLiteralAt(src, from) {
  const start = src.indexOf("[", from);
  if (start === -1) return "";
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  return "";
}

// ---------------------------------------------------------------------------
// R1 + R2 — the backfill script against the write path
// ---------------------------------------------------------------------------
if (existsSync(BACKFILL) && existsSync(TOKENIZER)) {
  const backfill = readFileSync(BACKFILL, "utf8");
  const tokenizer = readFileSync(TOKENIZER, "utf8");

  // R2 — the three caps must agree.
  const CAPS = ["MAX_PREFIX_LENGTH", "MAX_TOKENS", "LONG_WORD_LIMIT"];
  for (const cap of CAPS) {
    const re = new RegExp(`\\b${cap}\\s*=\\s*(\\d+)`);
    const a = backfill.match(re)?.[1];
    const b = tokenizer.match(re)?.[1];
    if (a === undefined || b === undefined) {
      push("TOKENIZER_CONSTANT_DRIFT",
        `${cap} not found in ${a === undefined ? "backfill-search-txt.mjs" : "search-txt.ts"} — ` +
        `the two tokenizers can no longer be compared, which is the state the drift hides in.`);
    } else if (a !== b) {
      push("TOKENIZER_CONSTANT_DRIFT",
        `${cap}: backfill-search-txt.mjs has ${a}, search-txt.ts has ${b}. The backfill would ` +
        `write tokens the query side cannot match, and re-running it does not repair that.`);
    }
  }

  // R1 — per-collection source lists.
  const srcIdx = backfill.indexOf("const SOURCES");
  for (const b of BUILDERS) {
    const file = join(REPO_ROOT, b.file);
    if (srcIdx === -1 || !existsSync(file)) continue;

    const entryIdx = backfill.indexOf(`${b.collection}:`, srcIdx);
    if (entryIdx === -1) {
      push("BACKFILL_SOURCE_DRIFT",
        `backfill-search-txt.mjs SOURCES has no \`${b.collection}\` entry, but ${b.fn} exists — ` +
        `every pre-existing document in that collection is unsearchable until one is added.`);
      continue;
    }
    const scriptFields = sourceFields(arrayLiteralAt(backfill, entryIdx));

    const builderSrc = readFileSync(file, "utf8");
    const fnIdx = builderSrc.indexOf(`function ${b.fn}`);
    if (fnIdx === -1) continue;
    // Anchor on the `buildSearchTxt(` CALL, not the function declaration: the
    // signature ends `): string[]`, so the first `[` after the declaration is
    // the return type. Extracting that yields an empty list and the comparison
    // below then passes vacuously — which is exactly how this rule reported
    // "clean" against a deliberately reintroduced drift.
    const callIdx = builderSrc.indexOf("buildSearchTxt(", fnIdx);
    if (callIdx === -1) continue;
    const builderFields = sourceFields(arrayLiteralAt(builderSrc, callIdx));
    if (builderFields.size === 0) {
      push("BACKFILL_SOURCE_DRIFT",
        `${b.collection}: could not read any source fields out of ${b.fn} — the rule cannot ` +
        `compare, so it must fail rather than pass silently.`);
      continue;
    }

    for (const f of builderFields) {
      if (f === "answer" || f === "text") continue; // resolved via a local var
      if (!scriptFields.has(f)) {
        push("BACKFILL_SOURCE_DRIFT",
          `${b.collection}: \`${b.fn}\` indexes \`${f}\` but backfill-search-txt.mjs does not. ` +
          `Rows written by the app would match a term that backfilled rows never can.`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// R3 — an executor that rebuilds a query must carry `search`
// ---------------------------------------------------------------------------
const EXECUTOR_FILES = [
  "appkit/src/_internal/server/features/products/list-public.ts",
  "src/lib/listing-processor.ts",
];
for (const rel of EXECUTOR_FILES) {
  const file = join(REPO_ROOT, rel);
  if (!existsSync(file)) continue;
  const raw = readFileSync(file, "utf8");
  const src = stripComments(raw);
  const lines = raw.split(/\r?\n/);

  for (const m of src.matchAll(/productRepository\.list\(/g)) {
    const line = src.slice(0, m.index).split(/\r?\n/).length;
    if (OK_RE.test(lines[line - 1] ?? "") || OK_RE.test(lines[line - 2] ?? "")) continue;
    // The call must mention `search` within its argument span.
    const span = src.slice(m.index, m.index + 600);
    if (!/\bsearch\b/.test(span)) {
      push("SEARCH_OPT_DROPPED",
        `${rel}:${line} — productRepository.list() without a \`search\` opt. searchTxt matching is ` +
        `array-contains, which Sieve cannot express, so a term omitted here is silently ignored ` +
        `and the caller gets an unfiltered page with a 200.`);
    }
  }
  for (const m of src.matchAll(/callListingProcessor\(/g)) {
    const line = src.slice(0, m.index).split(/\r?\n/).length;
    if (OK_RE.test(lines[line - 1] ?? "") || OK_RE.test(lines[line - 2] ?? "")) continue;
    const span = src.slice(m.index, m.index + 800);
    if (!/baseOpts/.test(span)) {
      push("SEARCH_OPT_DROPPED",
        `${rel}:${line} — callListingProcessor() without \`baseOpts\`. The Function's lister ` +
        `forwards opts wholesale, so this is where a search term is lost on the delegated path.`);
    }
  }
}

if (violations.length > 0) {
  console.error(`[audit-search-parity] ${violations.length} violation(s):\n`);
  for (const v of violations) console.error(`  [${v.rule}]\n    ${v.detail}\n`);
  console.error("Suppression: // audit-search-parity-ok: <reason>");
  process.exit(1);
}

console.log(
  `[audit-search-parity] OK — 0 violations ` +
  `(${BUILDERS.length} collection(s), ${EXECUTOR_FILES.length} executor file(s))`,
);
