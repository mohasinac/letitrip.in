#!/usr/bin/env node
/**
 * audit-functions-bundle-freshness.mjs — a stale `functions/lib` silently
 * serves pre-fix query semantics to every public listing page.
 *
 * WHY THIS EXISTS
 *
 * `functions/node_modules/@mohasinac/appkit` is a symlink to `../appkit`, and
 * the Functions bundle is built with tsup, which INLINES whatever `appkit/dist`
 * held at build time. So `functions/lib/index.js` is a frozen snapshot of appkit,
 * not a live reference to it. Rebuilding `appkit/dist` does not update it.
 *
 * That matters because `src/app/api/products/route.ts` PREFERS the deployed
 * `listingProcessor` Function over the local repository (data locality), and
 * both are supposed to share identical Sieve filter logic. When the bundle is
 * stale, they don't — and the divergence is invisible:
 *
 *   Found 2026-08-21. The `FILTER_ALIASES.listingType` fix that taught the
 *   alias to split a pipe-joined OR-group (`art|stickers`) before validating
 *   each token landed in appkit, but `functions/lib` still carried the
 *   pre-fix version that tested the whole pipe-string as one token. It never
 *   matched, the alias returned "", the clause was dropped, and the ONLY
 *   surviving filter was `status==published` — so /products returned every
 *   listing type regardless of what the page asked for. No error, no log,
 *   no failing test. The symptom was a Sticker Sheet card on a page whose
 *   own chips said it only showed 4 other types.
 *
 * WHAT IT CHECKS
 *
 *   1. FRESHNESS — `functions/lib/index.js` mtime must be >= the newest mtime
 *      under `appkit/dist`. A bundle older than the source it inlined is stale
 *      by construction.
 *   2. TOKENS — belt-and-braces for the case where the bundle is newer but was
 *      built from a bad tree: specific correctness-critical strings must be
 *      present in the built output. Extend REQUIRED_TOKENS whenever a fix lands
 *      in appkit whose absence from the Function would be silently wrong.
 *
 * Skips (exit 0) when `functions/lib/index.js` doesn't exist — a fresh clone
 * has no build output and that is not a violation.
 *
 * Strict zero — any violation blocks.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUNDLE = join(ROOT, "functions/lib/index.js");
const APPKIT_DIST = join(ROOT, "appkit/dist");

/**
 * Strings that MUST appear in the built Functions bundle. Each entry names the
 * appkit fix it proves is present, so a future reader knows why removing it
 * would be wrong rather than treating it as an arbitrary grep.
 *
 * @type {{ token: string, proves: string }[]}
 */
const REQUIRED_TOKENS = [
  {
    token: "Unknown listingType filter value",
    proves:
      "FILTER_ALIASES.listingType splits pipe-joined OR-groups before validating each " +
      "token (products.repository.ts). Without it, every multi-type listing query " +
      "(/products, /art) silently drops its listingType clause entirely.",
  },
];

/** Newest mtime (ms) anywhere under `dir`. Returns 0 when the dir is absent. */
function newestMtime(dir) {
  if (!existsSync(dir)) return 0;
  let newest = 0;
  /** @type {string[]} */
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (!entry.isFile()) continue;
      try {
        const { mtimeMs } = statSync(full);
        if (mtimeMs > newest) newest = mtimeMs;
      } catch {
        // A file removed mid-walk can't be stale-checked — skip it.
      }
    }
  }
  return newest;
}

function iso(ms) {
  return new Date(ms).toISOString();
}

function main() {
  if (!existsSync(BUNDLE)) {
    console.log(
      "audit-functions-bundle-freshness: skipped (functions/lib/index.js not built yet)",
    );
    process.exit(0);
  }

  /** @type {string[]} */
  const violations = [];

  const bundleMtime = statSync(BUNDLE).mtimeMs;
  const distMtime = newestMtime(APPKIT_DIST);

  if (distMtime > bundleMtime) {
    violations.push(
      `STALE_BUNDLE — functions/lib/index.js (${iso(bundleMtime)}) is older than the ` +
        `newest file in appkit/dist (${iso(distMtime)}).\n` +
        `    tsup inlines appkit at build time, so the Function is running an older copy ` +
        `of appkit than the app is.\n` +
        `    Fix: npm --prefix functions run build`,
    );
  }

  const bundleSrc = readFileSync(BUNDLE, "utf8");
  for (const { token, proves } of REQUIRED_TOKENS) {
    if (!bundleSrc.includes(token)) {
      violations.push(
        `MISSING_TOKEN — "${token}" is absent from the built bundle.\n` +
          `    Proves: ${proves}\n` +
          `    Fix: rebuild appkit (npm --prefix appkit run build), then ` +
          `npm --prefix functions run build`,
      );
    }
  }

  if (violations.length === 0) {
    console.log(
      `audit-functions-bundle-freshness: clean ✓ (bundle ${iso(bundleMtime)}, ` +
        `${REQUIRED_TOKENS.length} token(s) verified)`,
    );
    process.exit(0);
  }

  console.error(
    `audit-functions-bundle-freshness: ${violations.length} violation(s) found.\n`,
  );
  console.error(
    "A stale Functions bundle serves different query semantics than the app,",
  );
  console.error("with no error anywhere. See this script's header for the full writeup.\n");
  for (const v of violations) console.error(`  ${v}\n`);
  process.exit(1);
}

main();
