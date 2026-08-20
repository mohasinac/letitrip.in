#!/usr/bin/env node
// CLI wrapper around scripts/lib/sync-appkit-dist.mjs.
// Usage: node scripts/sync-appkit.mjs [--check]
import path from "path";
import { fileURLToPath } from "url";
import { syncAppkitLocal } from "./lib/sync-appkit-dist.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");

const result = syncAppkitLocal(ROOT, { check });

if (result.skipped) {
  console.log(`[sync-appkit] Skipped — ${result.reason}.`);
  process.exit(0);
}

if (result.synced.length === 0) {
  console.log(`[sync-appkit] node_modules/@mohasinac/appkit is already in sync (${result.alreadyFresh.join(", ") || "nothing to sync"}).`);
  process.exit(0);
}

if (check) {
  console.error(
    `[sync-appkit] STALE: node_modules/@mohasinac/appkit/{${result.synced.join(", ")}} ` +
      `differs from appkit/{${result.synced.join(", ")}}. Run "node scripts/sync-appkit.mjs" to fix.`,
  );
  process.exit(1);
}

console.log(`[sync-appkit] Resynced: ${result.synced.join(", ")}.`);
