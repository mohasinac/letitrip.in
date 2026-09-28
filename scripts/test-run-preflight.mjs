#!/usr/bin/env node
/*
 * G3 — one command that refuses, before a cycle starts.
 *
 * 🛑 THE FAILURES THIS PREVENTS, each of which has actually happened:
 *
 *  - TESTING A DEGRADED SITE. A run once consumed 47K of the 50K daily Firestore
 *    reads, production began serving 500s, and the run recorded the wreckage as
 *    ~1,187 confident, evidenced, WRONG defects. Every one of them looked real.
 *  - RUNNING THE STALE PLUGIN CACHE. Installing COPIES the plugin into
 *    ~/.claude/plugins/cache/, and the cache wins over `--plugin-dir`. A run
 *    started minutes after a fix still executed the old code and wrote verdict
 *    files with no labels — the bug that had just been fixed, reproduced live, at
 *    full speed, with nothing erroring.
 *  - AN INHERITED IDENTITY. The Playwright MCP reads --storage-state when the
 *    browser CONTEXT IS CREATED. A missing session file does not error; it
 *    silently browses as whoever the previous batch was.
 *
 * Each check answers a question a human would otherwise have to remember to ask,
 * and every one of them is cheap compared to a cycle of wrong verdicts.
 *
 * Usage:  node scripts/test-run-preflight.mjs [--skip-check] [--json]
 *
 * Exit: 0 all clear · 1 one or more checks refused · 2 could not check.
 * `--skip-check` omits the slow `npm run check` (~2-4 min) — for a mid-cycle
 * re-run only, never for the first cycle of a session.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { resolve, join } from "node:path";
import { homedir } from "node:os";
import { RUNS_DIR, REPO, flag, readInflight } from "./lib/test-run.mjs";

const results = [];
const add = (name, ok, detail, fix) => results.push({ name, ok, detail, fix });

/* ── 1. Production health ─────────────────────────────────────────────────── */
{
  const r = spawnSync(process.execPath, ["tester/scripts/verify-prod-health.mjs", "--json"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 90_000,
  });
  let parsed = null;
  try {
    parsed = JSON.parse(String(r.stdout ?? "{}"));
  } catch {
    /* fall through to unhealthy */
  }
  const ok = r.status === 0 && parsed?.healthy === true;
  add(
    "production health",
    ok,
    ok ? (parsed.notes ?? []).join(" · ") : (parsed?.problems ?? ["could not reach the site"]).join(" · "),
    "Do NOT test. Every verdict recorded against a degraded site is evidenced and wrong.",
  );
}

/* ── 2. No batch left in flight ───────────────────────────────────────────── */
{
  const cur = readInflight();
  add(
    "no batch in flight",
    !cur,
    cur ? `${cur.batchKey} claimed as ${cur.identity}, ${cur.casesDone?.length ?? 0} case(s) done` : "clean",
    "node scripts/test-run-inflight.mjs --check   (then tear down and restart that batch)",
  );
}

/* ── 3. Session files present, and guest is empty BY DESIGN ───────────────── */
{
  const missing = [];
  const notes = [];
  for (const role of ["buyer", "seller", "admin", "guest"]) {
    const p = resolve(RUNS_DIR, `session-${role}.json`);
    if (!existsSync(p)) {
      missing.push(role);
      continue;
    }
    let cookies = 0;
    try {
      cookies = (JSON.parse(readFileSync(p, "utf8")).cookies ?? []).length;
    } catch {
      missing.push(`${role} (unparseable)`);
      continue;
    }
    /*
     * Guest is an EMPTY storage state and that is deliberate — "signed out" has
     * to BE a file, because the MCP reads a fixed path and an identity is
     * selected by copying a file over it. Skipping the copy would leave the
     * browser holding the previous batch's session, so every guest case would be
     * performed signed in and answered as though it had not been.
     */
    if (role === "guest" && cookies !== 0) missing.push("guest (should be EMPTY, has cookies)");
    else if (role !== "guest" && cookies === 0) missing.push(`${role} (no cookies)`);
    else notes.push(`${role}:${cookies}`);
  }
  add(
    "session files",
    missing.length === 0,
    missing.length ? `bad: ${missing.join(", ")}` : notes.join(" "),
    "node tester/scripts/fetch-cases.mjs --run <run> …   (it rewrites every session file)",
  );
}

/* ── 4. Plugin cache matches the repo ─────────────────────────────────────── */
{
  const cacheRoot = join(homedir(), ".claude", "plugins", "cache", "letitrip-tools", "tester");
  const hashTree = (root) => {
    if (!existsSync(root)) return null;
    const h = createHash("sha256");
    const walk = (dir, rel = "") => {
      for (const name of readdirSync(dir).sort()) {
        const p = join(dir, name);
        const st = statSync(p);
        if (st.isDirectory()) walk(p, `${rel}${name}/`);
        else if (/\.(mjs|md|json)$/.test(name)) {
          /* Normalise line endings — a CRLF checkout otherwise looks changed forever. */
          h.update(`${rel}${name}\n`);
          h.update(readFileSync(p, "utf8").replace(/\r\n/g, "\n"));
        }
      }
    };
    walk(root);
    return h.digest("hex").slice(0, 16);
  };

  let version = null;
  if (existsSync(cacheRoot)) {
    const versions = readdirSync(cacheRoot).filter((d) => statSync(join(cacheRoot, d)).isDirectory());
    version = versions.sort().pop() ?? null;
  }

  if (!version) {
    add("plugin cache fresh", false, "plugin not installed", "claude plugin install tester@letitrip-tools");
  } else {
    const cacheDir = join(cacheRoot, version);
    const drift = [];
    for (const sub of ["scripts", "skills"]) {
      const a = hashTree(join(REPO, "tester", sub));
      const b = hashTree(join(cacheDir, sub));
      if (a !== b) drift.push(`${sub} (repo ${a ?? "missing"} vs cache ${b ?? "missing"})`);
    }
    add(
      "plugin cache fresh",
      drift.length === 0,
      drift.length ? drift.join("; ") : `v${version} matches repo`,
      "claude plugin uninstall tester && claude plugin install tester@letitrip-tools\n" +
        "       (`claude plugin update` does NOT work for a local-directory marketplace)",
    );
  }
}

/* ── 5. Firestore daily read budget ───────────────────────────────────────── */
{
  let status = null;
  try {
    const { budgetStatus } = await import("../tester/scripts/lib/quota-budget.mjs");
    let state = {};
    const p = resolve(RUNS_DIR, "loop-state.json");
    if (existsSync(p)) {
      try {
        state = JSON.parse(readFileSync(p, "utf8"));
      } catch {
        state = {};
      }
    }
    status = budgetStatus(state);
  } catch {
    status = null;
  }
  if (!status) {
    add("read budget", true, "could not read — not blocking", "");
  } else {
    add(
      "read budget",
      !status.exhausted,
      `${status.used}/${status.limit} batches today (~${status.estimatedReadsUsed?.toLocaleString?.() ?? "?"} reads)`,
      "Wait for the Pacific-midnight reset. The other half of the 50K/day free tier is\n" +
        "       deliberately left for real visitors and scheduled Functions.",
    );
  }
}

/* ── 6. Quality gate ──────────────────────────────────────────────────────── */
if (flag("skip-check") === true) {
  add("npm run check", true, "SKIPPED (--skip-check)", "");
} else {
  const r = spawnSync("npm", ["run", "check"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 600_000,
    shell: true,
  });
  const ok = r.status === 0;
  const tail = String(r.stdout ?? "")
    .split("\n")
    .filter((l) => /error|fail|✗/i.test(l))
    .slice(-3)
    .join(" | ");
  add("npm run check", ok, ok ? "green" : tail || `exit ${r.status}`, "Fix the tree before testing. Never start a cycle red.");
}

/* ── Report ───────────────────────────────────────────────────────────────── */
const failed = results.filter((r) => !r.ok);

if (flag("json") === true) {
  console.log(JSON.stringify({ ok: failed.length === 0, results }));
  process.exit(failed.length === 0 ? 0 : 1);
}

for (const r of results) {
  console.log(`${r.ok ? "✓" : "✗"} ${r.name.padEnd(20)} ${r.detail}`);
}

if (failed.length === 0) {
  console.log("\n✓ preflight clear — start the cycle.");
  process.exit(0);
}

console.log("");
console.log(`🛑 PREFLIGHT REFUSED — ${failed.length} check(s) failed. Do not start a cycle.`);
for (const r of failed) {
  if (r.fix) console.log(`\n  ${r.name}:\n       ${r.fix}`);
}
process.exit(1);
