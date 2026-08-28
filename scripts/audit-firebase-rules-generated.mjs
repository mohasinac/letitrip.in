#!/usr/bin/env node
/**
 * audit-firebase-rules-generated.mjs
 *
 * The four Firebase config files at the repo root are GENERATED from
 * `appkit/firebase/base/` by `appkit/scripts/firebase-merge.mjs`, and they are
 * also what `firebase.json` DEPLOYS. This audit fails when the committed copies
 * do not match what the generator produces today.
 *
 * WHY
 *   Three things conspired to make drift not just possible but likely:
 *
 *   1. All four files were listed in `.gitignore` AND tracked in git at the
 *      same time. `.gitignore` has no effect on an already-tracked path, so
 *      they kept taking commits while everyone was conditioned to treat them
 *      as noise in `git status`.
 *   2. `appkit` is a git SUBMODULE. Bumping it can change
 *      `appkit/firebase/base/database.rules.json` with nothing in the consumer
 *      repo reminding anyone to regenerate — the stale root copy is what
 *      deploys.
 *   3. No CI step regenerates and diffs. Neither workflow references
 *      `firebase-merge` or `firebase -- generate`.
 *
 *   The failure is silent and it is a SECURITY failure: the rules that ship are
 *   whatever was last committed, not what the source says. A rule tightened in
 *   the base — say, closing a public `.read` — would never reach production.
 *
 * HOW
 *   Runs the REAL generator (no reimplementation of the merge logic, which
 *   would be its own drift) in a temp directory: `firebase-merge.mjs` resolves
 *   its base dir from its own `__dirname` but writes to `process.cwd()`, so
 *   spawning it with `cwd` set to a temp dir that holds a copy of
 *   `appkit.config.js` produces the expected output without touching the repo.
 *
 * FIX when it fails
 *   `npm run firebase -- generate`, then commit the result. If you were trying
 *   to author a project-specific rule, put it in `appkit.config.js` under
 *   `firebase.extensions.{database,indexes,firestoreRules,storageRules}` —
 *   hand-editing a generated file is overwritten by the next generate.
 *
 * Strict-zero. No suppression marker: a generated file either matches its
 * source or it does not.
 */

import { readFileSync, existsSync, mkdtempSync, copyFileSync, rmSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/** Written by firebase-merge into the consumer root. */
const GENERATED = [
  "database.rules.json",
  "firestore.rules",
  "firestore.indexes.json",
  "storage.rules",
];

const MERGE_SCRIPT = join(ROOT, "appkit", "scripts", "firebase-merge.mjs");

if (!existsSync(MERGE_SCRIPT)) {
  // The appkit submodule is not checked out. Not this audit's business to fail
  // the build over — every other appkit-dependent audit would already be down.
  console.log(
    "[audit-firebase-rules-generated] SKIP — appkit submodule not present",
  );
  process.exit(0);
}

let tmp;
try {
  tmp = mkdtempSync(join(tmpdir(), "lir-fbrules-"));

  // The generator reads consumer extensions from CWD; give it the real ones.
  for (const name of ["appkit.config.js", "appkit.config.mjs", "appkit.config.cjs"]) {
    const src = join(ROOT, name);
    if (existsSync(src)) copyFileSync(src, join(tmp, name));
  }

  const run = spawnSync(process.execPath, [MERGE_SCRIPT], {
    cwd: tmp,
    encoding: "utf8",
  });

  if (run.status !== 0) {
    console.error(
      "\n[audit-firebase-rules-generated] the generator itself failed:\n",
    );
    console.error(run.stderr || run.stdout || "(no output)");
    process.exit(1);
  }

  const drifted = [];
  for (const name of GENERATED) {
    const expectedPath = join(tmp, name);
    const actualPath = join(ROOT, name);

    if (!existsSync(expectedPath)) continue; // generator does not emit this one
    if (!existsSync(actualPath)) {
      drifted.push({ name, reason: "missing from the repo root" });
      continue;
    }

    // Compare on normalised line endings — the repo is checked out on Windows
    // with autocrlf, and a CRLF/LF difference is not drift.
    const expected = readFileSync(expectedPath, "utf8").replace(/\r\n/g, "\n");
    const actual = readFileSync(actualPath, "utf8").replace(/\r\n/g, "\n");
    if (expected !== actual) {
      drifted.push({ name, reason: "differs from generated output" });
    }
  }

  if (drifted.length > 0) {
    console.error(
      `\n[audit-firebase-rules-generated] ${drifted.length} generated file(s) out of date:\n`,
    );
    for (const d of drifted) console.error(`  ${d.name} — ${d.reason}`);
    console.error(
      `\n  These files are what firebase.json DEPLOYS. A stale copy means the rules\n` +
        `  running in production are not the rules in appkit/firebase/base/ — including\n` +
        `  any tightening you thought you had shipped.\n\n` +
        `  Fix: npm run firebase -- generate   (then commit the result)\n\n` +
        `  Authoring a project-specific rule? It belongs in appkit.config.js under\n` +
        `  firebase.extensions.{database,indexes,firestoreRules,storageRules}.\n` +
        `  Hand-editing a generated file is overwritten by the next generate.\n`,
    );
    process.exit(1);
  }

  console.log(
    `[audit-firebase-rules-generated] OK — ${GENERATED.length} generated file(s) match their source`,
  );
  process.exit(0);
} finally {
  if (tmp) {
    try {
      rmSync(tmp, { recursive: true, force: true });
    } catch {
      /* temp cleanup is best-effort */
    }
  }
}
