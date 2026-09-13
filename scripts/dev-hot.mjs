#!/usr/bin/env node
/**
 * dev-hot.mjs — pin-aware launcher for the hot-reload dev pipeline.
 *
 * `dev:hot` used to hardcode four watchers in package.json. Three of them
 * (`watch:appkit` — which is itself two processes, tsc --watch + tailwind
 * --watch — and `watch:appkit-sync`) exist only to keep
 * node_modules/@mohasinac/appkit in step with a LOCAL appkit build. They are
 * meaningful under `"@mohasinac/appkit": "file:./appkit"` and pure waste under
 * an npm-registry pin, because then Next resolves the published tarball in
 * node_modules and nothing anywhere reads appkit/dist.
 *
 * Measured cost of running them under an npm pin (2026-09-13):
 *   tsc -p appkit/tsconfig.build.json --extendedDiagnostics
 *     Files: 3640 · Lines of TypeScript: 358814 · Memory used: 1499455K
 *   …and it inherits no --max-old-space-size, because cross-env sets
 *   NODE_OPTIONS only inside `dev:only` and concurrently spawns each name
 *   independently. Plus appkit's own tailwind --watch (scans 2,360 files to
 *   produce a CSS file nothing imports) and watch-appkit-sync.mjs, which is a
 *   provable no-op — sync-appkit-dist.mjs:51 short-circuits on the same pin
 *   check used here.
 *
 * So: ask the pin, start only what that mode actually needs.
 *
 * Env overrides:
 *   DEV_HOT_ALL_WATCHERS=1   force every watcher on regardless of the pin
 *   DEV_HOT_NEXT_ONLY=1      run only the Next dev server (no CSS watcher)
 *
 * Flags:
 *   --dry-run   print the resolved task list and exit 0 without spawning
 *               anything. Exists so the selection can be verified without
 *               starting a dev server (CLAUDE.md Rule #10).
 */
import { spawn } from "child_process";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { isLocalAppkitPin } from "./lib/sync-appkit-dist.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Every entry is an npm script name; concurrently gets `npm run <name>`.
const APPKIT_WATCHERS = [
  { name: "appkit", script: "watch:appkit" },
  { name: "sync", script: "watch:appkit-sync" },
];
const ALWAYS = [
  // globals.compiled.css IS imported by the app — this one is load-bearing
  // under both pin modes.
  { name: "css", script: "watch:css" },
  { name: "next", script: "dev:only" },
];

const localPin = isLocalAppkitPin(ROOT);
const forceAll = process.env.DEV_HOT_ALL_WATCHERS === "1";
const nextOnly = process.env.DEV_HOT_NEXT_ONLY === "1";

let tasks;
if (nextOnly) {
  tasks = ALWAYS.filter((t) => t.name === "next");
} else if (localPin || forceAll) {
  tasks = [...APPKIT_WATCHERS, ...ALWAYS];
} else {
  tasks = ALWAYS;
}

const skipped = [...APPKIT_WATCHERS, ...ALWAYS].filter(
  (t) => !tasks.some((k) => k.name === t.name),
);

console.log(
  `[dev-hot] appkit pin: ${localPin ? "file:./appkit (local)" : "npm registry"}` +
    `${forceAll ? " — DEV_HOT_ALL_WATCHERS=1 override" : ""}`,
);
console.log(`[dev-hot] starting: ${tasks.map((t) => t.name).join(", ")}`);
if (skipped.length > 0) {
  console.log(
    `[dev-hot] skipping:  ${skipped.map((t) => t.name).join(", ")} — ` +
      (localPin
        ? "explicitly disabled"
        : "nothing reads appkit/dist under an npm pin. Set DEV_HOT_ALL_WATCHERS=1 to force."),
  );
}

if (process.argv.includes("--dry-run")) {
  console.log("[dev-hot] --dry-run: nothing spawned.");
  process.exit(0);
}

const concurrentlyBin = path.join(ROOT, "node_modules", "concurrently", "dist", "bin", "index.js");
if (!existsSync(concurrentlyBin)) {
  console.error(`[dev-hot] concurrently not found at ${concurrentlyBin} — run npm install.`);
  process.exit(1);
}

const args = [
  concurrentlyBin,
  "--kill-others",
  "--restart-tries",
  "0",
  "--names",
  tasks.map((t) => t.name).join(","),
  ...tasks.map((t) => `npm run ${t.script}`),
];

const child = spawn(process.execPath, args, { stdio: "inherit", cwd: ROOT, shell: false });

function killTree() {
  if (child.pid && process.platform === "win32") {
    spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  } else if (child.pid) {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", killTree);
process.on("SIGTERM", killTree);
child.on("exit", (code) => {
  killTree();
  process.exit(code ?? 0);
});
