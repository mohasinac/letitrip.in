#!/usr/bin/env node
/**
 * audit-public-test-data-leak — strict-zero.
 *
 * A PUBLIC server-rendered view that reads a repository must strip
 * tester-sandbox rows before it renders them.
 *
 * ## Why this exists
 *
 * The sandbox fixtures are deliberately ordinary public documents — active,
 * `isPublic`, indexed — so testers exercise the real browse, search and
 * checkout paths rather than a mock. The only thing keeping them out of a
 * stranger's view is an application-layer filter, and it is easy to forget
 * because forgetting produces a page that looks completely normal: it just has
 * a few extra products on it.
 *
 * Measured in production on 2026-09-01, immediately after a reseed:
 *
 *   /              44 sandbox mentions   (10 bundles, 8 events, 5 brands, 4 categories)
 *   /categories    21
 *   /events        20
 *   /stores         5   — a rendered card linking to `store-tester-sandbox`
 *   /bundles        6
 *   /blog           3
 *
 * Every one of those pages had an API counterpart that filtered correctly. The
 * SSR view called the repository directly and did not, so the first paint
 * published the sandbox and the client refetch quietly removed it — which is
 * why it survived: by the time anyone looked, it was gone.
 *
 * ## What it flags
 *
 * A file under a PUBLIC view/data path that calls a repository LIST method and
 * never mentions `hidePublicTestData` / `filterTestDataForViewer` / `viewer`.
 *
 * Dashboard views (`admin/`, `seller/`, `account/`) are excluded by path: staff
 * are supposed to see the sandbox, and demanding the filter there would be
 * wrong rather than merely noisy.
 *
 * Suppression: `// audit-public-test-data-ok: <reason>` — for a read whose
 * collection genuinely has no `isTestData` concept.
 *
 * Exit 0 — clean.  Exit 1 — a public read that could publish the sandbox.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const OK_RE = /\/\/\s*audit-public-test-data-ok\s*:/i;

/**
 * Public surfaces only. A dashboard is excluded because staff SHOULD see the
 * sandbox — flagging those would be telling correct code it is wrong, which is
 * how an audit teaches people to ignore it.
 */
const PUBLIC_DIRS = [
  "appkit/src/features/blog/components",
  "appkit/src/features/categories/components",
  "appkit/src/features/events/components",
  "appkit/src/features/homepage/components",
  "appkit/src/features/products/components",
  "appkit/src/features/reviews/components",
  "appkit/src/features/stores/components",
  "appkit/src/_internal/server/features/bundles",
  "appkit/src/_internal/server/features/categories",
  "appkit/src/_internal/server/features/blog",
  "appkit/src/_internal/server/features/events",
  "appkit/src/_internal/server/features/stores",
  /*
   * 🛑 `actions/` too, and that was not obvious.
   *
   * The first version of this list held only `components/` and
   * `_internal/server/features/`. It passed clean while the HOMEPAGE was still
   * leaking 39 sandbox rows, because the homepage does not call a repository —
   * it calls `listTopLevelCategories`, `listBrandCategories`, `listPublicEvents`
   * and `getFeaturedBlogPosts`, which live here. A rule that cannot see a path
   * does not cover it, however green it reports.
   */
  "appkit/src/features/categories/actions",
  "appkit/src/features/events/actions",
  "appkit/src/features/blog/actions",
  "appkit/src/features/products/actions",
  "appkit/src/features/stores/actions",
];

/** A repository call that returns MANY rows — the shape that can leak. */
const LIST_CALL_RE =
  /\b(\w+Repository)\s*\n?\s*\.\s*(list|listAll|listPublished|listStores|listByType|findActiveBrands|getCategoriesByTier|findByCategory|facetCounts\w*)\s*\(/g;

/** Any of the sanctioned ways to say "the sandbox is handled here". */
const FILTERED_RE =
  /hidePublicTestData|filterTestDataForViewer|filterSingleTestData|hidePublicTestDoc|viewer\b/;

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (name === "node_modules" || name === "dist" || name === "__tests__") continue;
      walk(full, out);
    } else if (/\.tsx?$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Strip comments AND import statements.
 *
 * 🛑 The import line matters. `EventRafflesSection` imported
 * `hidePublicTestData` and never called it — a half-applied edit — and this
 * audit reported the file clean because the identifier appeared SOMEWHERE in
 * the source. An unused import is precisely the state a forgotten filter leaves
 * behind, so it is the one thing that must not count as evidence.
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/^\s*import\s[\s\S]*?;\s*$/gm, "");
}

const findings = [];
for (const rel of PUBLIC_DIRS) {
  for (const file of walk(join(ROOT, rel))) {
    const raw = readFileSync(file, "utf8");
    if (OK_RE.test(raw)) continue;
    const src = stripComments(raw);
    LIST_CALL_RE.lastIndex = 0;
    const calls = [...src.matchAll(LIST_CALL_RE)];
    if (calls.length === 0) continue;
    if (FILTERED_RE.test(src)) continue;
    const line = src.slice(0, calls[0].index).split(/\r?\n/).length;
    findings.push({
      rel: relative(ROOT, file).replace(/\\/g, "/"),
      line,
      call: `${calls[0][1]}.${calls[0][2]}()`,
    });
  }
}

if (findings.length > 0) {
  console.error(
    `[audit-public-test-data-leak] ${findings.length} public read(s) that never strip sandbox rows:\n`,
  );
  for (const f of findings) {
    console.error(`  ${f.rel}:${f.line}  ${f.call}`);
    console.error(
      `    Wrap the rows in \`hidePublicTestData(...)\` before rendering them, or thread a real`,
    );
    console.error(
      `    viewer. A sandbox fixture on a public page looks exactly like real content.\n`,
    );
  }
  process.exit(1);
}

console.log(
  `[audit-public-test-data-leak] OK — every public list read strips sandbox rows ` +
    `(${PUBLIC_DIRS.length} directories scanned).`,
);
process.exit(0);
