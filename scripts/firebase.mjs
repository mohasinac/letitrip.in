#!/usr/bin/env node
/**
 * Firebase op dispatcher — collapses the legacy `firebase:*` script aliases
 * into one entry point that forwards to appkit's underlying scripts.
 *
 *   node scripts/firebase.mjs generate                       # = firebase:generate
 *   node scripts/firebase.mjs deploy                         # = firebase:deploy
 *   node scripts/firebase.mjs deploy --only indexes          # = firebase:deploy:indexes
 *   node scripts/firebase.mjs deploy --only rules            # = firebase:deploy:rules
 *   node scripts/firebase.mjs deploy --only firestore:rules,storage
 *   node scripts/firebase.mjs reset                          # = firebase:reset
 *   node scripts/firebase.mjs reset --yes                    # = firebase:reset:all
 *   node scripts/firebase.mjs reset --dry-run
 *
 * --only shortcuts:
 *   indexes → firestore:indexes
 *   rules   → firestore:rules,storage,database
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MERGE_SCRIPT = "appkit/scripts/firebase-merge.mjs";
const RESET_SCRIPT = "appkit/scripts/firebase-reset.mjs";

const ONLY_SHORTCUTS = {
  indexes: "firestore:indexes",
  rules: "firestore:rules,storage,database",
};

function usage(exitCode = 1) {
  console.error(
    [
      "Usage:",
      "  node scripts/firebase.mjs generate",
      "  node scripts/firebase.mjs deploy [--only <targets>]",
      "  node scripts/firebase.mjs reset [--yes] [--dry-run]",
      "",
      "--only shortcuts: indexes, rules",
    ].join("\n"),
  );
  process.exit(exitCode);
}

function run(script, args, onSuccess) {
  const res = spawnSync(process.execPath, [script, ...args], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (res.error) {
    console.error(`✗ spawn error: ${res.error.message}`);
    process.exit(1);
  }
  if ((res.status ?? 1) === 0 && onSuccess) onSuccess();
  process.exit(res.status ?? 1);
}

/**
 * Files whose content is what a `deploy --only <target>` actually pushes.
 * Keyed by the firebase target token that appears in `--only`.
 */
const DEPLOYED_ARTIFACTS = {
  database: "database.rules.json",
  "firestore:rules": "firestore.rules",
  "firestore:indexes": "firestore.indexes.json",
  storage: "storage.rules",
};

const DEPLOY_RECORD = join(ROOT, "firebase-deployed.json");

/**
 * Record what was just deployed, so `audit-firebase-rules-deployed` can tell a
 * committed-but-never-pushed rules change from a deployed one.
 *
 * This is the gap `audit-firebase-rules-generated` does NOT cover: that audit
 * proves the generated file matches its appkit source, which says nothing about
 * whether the live project is running it. A rules change can sit correct,
 * committed and green for weeks while production serves the previous version —
 * and for a SECURITY change (closing a public `.read`, say) that difference is
 * the entire point.
 */
function recordDeployed(targets) {
  const record = existsSync(DEPLOY_RECORD)
    ? JSON.parse(readFileSync(DEPLOY_RECORD, "utf8"))
    : {};
  let touched = 0;
  for (const target of targets) {
    const file = DEPLOYED_ARTIFACTS[target];
    if (!file) continue;
    const abs = join(ROOT, file);
    if (!existsSync(abs)) continue;
    record[file] = createHash("sha256")
      .update(readFileSync(abs, "utf8").replace(/
/g, "
"))
      .digest("hex");
    touched++;
  }
  if (touched === 0) return;
  record.deployedAt = new Date().toISOString();
  writeFileSync(DEPLOY_RECORD, JSON.stringify(record, null, 2) + "
", "utf8");
  console.log(`  ✓ recorded ${touched} deployed artifact(s) in firebase-deployed.json`);
}

const [, , subcommand, ...rest] = process.argv;
if (!subcommand) usage();

if (subcommand === "generate") {
  run(MERGE_SCRIPT, rest);
} else if (subcommand === "deploy") {
  const args = ["--deploy"];
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--only") {
      const next = rest[++i];
      if (!next) {
        console.error("✗ --only requires a value");
        process.exit(1);
      }
      args.push("--only", ONLY_SHORTCUTS[next] ?? next);
    } else {
      args.push(rest[i]);
    }
  }
  // Which targets actually went out — `--only` may be absent (deploy all).
  const onlyIdx = args.indexOf("--only");
  const targets =
    onlyIdx === -1
      ? Object.keys(DEPLOYED_ARTIFACTS)
      : (args[onlyIdx + 1] ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  run(MERGE_SCRIPT, args, () => recordDeployed(targets));
} else if (subcommand === "reset") {
  run(RESET_SCRIPT, rest);
} else {
  console.error(`✗ Unknown subcommand: ${subcommand}`);
  usage();
}
