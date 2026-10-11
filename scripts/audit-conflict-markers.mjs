#!/usr/bin/env node
/*
 * No tracked file may carry an unresolved merge-conflict marker.
 *
 * 🛑 THE BUG THIS EXISTS FOR WAS COMMITTED, PUSHED, AND INVISIBLE TO EVERY
 * OTHER GATE. `appkit/scripts/fix-esm-extensions.mjs` was committed with three
 * `<<<<<<< / ======= / >>>>>>>` hunks still in it. The result:
 *
 *     SyntaxError: Unexpected token '<<'
 *
 * and it surfaced ONLY when `npm run build` happened to execute that script.
 * Nothing else could see it:
 *
 *   - `tsc` never reads `scripts/*.mjs` — they are outside both tsconfigs.
 *   - eslint does not lint them either (`scripts/` is not in its file globs).
 *   - no audit looked for markers, in any file type.
 *
 * So a build-tooling file, a `.json`, a `.css`, a `.md` or a `.mjs` can ship
 * broken indefinitely. The two sibling defects in that same commit (a stray
 * `sxdexport`, a barrel re-exporting an undeclared symbol) were both caught by
 * `tsc` the moment anyone ran it. This one was not catchable at all.
 *
 * ── WHY THE PATTERNS ARE ANCHORED AND SPECIFIC ──────────────────────────────
 *
 * 🛑 A naive search for `=======` has a FALSE POSITIVE RATE THAT WOULD KILL THE
 * AUDIT. This repo's own source is full of comment banners like
 *
 *     // ============================================
 *
 * and `src/validation/request-schemas.ts` alone has five. A rule people learn
 * to ignore is worse than no rule, so:
 *
 *   - every pattern is anchored to START OF LINE (`^`), because a real marker
 *     is always at column 0;
 *   - `<<<<<<< ` and `>>>>>>> ` require a TRAILING SPACE, since git always
 *     writes a label after them (`<<<<<<< HEAD`);
 *   - `=======` must be the WHOLE line — exactly seven, nothing after. A banner
 *     of 40 equals signs does not match, and neither does `======= foo`.
 *   - the `=======` separator alone is NOT reported. It is the ambiguous one,
 *     and a file containing it without an opener is far more likely to be
 *     documentation. A real conflict always has `<<<<<<< ` or `>>>>>>> `.
 *
 * Verified by negative control, per Root Cause #87 — never trust a gate you
 * have not seen fire. Running this against the real conflicted file reported
 * all three hunks; running it against `request-schemas.ts` reports nothing.
 *
 * ── SCOPE ───────────────────────────────────────────────────────────────────
 *
 * Tracked files only, via `git ls-files`, in BOTH this repo and the appkit
 * submodule — the defect was in appkit, and an audit that only looked at the
 * consumer would have missed the very case it was written for. Untracked files
 * are deliberately out of scope: a marker in a scratch file harms nobody, and
 * including them would flag any half-done local merge.
 *
 * Binary and vendored paths are skipped; everything else is read as text,
 * including .md and .json, because a conflicted lockfile or a conflicted doc is
 * exactly as broken as a conflicted script.
 *
 * Usage: node scripts/audit-conflict-markers.mjs
 *
 * @tag domain:build
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:none — pure reads
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/* Each repo to sweep: a label and its working directory. */
const REPOS = [
  { label: "consumer", dir: ROOT },
  { label: "appkit", dir: join(ROOT, "appkit") },
];

/*
 * Extensions that are never text, or are vendored copies we do not author.
 * A conflict marker cannot meaningfully exist in a PNG, and reading one wastes
 * time on every run.
 */
const SKIP_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg",
  ".woff", ".woff2", ".ttf", ".eot",
  ".mp4", ".webm", ".mp3", ".wav",
  ".pdf", ".zip", ".gz", ".tgz",
]);

/* Anything over this is not hand-authored; lockfiles are the exception and are
 * allowed through explicitly because a conflicted lockfile is a real hazard. */
const MAX_BYTES = 4 * 1024 * 1024;
const ALWAYS_READ = new Set(["package-lock.json", "pnpm-lock.yaml", "yarn.lock"]);

/**
 * Markers, in the strict form git actually writes. See the header for why each
 * is anchored and why `=======` alone is not reported.
 */
const MARKERS = [
  { re: /^<<<<<<< .*$/m, label: "<<<<<<< (ours)" },
  { re: /^>>>>>>> .*$/m, label: ">>>>>>> (theirs)" },
  { re: /^\|\|\|\|\|\|\| .*$/m, label: "||||||| (base, diff3)" },
];

function trackedFiles(dir) {
  const r = spawnSync("git", ["ls-files", "-z"], {
    cwd: dir,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) return null;
  return String(r.stdout).split("\0").filter(Boolean);
}

const findings = [];
let scanned = 0;
let skipped = 0;

for (const repo of REPOS) {
  if (!existsSync(repo.dir)) continue;
  const files = trackedFiles(repo.dir);
  if (files === null) {
    console.error(`[audit-conflict-markers] cannot list tracked files in ${repo.label} — is it a git repo?`);
    process.exit(2);
  }

  for (const rel of files) {
    const base = rel.split("/").pop() ?? rel;
    const dot = base.lastIndexOf(".");
    const ext = dot > 0 ? base.slice(dot).toLowerCase() : "";
    if (SKIP_EXT.has(ext)) { skipped += 1; continue; }

    const abs = join(repo.dir, rel);
    let text;
    try {
      if (!ALWAYS_READ.has(base) && statSync(abs).size > MAX_BYTES) { skipped += 1; continue; }
      text = readFileSync(abs, "utf8");
    } catch {
      /* A tracked path that cannot be read (deleted locally, permissions) is
       * not this audit's business to report — it would fire on every
       * half-finished checkout. */
      skipped += 1;
      continue;
    }

    scanned += 1;
    /* Cheap reject first: the vast majority of files contain no run of seven
     * identical marker characters at all, and substring search is far cheaper
     * than three multiline regexes. */
    if (!text.includes("<<<<<<<") && !text.includes(">>>>>>>") && !text.includes("|||||||")) continue;

    const lines = text.split(/\r?\n/);
    for (const { re, label } of MARKERS) {
      const single = new RegExp(re.source.replace(/^\^|\$$/g, (m) => m));
      lines.forEach((line, i) => {
        if (single.test(line) && (line.startsWith("<<<<<<< ") || line.startsWith(">>>>>>> ") || line.startsWith("||||||| "))) {
          findings.push({ repo: repo.label, rel, line: i + 1, label, text: line.slice(0, 80) });
        }
      });
    }
  }
}

console.log(
  `[audit-conflict-markers] ${scanned} tracked text file(s) scanned across ${REPOS.length} repo(s) · ${skipped} skipped (binary/large)`,
);

if (findings.length) {
  console.error(`\n✗ ${findings.length} unresolved conflict marker(s) in TRACKED files:\n`);
  for (const f of findings) {
    console.error(`    ${f.repo}: ${f.rel}:${f.line}  ${f.label}`);
    console.error(`      ${f.text}`);
  }
  console.error(
    "\n  These are committed, so every clone has them. Resolve the merge and commit\n" +
      "  the resolution. 🛑 Note tsc and eslint CANNOT see this class of defect in\n" +
      "  scripts/, .json, .css or .md — a conflicted build script fails only when\n" +
      "  something happens to execute it, which is how one shipped.",
  );
  process.exit(1);
}

console.log("✓ no tracked file carries an unresolved conflict marker");
