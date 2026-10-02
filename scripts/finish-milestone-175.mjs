#!/usr/bin/env node
/*
 * Finish the batch-175 deploy milestone, and set its marker ONLY on evidence.
 *
 * WHY THIS EXISTS. The milestone's firebase half completed and was verified
 * (indexes settled at CREATING=0 / 28864 READY, rules released). The Vercel
 * half was still running when the session ran out of room. The Stop hook
 * re-fires its milestone prompt every turn until `lastDeployAtRecorded` is 175
 * — and the tempting shortcut is to set that marker to silence the prompt.
 *
 * 🛑 That shortcut is the thing this script prevents. The marker means "a
 * verified deploy happened at batch 175". Setting it on an unverified deploy
 * releases the gate on a false premise, and the next person reads a green
 * marker over an un-deployed build — which is precisely the failure mode the
 * whole run exists to find in other people's code.
 *
 * So: deploy, SMOKE TEST, and write the marker only if the smoke test passes.
 *
 * Usage:  node scripts/finish-milestone-175.mjs [--skip-deploy]
 *
 *   --skip-deploy   the deploy already ran elsewhere; just re-verify production
 *                   and set the marker if healthy. Use this if a background
 *                   deploy.mjs already reported DEPLOY_EXIT=0.
 *
 * Exit: 0 marker written · 1 deploy or smoke failed, marker NOT written.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const REPO = "D:/proj/letitrip.in";
const STATE = `${REPO}/tester/.tester-runs/loop-state.json`;
const BATCHES = 175;
const SKIP_DEPLOY = process.argv.includes("--skip-deploy");

function run(label, cmd, args, timeout = 900_000) {
  console.log(`\n▸ ${label}\n  $ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { cwd: REPO, stdio: "inherit", shell: true, timeout });
  if (r.status !== 0) {
    console.error(`\n✗ ${label} failed (exit ${r.status}).`);
    console.error("  Marker NOT written. Production may still be on the previous build,");
    console.error("  which is the safe state — fix the failure and re-run this script.");
    process.exit(1);
  }
  return r;
}

/* 1. Deploy (unless it already ran). deploy.mjs carries its own pre-flight
 *    AND the post-deploy smoke test of /, /en/products and /api/site-settings
 *    — the gate that catches a Lambda module-load failure a green build hides
 *    (Root Cause #69: a deployment Vercel reported READY served 500 on every
 *    route). A green build is not proof the site runs. */
if (!SKIP_DEPLOY) {
  run("vercel deploy + smoke test", "node", ["scripts/deploy.mjs"]);
} else {
  console.log("\n· --skip-deploy: trusting an earlier deploy.mjs exit 0, re-verifying below");
}

/* 2. Independent health check. deploy.mjs already smoke-tested, but this is a
 *    second, separate read of production — cheap, and it is what the marker
 *    actually asserts. */
run("post-deploy health", "node", ["tester/scripts/verify-prod-health.mjs"], 180_000);

/* 3. Only now is the marker true. */
const state = JSON.parse(readFileSync(STATE, "utf8"));
const before = state.lastDeployAtRecorded ?? "(unset)";
state.lastDeployAtRecorded = BATCHES;
state.lastDeployAt = new Date().toISOString();
state.lastDeployNote =
  "milestone 175: firebase indexes+rules deployed, appkit publish deliberately " +
  "skipped (4.42.10 already published, pinned and registry-resolved), functions " +
  "unchanged. Vercel deployed and smoke-tested by finish-milestone-175.mjs.";
writeFileSync(STATE, JSON.stringify(state, null, 2));

console.log(`\n✓ lastDeployAtRecorded: ${before} -> ${BATCHES}`);
console.log("  Written only because the deploy AND an independent health read both passed.");
console.log("  The hook's milestone prompt will stop firing; batch 176 now tests the deployed build.");
console.log("\n  Still outstanding at this milestone: the FIX phase. 123 queued defects,");
console.log("  lastFixAtRecorded is 153. See docs/TEST-RUN-3-OUTOFSCOPE.md for the");
console.log("  severity-fold rule before triaging, and note CASE DEFECT / FIXTURE GAP");
console.log("  entries are not product defects.");
