#!/usr/bin/env node
/*
 * G8 — the deploy milestone, as a script rather than a procedure followed from
 * memory.
 *
 * 🛑 THE FAILURE THIS PREVENTS: a half-done publish. `npm publish` RETURNS BEFORE
 * THE VERSION IS INSTALLABLE — measured at ~3.5 minutes for 4.38.0 — and the
 * documented mistake is to answer the resulting `ETARGET / No matching version`
 * by republishing or bumping again, which compounds it. The `tsconfig`
 * `appkit/src/**` toggle and the lockfile relink are equally easy to half-do, and
 * each has its own production failure mode:
 *
 *   - tsconfig left INCLUDING appkit/src/** with an npm pin  -> Vercel Linux OOM
 *     after 5-8 min with no accessible error log (Root Cause #23)
 *   - lockfile still `"link": true`                          -> `npm ci` resolves
 *     to a dist-less directory and the build fails
 *
 * So the whole sequence runs here, in order, stopping on the first failure.
 *
 * 🛑 AUTHORISATION. This deploys to production without asking, by a standing
 * decision the user made for Test Run 3 only. It overrides CLAUDE.md Rule #10 at
 * these milestones and NOWHERE else — it is not a licence to deploy at any other
 * point in the run.
 *
 * Usage:
 *   node scripts/test-run-milestone.mjs [--dry-run] [--skip-appkit] [--skip-firebase]
 *
 * Exit: 0 deployed and smoke-tested · 1 a step failed · 2 refused to start.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { LOOP_STATE_PATH, REPO, flag, tally } from "./lib/test-run.mjs";

const DRY = flag("dry-run") === true;
const steps = [];

function run(label, cmd, args, opts = {}) {
  const line = `${cmd} ${args.join(" ")}`;
  if (DRY) {
    console.log(`  [dry-run] ${line}`);
    steps.push({ label, ok: true, skipped: true });
    return { status: 0, stdout: "", stderr: "" };
  }
  console.log(`\n▸ ${label}\n  $ ${line}`);
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd ?? REPO,
    encoding: "utf8",
    stdio: opts.capture ? "pipe" : "inherit",
    shell: true,
    timeout: opts.timeout ?? 900_000,
    env: { ...process.env, ...(opts.env ?? {}) },
  });
  const ok = r.status === 0;
  steps.push({ label, ok });
  if (!ok) {
    console.error(`\n✗ ${label} failed (exit ${r.status}).`);
    if (opts.capture) console.error(String(r.stdout ?? "").slice(-2000));
    summarise();
    process.exit(1);
  }
  return r;
}

function summarise() {
  console.log("\n── milestone steps ──");
  for (const s of steps) console.log(`  ${s.skipped ? "·" : s.ok ? "✓" : "✗"} ${s.label}`);
}

function gitChanged(pathPrefix, sinceRef) {
  const r = spawnSync("git", ["diff", "--name-only", sinceRef, "--", pathPrefix], {
    cwd: REPO,
    encoding: "utf8",
    shell: true,
  });
  if (r.status !== 0) return true; // unknown -> assume changed, never skip a needed deploy
  return String(r.stdout ?? "").trim().length > 0;
}

/* ── Refuse to start on an incomplete cycle ───────────────────────────────── */
const t = tally();
if (t.open > 0 && !DRY) {
  console.error(`🛑 REFUSED — ${t.open} open defect(s).`);
  console.error("  The run's rule is that no batch advances with an open defect, and a");
  console.error("  milestone is not an exception: deploying now ships a build whose known");
  console.error("  failures are unfixed, and every later batch tests it.");
  console.error("\n  node scripts/test-run-status.mjs      # lists them");
  process.exit(2);
}

let state = {};
if (existsSync(LOOP_STATE_PATH)) {
  try {
    state = JSON.parse(readFileSync(LOOP_STATE_PATH, "utf8"));
  } catch {
    state = {};
  }
}
const sinceRef = state.lastMilestoneSha || "HEAD";

console.log(`Test Run 3 — deploy milestone at ${t.batchesDone} batches`);
console.log(`  comparing against ${sinceRef === "HEAD" ? "the working tree" : sinceRef}`);

/* ── 1. Quality gate ──────────────────────────────────────────────────────── */
run("npm run check", "npm", ["run", "check"]);

/* ── 2. appkit publish, if it changed ─────────────────────────────────────── */
const appkitChanged = flag("skip-appkit") !== true && gitChanged("appkit", sinceRef);
if (!appkitChanged) {
  console.log("\n· appkit unchanged — skipping publish");
  steps.push({ label: "appkit publish", ok: true, skipped: true });
} else {
  run("appkit: bump patch", "npm", ["version", "patch", "--no-git-tag-version"], {
    cwd: resolve(REPO, "appkit"),
  });
  const version = JSON.parse(readFileSync(resolve(REPO, "appkit/package.json"), "utf8")).version;
  run("appkit: build", "npm", ["run", "build"], { cwd: resolve(REPO, "appkit") });
  run("appkit: publish", "npm", ["publish"], { cwd: resolve(REPO, "appkit") });

  /*
   * 🛑 POLL. `npm publish` returns before the registry serves the version. An
   * immediate `npm install` fails with ETARGET, which is PROPAGATION, not a
   * failed publish — and must never be answered by publishing again.
   */
  if (!DRY) {
    console.log(`\n▸ waiting for @mohasinac/appkit@${version} to become installable`);
    let visible = false;
    for (let i = 0; i < 24; i++) {
      const r = spawnSync("npm", ["view", `@mohasinac/appkit@${version}`, "version"], {
        encoding: "utf8",
        shell: true,
      });
      if (r.status === 0 && String(r.stdout).trim() === version) {
        visible = true;
        console.log(`  ✓ visible after ~${i * 15}s`);
        break;
      }
      process.stdout.write(".");
      await new Promise((res) => setTimeout(res, 15_000));
    }
    if (!visible) {
      console.error(`\n✗ ${version} still not installable after 6 minutes.`);
      console.error("  This is registry propagation. Do NOT publish or bump again — wait and");
      console.error("  re-run with --skip-appkit once `npm view` shows it.");
      summarise();
      process.exit(1);
    }
    steps.push({ label: `appkit@${version} installable`, ok: true });
  }

  /* Consumer pin + tsconfig + lockfile, which must move together. */
  if (!DRY) {
    const pkgPath = resolve(REPO, "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    pkg.dependencies["@mohasinac/appkit"] = `^${version}`;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    /*
     * 🛑 With an npm pin, `appkit/src/**` MUST leave the tsconfig include — types
     * come from dist/*.d.ts. Leaving it compiles thousands of appkit sources
     * alongside consumer code: fine on case-insensitive Windows, OOM or
     * case-sensitivity failure on Vercel's Linux builders after 5-8 minutes,
     * with no accessible error log.
     */
    const tsPath = resolve(REPO, "tsconfig.json");
    const ts = readFileSync(tsPath, "utf8");
    const stripped = ts
      .split("\n")
      .filter((l) => !/["']appkit\/src\/\*\*/.test(l))
      .join("\n");
    if (stripped !== ts) {
      writeFileSync(tsPath, stripped);
      console.log("  ✓ removed appkit/src/** from tsconfig include (npm pin)");
    }
    steps.push({ label: "consumer pin + tsconfig", ok: true });
  }
  run("relock against the registry", "npm", ["install"], { capture: true });
  run("typecheck after relink", "npx", ["tsc", "--noEmit"], { capture: true });
}

/* ── 3. Firebase, if its config changed ───────────────────────────────────── */
if (flag("skip-firebase") !== true) {
  const rulesChanged =
    gitChanged("appkit/firebase", sinceRef) ||
    gitChanged("firestore.indexes.json", sinceRef) ||
    gitChanged("firestore.rules", sinceRef);
  if (rulesChanged) {
    /*
     * `generate` FIRST, always: wait-for-indexes and firebase-delete-indexes both
     * enumerate collection groups from the GENERATED root file, so a stale one
     * makes them wait on — or delete — the wrong set.
     */
    run("firebase: generate", "npm", ["run", "firebase", "--", "generate"]);
    run("firebase: deploy indexes", "npm", ["run", "firebase", "--", "deploy", "--only", "indexes"]);
    run("wait for indexes", "node", ["scripts/wait-for-indexes.mjs"], { timeout: 1_800_000 });
    run("firebase: deploy rules", "npm", ["run", "firebase", "--", "deploy", "--only", "rules"]);
  } else {
    console.log("\n· firebase config unchanged — skipping");
    steps.push({ label: "firebase config", ok: true, skipped: true });
  }

  if (gitChanged("functions", sinceRef) || appkitChanged) {
    /*
     * functions/lib is a tsup SNAPSHOT that INLINES appkit at build time, so
     * rebuilding appkit/dist does not update it (Root Cause #64). An appkit
     * change therefore forces a functions rebuild even when functions/ itself is
     * untouched — otherwise the deployed Function serves different query
     * semantics than the app.
     */
    run("functions: rebuild (inlines appkit)", "npm", ["--prefix", "./functions", "run", "build"]);
    run("functions: module loads", "node", ["-e", '"require(\'./functions/lib/index.js\')"']);
    run("functions: deploy", "npm", ["run", "firebase", "deploy", "--", "--only", "functions"], {
      env: { FUNCTIONS_DISCOVERY_TIMEOUT: "120" },
      timeout: 1_800_000,
    });
  } else {
    console.log("\n· functions unchanged — skipping");
    steps.push({ label: "functions", ok: true, skipped: true });
  }
}

/* ── 4. Vercel, with its own post-deploy smoke test ───────────────────────── */
run("vercel deploy + smoke test", "node", ["scripts/deploy.mjs"], { timeout: 1_800_000 });

/* ── 5. Confirm the site the run will keep testing is healthy ─────────────── */
run("post-deploy health", "node", ["tester/scripts/verify-prod-health.mjs"]);

/* ── Record the marker so the next milestone diffs from here ──────────────── */
if (!DRY) {
  const sha = String(
    spawnSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8", shell: true }).stdout ?? "",
  ).trim();
  try {
    writeFileSync(
      LOOP_STATE_PATH,
      JSON.stringify(
        { ...state, lastMilestoneSha: sha, lastMilestoneBatches: t.batchesDone, lastMilestoneAt: new Date().toISOString() },
        null,
        2,
      ) + "\n",
    );
  } catch {
    console.warn("⚠ could not record the milestone marker — the next one will diff from HEAD");
  }
}

summarise();
console.log(`\n✓ milestone complete at ${t.batchesDone} batches. Production is live and healthy.`);
console.log("  Later batches now test the fixed code; earlier passes are evidence about the");
console.log("  previous build, which is what the Batch column in docs/TEST-RUN-3.md is for.");
