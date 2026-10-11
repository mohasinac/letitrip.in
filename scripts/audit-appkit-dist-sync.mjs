#!/usr/bin/env node
/*
 * STRICT-ZERO: `node_modules/@mohasinac/appkit/dist` must be the dist built
 * from the current `appkit/` source.
 *
 * ## 🛑 Why this audit exists — Root Cause #28, finally given a gate
 *
 * That root cause has bitten repeatedly and has never had a check. Its text
 * ends with the fix ("verify with `diff -rq`, not a single-file diff") and
 * leaves the verifying to discipline, which is why it keeps recurring. The
 * cost on record: `npx appkit-seed load` wrote 972 checklist docs from a stale
 * copy, 22 cases short and missing every new field, reporting
 * `created 972, errors 0`.
 *
 * It bit TWICE more on 2026-10-11 alone:
 *
 *   1. A parallel session's barrel refactor rebuilt `appkit/dist` and did not
 *      resync, so the consumer compiled against a tree matching NEITHER HEAD
 *      — five files out of date, and any failure unattributable.
 *   2. The pin moved to `^4.43.0` (registry) while the installed tree was an
 *      unpublished local build, and **both declared version 4.43.0** — so one
 *      `npm install` would have silently replaced every unpublished change
 *      with the registry copy, and `tsc` would have started failing on
 *      exports that "should" exist with no clue why.
 *
 * ## 🛑 Why CONTENT and not the version string
 *
 * A version check cannot see either failure. Case 2 above had identical
 * versions and different content, which is the whole reason it was dangerous.
 * And a deliberate "bump the source ahead so the numbers differ" scheme makes
 * a version comparison fail permanently during normal development — noise
 * instead of signal.
 *
 * Comparing the trees catches all three real modes: a stale resync after an
 * appkit edit, an `npm install` reverting to the registry, and a partial copy.
 *
 * ## When it SKIPS, and why that is not a hole
 *
 * It skips when `appkit/dist` is absent — which is CI and Vercel, where there
 * is no local build and the registry tarball is the only source. The invariant
 * is specifically about a LOCAL checkout where both copies exist and can
 * disagree. Skipping is reported, never silent.
 */

import { existsSync, readdirSync, statSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = "appkit/dist";
const INSTALLED = "node_modules/@mohasinac/appkit/dist";

/** Walk a tree into a map of relative path -> {size}. */
function index(root) {
  const out = new Map();
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) {
        out.set(relative(root, full).replace(/\\/g, "/"), statSync(full).size);
      }
    }
  };
  walk(root);
  return out;
}

if (!existsSync(SRC)) {
  console.log(
    `[audit-appkit-dist-sync] SKIP — ${SRC} does not exist (no local appkit build; this is the CI/Vercel shape, where the registry tarball is the only copy).`,
  );
  process.exit(0);
}
if (!existsSync(INSTALLED)) {
  console.error(
    `[audit-appkit-dist-sync] ${INSTALLED} is MISSING while ${SRC} exists — the consumer has no appkit to compile against. Run \`npm install\`.`,
  );
  process.exit(1);
}

const a = index(SRC);
const b = index(INSTALLED);

const onlyLocal = [...a.keys()].filter((k) => !b.has(k));
const onlyInstalled = [...b.keys()].filter((k) => !a.has(k));
/*
 * Size first because it is near-free over ~2,400 files, then a content
 * comparison on same-size files. A same-size difference is exactly what the
 * barrel case looks like — one import path swapped for another of equal
 * length — and it is the one a size-only check would miss.
 */
const sameSize = [...a.keys()].filter((k) => b.has(k) && b.get(k) === a.get(k));
const differentSize = [...a.keys()].filter((k) => b.has(k) && b.get(k) !== a.get(k));
const differentContent = sameSize.filter((k) => {
  try {
    return !readFileSync(join(SRC, k)).equals(readFileSync(join(INSTALLED, k)));
  } catch {
    return true;
  }
});

const differing = [...differentSize, ...differentContent];
const total = onlyLocal.length + onlyInstalled.length + differing.length;

if (total === 0) {
  console.log(
    `[audit-appkit-dist-sync] OK — ${a.size} files, byte-identical to the installed copy.`,
  );
  process.exit(0);
}

console.error(
  `[audit-appkit-dist-sync] STRICT-ZERO: ${total} difference(s) between ${SRC} and ${INSTALLED}.\n`,
);
const show = (label, list) => {
  if (list.length === 0) return;
  console.error(`  ${label} (${list.length}):`);
  for (const f of list.slice(0, 10)) console.error(`    ${f}`);
  if (list.length > 10) console.error(`    … and ${list.length - 10} more`);
};
show("only in appkit/dist — the installed copy is STALE", onlyLocal);
show("only in node_modules — a leftover from an older build", onlyInstalled);
show("content differs", differing);

console.error(`
🛑 The consumer is compiling against a different appkit than the source tree.
   Any failure you see may belong to neither. Fix:

     cd appkit && npm run build && cd ..
     rm -rf node_modules/@mohasinac/appkit/dist
     cp -r appkit/dist node_modules/@mohasinac/appkit/dist

   If the pin is \`file:./appkit\`, \`npm install\` does this via the postinstall
   sync. If it is a registry range, the copy is manual until the next publish —
   which is exactly the window this audit covers.

   No suppression marker: the two copies either agree or the build is a lie.
`);
process.exit(1);
