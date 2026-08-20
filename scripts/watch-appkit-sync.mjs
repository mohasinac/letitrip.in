#!/usr/bin/env node
// watch-appkit-sync.mjs — companion to `npm run watch:appkit` in the dev:hot
// pipeline. `tsc --watch` (inside appkit/) writes fresh output to
// appkit/dist/ on every source change, but on this Windows setup that is
// NOT the same directory Next.js resolves `@mohasinac/appkit` from —
// node_modules/@mohasinac/appkit is a real copy, not a symlink/junction
// (Root Cause Pattern #28, CLAUDE.md). Without this watcher, hot-reload dev
// silently keeps serving whatever appkit build existed when `npm install`
// last ran, no matter how many times tsc --watch recompiles.
import path from "path";
import { watch } from "fs";
import { fileURLToPath } from "url";
import { syncAppkitLocal } from "./lib/sync-appkit-dist.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEBOUNCE_MS = 400;

let timer = null;
function scheduleSync() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    const result = syncAppkitLocal(ROOT);
    if (result.skipped) {
      console.log(`[watch-appkit-sync] Skipped — ${result.reason}.`);
    } else if (result.synced.length > 0) {
      console.log(`[watch-appkit-sync] Resynced: ${result.synced.join(", ")}.`);
    }
  }, DEBOUNCE_MS);
}

// Sync once immediately so a fresh `npm run dev:hot` doesn't start stale.
scheduleSync();

const watchDir = path.join(ROOT, "appkit", "dist");
try {
  watch(watchDir, { recursive: true }, () => scheduleSync());
  console.log(`[watch-appkit-sync] Watching ${watchDir} for changes...`);
} catch (err) {
  console.error(`[watch-appkit-sync] Could not watch ${watchDir}: ${err.message}`);
  process.exit(1);
}
