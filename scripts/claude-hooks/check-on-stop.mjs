#!/usr/bin/env node
/**
 * Claude Code Stop hook — runs the fast quality gates after each assistant turn.
 *
 * 🛑 THIS FILE NO LONGER LISTS AUDITS.
 *
 * It used to carry its own hand-written array of ~83 checks beside the 148-entry
 * registry in `scripts/run-audits.mjs`, and the two drifted exactly as two
 * hand-maintained lists of one thing always do: **73 registered audits had never
 * run in this hook**, among them `pii-crypto`, `public-projection-parity`,
 * `permission-role-mismatch`, `silent-degrade`, `searchtxt-migration`,
 * `filter-tab-enums` and `listing-sort-fields`. The registry's own comment
 * acknowledged the split and asked readers to keep the two in sync by hand.
 *
 * Now it imports `AUDITS` and runs everything not marked `slow: true`, so a
 * newly registered audit is covered here the moment it is added — no second
 * edit, nothing to forget.
 *
 * Heavy gates (`tsc` + `eslint`) still live only in `npm run check`; they are
 * minutes, not seconds.
 *
 * ── Concurrency ─────────────────────────────────────────────────────────────
 * Nearly all of the wall-clock cost is Node process startup, not any single
 * expensive audit — 148 audits at ~0.4s each is ~60s sequential, and the
 * previous 83-check sequential version already cost 27s per turn despite a
 * docstring claiming "~3-5s". Running them concurrently turns that back into a
 * few seconds. Audits are pure readers — they scan files and exit — so they are
 * safe to run in parallel; none writes to the tree.
 *
 * ── Exit semantics (Claude Code Stop hook) ──────────────────────────────────
 *   - exit 0 → silent pass
 *   - exit 2 → blocks the stop and surfaces stderr to the model so it can fix
 *   - other  → non-blocking error shown to the user
 *
 * Reads stop_hook_active from stdin to avoid infinite loops; if true, exits 0.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { cpus } from "node:os";

import { AUDITS } from "../run-audits.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

// Read hook input from stdin to detect re-entry; bail if Claude is already
// responding to a previous block from this same hook.
let payload = {};
try {
  const raw = readFileSync(0, "utf8");
  if (raw.trim()) payload = JSON.parse(raw);
} catch {
  // No stdin or non-JSON; treat as empty payload.
}
if (payload.stop_hook_active === true) process.exit(0);

const selected = AUDITS.filter((a) => !a.slow);

/**
 * Spawn one audit and capture its output.
 *
 * Mirrors `runAudit` in run-audits.mjs, with two differences: output is
 * captured rather than inherited (the hook only reports failures), and a
 * missing script is a FAILURE rather than a skip — a check that silently
 * stopped existing is precisely the kind of gap this hook exists to catch.
 */
function runAudit(audit) {
  return new Promise((resolve) => {
    let cmd, args, opts;
    if (audit.kind === "npm-prefix") {
      cmd = process.platform === "win32" ? "npm.cmd" : "npm";
      args = ["--prefix", audit.prefix, "run", audit.script];
      // Node 20+ requires shell:true to spawn .cmd/.bat on Windows.
      opts = { cwd: ROOT, shell: process.platform === "win32" };
    } else {
      if (!existsSync(join(ROOT, audit.script))) {
        resolve({ name: audit.name, ok: false, output: `script not found: ${audit.script}` });
        return;
      }
      cmd = process.execPath;
      args = [audit.script];
      opts = { cwd: ROOT, env: audit.env ? { ...process.env, ...audit.env } : process.env };
    }

    const child = spawn(cmd, args, { ...opts, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("error", (err) =>
      resolve({ name: audit.name, ok: false, output: `spawn error: ${err.message}` }),
    );
    child.on("close", (code) => resolve({ name: audit.name, ok: code === 0, output: out }));
  });
}

/** Bounded-concurrency map — a worker pool over one shared cursor. */
async function runAll(audits, limit) {
  const results = [];
  let cursor = 0;
  const worker = async () => {
    while (cursor < audits.length) {
      const audit = audits[cursor++];
      results.push(await runAudit(audit));
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, audits.length) }, worker));
  return results;
}

// Leave headroom: the editor, the language server and any dev server are also
// on this machine. Mirrors the cap the Agent tooling uses.
const CONCURRENCY = Math.max(2, Math.min(12, cpus().length - 2));

const results = await runAll(selected, CONCURRENCY);
const failures = results.filter((r) => !r.ok);

if (failures.length === 0) process.exit(0);

const banner =
  "\n========================================================\n" +
  "Quality gate failure — fix before reporting work complete.\n" +
  "Run `npm run check` locally for the full set including tsc + lint.\n" +
  "========================================================\n";

process.stderr.write(banner);
for (const f of failures) {
  process.stderr.write(`\n[${f.name}]\n${f.output}\n`);
}
process.exit(2);
