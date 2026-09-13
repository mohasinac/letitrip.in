#!/usr/bin/env node
// Spawns `next dev` and on exit kills the entire process tree (Windows-safe).
//
// ─── Memory guard ─────────────────────────────────────────────────────────
// Refuses to start when free RAM is below MIN_FREE_RAM_GB. Next.js dev
// (turbopack + appkit watch) easily eats >2 GB warm; booting under that floor
// is how OOM compactions and frozen laptops happen. Bypass with
// DEV_SKIP_MEM_CHECK=1.
//
// ─── Vercel Hobby parity ──────────────────────────────────────────────────
// When VERCEL_HOBBY_TIER=1 is set (the default from `npm run dev`), the
// runtime mirrors Vercel's Hobby plan ceilings so locally-broken code fails
// the same way as production:
//   • 1024 MB Node heap         (NODE_OPTIONS --max-old-space-size, set in
//                                package.json)
//   • 10 s   serverless function timeout
//   • 4.5 MB request payload cap
// The values are exported as VERCEL_* env so route-handler middleware can
// read + enforce them. Override individual caps via the matching DEV_* env.
import { spawn, spawnSync } from "child_process";
import os from "os";

const MIN_FREE_RAM_GB = 2;
const BYTES_PER_GB = 1024 ** 3;

// ── Vercel Hobby plan ceilings (with Fluid Compute enabled) ───────────────
//
// Per the project's live Vercel dashboard: Fluid Compute Standard tier,
// 1 vCPU, 2 GB function memory, 8 GB build machine, Node 22.x, iad1.
// Sync timeout 10 s, background 60 s. Payload + image caps match Hobby
// across all compute tiers.
//
// 🛑 This block used to also claim MEMORY_MB was "the empirically-derived
// minimum heap cap for `next dev` (turbopack)", citing probe-dev-heap-cap.mjs
// 2026-05-12 (1024 MB OOMs / 1536 MB survives / +512 headroom → 2048). That
// claim was wrong in two ways and is retracted:
//
//   1. The probe it cites spawns `next dev --webpack`
//      (probe-dev-heap-cap.mjs), while this script spawns plain `next dev`
//      → TURBOPACK (Next 16 default, lib/bundler.js). The comment named one
//      bundler and the measurement used the other.
//   2. package.json `dev:only` applies 3072, not 2048. Three places wrote the
//      number and all three disagreed.
//
// These Hobby ceilings are about the deployed FUNCTION runtime. They are not,
// and never were, a measured dev-server heap cap — do not re-conflate them.
// Re-derive the dev cap with a Turbopack run before quoting one.
const HOBBY_LIMITS = {
  // Function memory (MB) — Fluid Compute Standard. Runtime ceiling only.
  MEMORY_MB: 2048,
  // Sync function timeout (seconds).
  FUNCTION_TIMEOUT_S: 10,
  // Background function timeout (seconds).
  BACKGROUND_TIMEOUT_S: 60,
  // Request body cap (bytes).
  MAX_PAYLOAD_BYTES: 4.5 * 1024 * 1024,
  // Image optimization input cap.
  MAX_IMAGE_BYTES: 50 * 1024 * 1024,
  // Build machine memory (MB) — for reference; not enforced locally.
  // Hobby is fixed at 2 vCPU / 8 GB and cannot be upgraded.
  BUILD_MACHINE_MB: 8 * 1024,
  // Build machine vCPUs. Load-bearing for `experimental.cpus` in next.config.js:
  // Node's os.cpus() reports the HOST core count, not the container's cgroup
  // quota, so Next would otherwise size its static-generation worker pool from
  // a number that has nothing to do with this container.
  BUILD_MACHINE_CPUS: 2,
};

if (!process.env.DEV_SKIP_MEM_CHECK) {
  const freeBytes = os.freemem();
  const freeGb = freeBytes / BYTES_PER_GB;
  if (freeBytes < MIN_FREE_RAM_GB * BYTES_PER_GB) {
    const totalGb = os.totalmem() / BYTES_PER_GB;
    console.error(
      `\n[dev-next] Aborting: only ${freeGb.toFixed(2)} GB free (need ${MIN_FREE_RAM_GB} GB).\n` +
        `           Total RAM: ${totalGb.toFixed(2)} GB. Close some apps and retry, or set\n` +
        `           DEV_SKIP_MEM_CHECK=1 to bypass.\n`,
    );
    process.exit(1);
  }
  console.log(
    `[dev-next] Memory check passed: ${freeGb.toFixed(2)} GB free.`,
  );
}

const hobbyOn = process.env.VERCEL_HOBBY_TIER === "1";

const env = { ...process.env };
if (hobbyOn) {
  env.VERCEL_TIER = env.VERCEL_TIER ?? "hobby";
  env.VERCEL_FUNCTION_MEMORY_MB = String(
    env.DEV_FUNCTION_MEMORY_MB ?? HOBBY_LIMITS.MEMORY_MB,
  );
  env.VERCEL_FUNCTION_TIMEOUT_S = String(
    env.DEV_FUNCTION_TIMEOUT_S ?? HOBBY_LIMITS.FUNCTION_TIMEOUT_S,
  );
  env.VERCEL_BACKGROUND_TIMEOUT_S = String(
    env.DEV_BACKGROUND_TIMEOUT_S ?? HOBBY_LIMITS.BACKGROUND_TIMEOUT_S,
  );
  env.VERCEL_MAX_PAYLOAD_BYTES = String(
    env.DEV_MAX_PAYLOAD_BYTES ?? HOBBY_LIMITS.MAX_PAYLOAD_BYTES,
  );
  env.VERCEL_MAX_IMAGE_BYTES = String(
    env.DEV_MAX_IMAGE_BYTES ?? HOBBY_LIMITS.MAX_IMAGE_BYTES,
  );
  console.log(
    `[dev-next] Vercel Hobby parity ON — memory=${env.VERCEL_FUNCTION_MEMORY_MB} MB, ` +
      `timeout=${env.VERCEL_FUNCTION_TIMEOUT_S} s, ` +
      `payload=${(Number(env.VERCEL_MAX_PAYLOAD_BYTES) / 1024 / 1024).toFixed(2)} MB.`,
  );
}

// `--disable-source-maps` is a real memory lever, not a style choice.
// next/dist/cli/next-dev.js force-adds `--enable-source-maps` to the forked dev
// server's NODE_OPTIONS unless this flag is passed:
//
//     if (options.disableSourceMaps) { delete nodeOptions['enable-source-maps'] }
//     else                           { nodeOptions['enable-source-maps'] = true }
//
// That is a V8 flag, so V8 retains source-map data for every loaded chunk —
// across 769 route entries that is a first-order retention cost.
// `experimental.serverSourceMaps: false` in next.config.js does NOT suppress it;
// that one is a bundler flag and they are unrelated.
//
// Cost: dev server stack traces point at compiled output rather than original
// TS. Set DEV_SOURCE_MAPS=1 for a session where you need them back.
const wantSourceMaps = process.env.DEV_SOURCE_MAPS === "1";
const nextArgs = ["node_modules/next/dist/bin/next", "dev"];
if (!wantSourceMaps) nextArgs.push("--disable-source-maps");
console.log(
  `[dev-next] source maps ${wantSourceMaps ? "ON (DEV_SOURCE_MAPS=1)" : "OFF — set DEV_SOURCE_MAPS=1 to restore"}.`,
);

const child = spawn(
  "node",
  nextArgs,
  { stdio: "inherit", env, shell: false },
);

function killTree() {
  if (child.pid) {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
  }
}

process.on("SIGINT", killTree);
process.on("SIGTERM", killTree);

child.on("exit", (code) => {
  killTree();
  process.exit(code ?? 0);
});
