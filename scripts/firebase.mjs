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

function run(script, args) {
  const res = spawnSync(process.execPath, [script, ...args], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (res.error) {
    console.error(`✗ spawn error: ${res.error.message}`);
    process.exit(1);
  }
  process.exit(res.status ?? 1);
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
  run(MERGE_SCRIPT, args);
} else if (subcommand === "reset") {
  run(RESET_SCRIPT, rest);
} else {
  console.error(`✗ Unknown subcommand: ${subcommand}`);
  usage();
}
