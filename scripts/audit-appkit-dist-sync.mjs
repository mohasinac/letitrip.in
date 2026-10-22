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

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = "appkit/dist";
const INSTALLED = "node_modules/@mohasinac/appkit/dist";

/*
 * ── Paths the package DELIBERATELY does not publish ─────────────────────────
 *
 * 🛑 Derived from appkit's own `files` negations, never hardcoded here. Two
 * lists that must agree is the drift this audit exists to catch, so it reads
 * the manifest instead of keeping a copy of it.
 *
 * `"!dist/seed"` and `"!dist/features/tester/seed-data"` cut ~34 MB of
 * fixtures and generators out of the tarball — seeding is a repo operation and
 * the app imports no seed symbol. A byte-identity check across those paths is
 * therefore asking the installed copy to contain files the package is designed
 * to omit, and it fails on the FIRST publish after the exclusion lands rather
 * than when anything is actually wrong. (It did: 262 differences, every one
 * under `seed/`, on 4.61.0.)
 *
 * The exclusion is one-directional. Under an excluded path, "only in
 * appkit/dist" is the CORRECT state. "Only in installed" or a size mismatch
 * still fails — that would mean a stale resync left published files behind, or
 * someone copied a dist over the installed copy, which is exactly the
 * confusion this audit is for.
 */
function publishExclusions() {
  const manifest = JSON.parse(readFileSync("appkit/package.json", "utf8"));
  return (manifest.files ?? [])
    .filter((f) => f.startsWith("!"))
    .map((f) => f.slice(1).replace(/^dist\//, "").replace(/\/$/, ""))
    .filter(Boolean);
}

const EXCLUDED = publishExclusions();

/** Is this dist-relative path inside a path the tarball excludes? */
function isUnpublished(rel) {
  return EXCLUDED.some((e) => rel === e || rel.startsWith(`${e}/`));
}

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

/*
 * ── RULE 2: is dist built from the CURRENT source? ──────────────────────────
 *
 * 🛑 Rule 1 below compares the two dist COPIES, and that is not the same
 * invariant. Measured 2026-10-12: this audit printed "4909 files,
 * byte-identical" while BOTH copies were built from a source commit two merges
 * old — so the consumer was compiling deep subpath imports against a
 * package.json that did not declare them yet, and the only gate that could
 * have noticed said OK. Agreeing with each other is not agreeing with src/.
 *
 * `dist/.build-stamp.json` (written by appkit's build chain) records the source
 * commit. Comparing it to appkit's current HEAD makes staleness provable.
 *
 * Three deliberate non-failures, because a check that fires when it cannot
 * prove anything is a check people stop reading:
 *
 *   - NO STAMP: a dist built before the stamp existed, or a published tarball.
 *     Reported, not failed.
 *   - DIRTY TREE at build time: normal during development, and the sha alone
 *     cannot then describe what was compiled. Reported, not failed.
 *   - DIRTY TREE now: the source has uncommitted edits, so a sha match proves
 *     nothing either way. Reported, not failed.
 *
 * What DOES fail is unambiguous: a clean tree whose HEAD differs from the sha
 * dist was built at. That is exactly the merge/checkout case.
 */
function gitIn(dir, args) {
  const r = spawnSync("git", args, { cwd: dir, encoding: "utf8" });
  return r.status === 0 ? String(r.stdout).trim() : null;
}

const STAMP_PATH = join(SRC, ".build-stamp.json");
if (existsSync(STAMP_PATH)) {
  let stamp = null;
  try {
    stamp = JSON.parse(readFileSync(STAMP_PATH, "utf8"));
  } catch {
    console.error(`[audit-appkit-dist-sync] ${STAMP_PATH} is unreadable — rebuild appkit.`);
    process.exit(1);
  }
  const head = gitIn("appkit", ["rev-parse", "HEAD"]);
  const dirtyNow = (gitIn("appkit", ["status", "--porcelain"]) ?? "").length > 0;

  if (head && stamp.head && head !== stamp.head && !dirtyNow && stamp.dirty === false) {
    console.error(
      `[audit-appkit-dist-sync] STRICT-ZERO: dist is STALE against appkit's source.\n\n` +
        `    dist was built from  ${String(stamp.head).slice(0, 12)}` +
        `${stamp.branch ? ` (${stamp.branch})` : ""} at ${stamp.builtAt}\n` +
        `    appkit HEAD is now   ${head.slice(0, 12)}\n\n` +
        `  Both dist copies can be byte-identical to each other and still be built\n` +
        `  from the wrong commit — which is how a merge shipped consumer imports\n` +
        `  against a package.json that did not declare those subpaths yet.\n\n` +
        `  Fix:  npm --prefix ./appkit run build\n` +
        `        rm -rf node_modules/@mohasinac/appkit/dist\n` +
        `        cp -r appkit/dist node_modules/@mohasinac/appkit/dist\n` +
        `        cp appkit/package.json node_modules/@mohasinac/appkit/package.json\n`,
    );
    process.exit(1);
  }
  if (stamp.dirty || dirtyNow) {
    console.log(
      `[audit-appkit-dist-sync] provenance UNPROVABLE — ` +
        `${stamp.dirty ? "dist was built from a dirty tree" : "appkit has uncommitted changes"}; ` +
        "a sha match would not mean anything. Rule 1 still applies.",
    );
  }
} else {
  console.log(
    "[audit-appkit-dist-sync] no dist/.build-stamp.json — cannot check src -> dist provenance " +
      "(dist predates the stamp, or is an unpacked tarball). Rule 1 still applies.",
  );
}

/* ── RULE 1: do the two dist copies agree? ─────────────────────────────────── */
const a = index(SRC);
const b = index(INSTALLED);

/*
 * One-directional, per the EXCLUDED note at the top: a file the tarball omits
 * is EXPECTED to be absent from the installed copy, so filter it out of
 * `onlyLocal` only. `onlyInstalled` and the content comparison stay complete —
 * an excluded path PRESENT in node_modules means somebody copied a repo dist
 * over the installed one, which is the confusion this audit exists to name.
 */
const onlyLocal = [...a.keys()].filter((k) => !b.has(k) && !isUnpublished(k));
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
