#!/usr/bin/env node
// Spawns `next dev` and on exit kills the entire process tree (Windows-safe).
//
// ─── Memory guard ─────────────────────────────────────────────────────────
// Refuses to start when free RAM is below MIN_FREE_RAM_GB. Next.js dev
// (webpack + appkit watch) easily eats >2 GB warm; booting under that floor
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
// The 2 GB function memory is also the empirically-derived minimum heap
// cap for `next dev --webpack` on this codebase: probe-dev-heap-cap.mjs
// 2026-05-12 showed 1024 MB OOMs under load (peak RSS 1457 MB), 1536 MB
// runs without OOM (peak RSS 1887 MB), and 1536 + 512 MB headroom rounds
// up to the 2048 MB cap NODE_OPTIONS uses in package.json `dev:only`.
const HOBBY_LIMITS = {
  // Function memory (MB) — Fluid Compute Standard. Also the dev heap cap.
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
  BUILD_MACHINE_MB: 8 * 1024,
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

const child = spawn(
  "node",
  ["node_modules/next/dist/bin/next", "dev", "--webpack"],
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
