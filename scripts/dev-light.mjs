#!/usr/bin/env node
// dev-light.mjs — build-and-serve dev workflow (~500 MB vs ~3.5 GB)
//
// Sequential pipeline: appkit build → CSS build → next build → next start
// Uses .next/cache/ for incremental rebuilds — second build is ~15-30s.
// To rebuild after code changes: Ctrl+C → npm run dev
import { execSync, spawn, spawnSync } from "child_process";
import { readFileSync } from "fs";
import os from "os";
import path from "path";
import { performance } from "perf_hooks";
import { checkAppkitPin } from "./lib/check-appkit-pin.mjs";
import { syncAppkitLocal } from "./lib/sync-appkit-dist.mjs";

const ROOT = process.cwd();

const MIN_FREE_RAM_GB = 1;
const BYTES_PER_GB = 1024 ** 3;
const PORT = process.env.PORT || 3000;
const isWin = process.platform === "win32";

// ── Memory guard ─────────────────────────────────────────────────────────────
if (!process.env.DEV_SKIP_MEM_CHECK) {
  const freeBytes = os.freemem();
  const freeGb = freeBytes / BYTES_PER_GB;
  if (freeBytes < MIN_FREE_RAM_GB * BYTES_PER_GB) {
    const totalGb = os.totalmem() / BYTES_PER_GB;
    console.error(
      `\n[dev-light] Aborting: only ${freeGb.toFixed(2)} GB free (need ${MIN_FREE_RAM_GB} GB).\n` +
        `           Total RAM: ${totalGb.toFixed(2)} GB. Close some apps and retry, or set\n` +
        `           DEV_SKIP_MEM_CHECK=1 to bypass.\n`,
    );
    process.exit(1);
  }
  console.log(`[dev-light] Memory check passed: ${freeGb.toFixed(2)} GB free.`);
}

// ── appkit local-dev pin guard ───────────────────────────────────────────────
// A prior "publish appkit" session can leave package.json pinned to the npm
// registry ("^X.Y.Z") instead of "file:./appkit". When that happens, every
// local edit under appkit/src/ is silently invisible to `npm run dev`/tsc/
// Tailwind — npm keeps re-resolving the old published tarball instead of the
// working tree. This bit a full session's worth of appkit-side fixes before
// anyone noticed (2026-08-17). Fail loudly instead of building against stale
// code — see CLAUDE.md "Appkit Local Dev vs Publish Rules".
//
// checkAppkitPin lives in a side-effect-free module (./lib/check-appkit-pin.mjs)
// specifically so it can be unit-tested without executing this script's
// memory guard / build pipeline as an import side effect.
{
  const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
  const badSpec = checkAppkitPin(pkg);
  if (badSpec) {
    console.error(
      `\n[dev-light] Aborting: package.json pins "@mohasinac/appkit": "${badSpec}" ` +
        `(npm registry), not "file:./appkit".\n` +
        `           Local dev must build against the working tree in appkit/src/, or\n` +
        `           every appkit-side edit this session will be silently invisible.\n` +
        `           Fix: set "@mohasinac/appkit": "file:./appkit" in package.json, add\n` +
        `           appkit/src/**/*.{ts,tsx} to tsconfig.json's include[], delete\n` +
        `           package-lock.json, and run npm install. Set DEV_SKIP_APPKIT_PIN_CHECK=1\n` +
        `           to bypass (e.g. intentionally testing against a published version).\n`,
    );
    if (!process.env.DEV_SKIP_APPKIT_PIN_CHECK) process.exit(1);
  }
}

// ── Build helpers ────────────────────────────────────────────────────────────

function runStep(label, stepNum, totalSteps, command, args, opts = {}) {
  const tag = `[dev-light] Step ${stepNum}/${totalSteps}`;
  console.log(`\n${tag}: ${label}...`);
  const t0 = performance.now();

  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: { ...process.env, ...opts.env },
    shell: isWin,
    cwd: opts.cwd || ROOT,
  });

  const elapsed = ((performance.now() - t0) / 1000).toFixed(1);

  if (result.status !== 0) {
    console.error(`\n${tag}: FAILED (${elapsed}s). Aborting.`);
    process.exit(result.status ?? 1);
  }

  console.log(`${tag}: Done (${elapsed}s)`);
}

// ── Sequential build pipeline ────────────────────────────────────────────────

const TOTAL_STEPS = 5;

runStep(
  "Building appkit",
  1,
  TOTAL_STEPS,
  "npm",
  ["run", "build"],
  { cwd: path.resolve(ROOT, "appkit") },
);

// Step 2 — resync node_modules/@mohasinac/appkit (Root Cause Pattern #28):
// on this Windows setup that directory is a real copy, not a symlink/
// junction, so the Next.js build below would otherwise bundle whatever
// stale dist/scripts npm last copied in, silently ignoring the rebuild
// that just happened in Step 1.
{
  const tag = `[dev-light] Step 2/${TOTAL_STEPS}`;
  console.log(`\n${tag}: Syncing appkit into node_modules...`);
  const t0 = performance.now();
  const result = syncAppkitLocal(ROOT);
  const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
  if (result.skipped) {
    console.log(`${tag}: Skipped (${result.reason}) (${elapsed}s)`);
  } else if (result.synced.length === 0) {
    console.log(`${tag}: Already in sync (${elapsed}s)`);
  } else {
    console.log(`${tag}: Resynced ${result.synced.join(", ")} (${elapsed}s)`);
  }
}

runStep(
  "Building CSS",
  3,
  TOTAL_STEPS,
  "npx",
  [
    "tailwindcss",
    "-i", "./src/app/globals.css",
    "-o", "./src/styles/globals.compiled.css",
    "--minify",
  ],
);

runStep(
  "Building Next.js (incremental)",
  4,
  TOTAL_STEPS,
  "node",
  ["node_modules/next/dist/bin/next", "build"],
  { env: { NODE_OPTIONS: "--max-old-space-size=2048" } },
);

// ── Start production server ──────────────────────────────────────────────────

console.log(`\n[dev-light] Step 5/${TOTAL_STEPS}: Starting server on http://localhost:${PORT}`);

const serverEnv = { ...process.env, NODE_OPTIONS: "--max-old-space-size=512" };
const child = spawn(
  "node",
  ["node_modules/next/dist/bin/next", "start"],
  { stdio: "inherit", env: serverEnv, shell: false },
);

function killTree() {
  if (!child.pid) return;
  try {
    if (isWin) {
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      process.kill(child.pid, "SIGKILL");
    }
  } catch {}
}

process.on("SIGINT", killTree);
process.on("SIGTERM", killTree);

child.on("exit", (code) => {
  killTree();
  process.exit(code ?? 0);
});

console.log(`[dev-light] To rebuild after code changes: Ctrl+C → npm run dev`);
