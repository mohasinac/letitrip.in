#!/usr/bin/env node
// dev-light.mjs — build-and-serve dev workflow (~500 MB vs ~3.5 GB)
//
// Sequential pipeline: appkit build → CSS build → next build → next start
// Uses .next/cache/ for incremental rebuilds — second build is ~15-30s.
// To rebuild after code changes: Ctrl+C → npm run dev
import { execSync, spawn, spawnSync } from "child_process";
import os from "os";
import path from "path";
import { performance } from "perf_hooks";

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

const TOTAL_STEPS = 4;

runStep(
  "Building appkit",
  1,
  TOTAL_STEPS,
  "npm",
  ["run", "build"],
  { cwd: path.resolve(ROOT, "appkit") },
);

runStep(
  "Building CSS",
  2,
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
  3,
  TOTAL_STEPS,
  "node",
  ["node_modules/next/dist/bin/next", "build"],
  { env: { NODE_OPTIONS: "--max-old-space-size=2048" } },
);

// ── Start production server ──────────────────────────────────────────────────

console.log(`\n[dev-light] Step 4/${TOTAL_STEPS}: Starting server on http://localhost:${PORT}`);

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
