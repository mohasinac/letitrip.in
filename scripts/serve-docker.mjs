#!/usr/bin/env node
/*
 * Serve the app from a container, for local testing and for the Claude tester.
 *
 * ## 🛑 Why this is better than `npm run dev:hot`, measured rather than argued
 *
 * The dev server was abandoned on this machine because it crashed a 16 GB / 8
 * core box. The cause is structural, not a leak: Turbopack compiles each route
 * ON DEMAND with no warm cache, and runs with `isolatedMemory: false`, so its
 * Rust arena shares the main address space and is invisible to
 * `--max-old-space-size`. The arena therefore grows with ROUTES VISITED PER
 * PROCESS — and visiting many distinct routes is literally the tester's job
 * (1,162 cases over ~200 batches, each batch a different page). One batch is
 * cheap; a sweep inside one dev-server lifetime is what exhausts the machine.
 *
 * A container inverts that. It builds ONCE and then `next start` serves
 * precompiled output: no per-route compile, so no arena growth, and
 * `cacheMaxMemorySize: 0` in next.config.js keeps the server on disk cache.
 * Measured in cgroup accounting on this repo (probe-build-docker.mjs):
 *
 *     cold build   ~8,100 MB   256-323s     (only after an appkit bump)
 *     warm build    4,424 MB      126s      (the normal case)
 *     next start      546 MB      serving   (measured, steady, does not grow)
 *
 * And the limit is REAL: `--memory` means a runaway is OOM-killed inside the
 * container instead of taking the desktop down with it. That is the part that
 * actually makes unattended tester runs safe.
 *
 * ## 🛑 It also stops tester runs billing production
 *
 * Root Cause #104: the harness's BASE_URL once defaulted to the live site and
 * **255 batches were driven against production**, contributing ~900K media-proxy
 * responses and 52.52 GB of Fast Origin Transfer against a 10 GB allowance —
 * which is part of what got the project suspended (HTTP 402). `fetch-cases.mjs`
 * now defaults to `http://localhost:3000` and prints a loud warning otherwise,
 * so there must BE a working localhost:3000. This is it.
 *
 * ## 🛑 What a container does NOT isolate — read before trusting it
 *
 * **Firestore, Auth and Storage are the REAL project.** The container changes
 * where the Next.js process runs, nothing else; `.env.local` points at live
 * Firebase either way. So a tester run still wipes and re-seeds the seeded
 * catalogue exactly as it would against `npm run dev`, and the tier boundary in
 * § "Claude Tester" is still the only thing protecting real users, addresses
 * and sessions. This buys memory safety and metric safety, NOT data safety.
 *
 * Also: `next start` has no HMR. That is a feature here — the tester does not
 * need it and it is most of what dev spends memory on — but it means a source
 * edit needs a rebuild (`--rebuild`), not a save.
 *
 * ## Usage
 *
 *   node scripts/serve-docker.mjs --build      # once: build the image
 *   node scripts/serve-docker.mjs              # build (warm) + serve on :3000
 *   node scripts/serve-docker.mjs --rebuild    # after a source change (rebuilds the IMAGE)
 *   node scripts/serve-docker.mjs --cold       # discard the build cache first
 *   node scripts/serve-docker.mjs --stop
 *
 * @tag domain:build
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:runs docker, publishes a port
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { dockerEnvArgs } from "./lib/docker-env.mjs";

const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};

const PORT = opt("port", "3000");
/*
 * 🛑 THESE TWO DEFAULTS ARE MEASURED, NOT GUESSED, and a first attempt at 6g
 * with no swap died mid-compile for exactly this reason.
 *
 * The BUILD is the expensive phase, and how expensive depends entirely on the
 * cache (probe-build-docker.mjs, cgroup accounting):
 *
 *     cold   ~8,100 MB anon   — the first build, or after `--cold`
 *     warm    4,424 MB anon   — every build after that
 *
 * Serving is 546 MB measured — irrelevant to the sizing, which the build sets.
 *
 * This machine's Docker VM holds 7,646 MB, so a cold build CANNOT fit in RAM
 * here at any `--memory`. Giving it swap headroom is what lets it complete:
 * 7 GB resident + the VM's 2 GB of real swap is ~9 GB of chargeable total, and
 * a cold build was measured completing in that envelope (8,100 MB peak, 323s).
 * `--memory` still caps resident usage, so the desktop is protected either way.
 *
 * After one successful build the cache volume is warm and 4.4 GB fits in RAM
 * with room, so the swap allowance simply goes unused.
 */
const MEMORY = opt("memory", "7g");
const MEMORY_SWAP = opt("memory-swap", "9g");
const IMAGE = "letitrip-build-probe";
const NAME = "letitrip-serve";
/* Shared with probe-build-docker.mjs on purpose: a build here warms the cache
 * the probe measures, and vice versa. One cache, both tools. */
const CACHE_VOLUME = "letitrip-build-probe-cache";
const ROOT = process.cwd();

const run = (cmd, args, o = {}) =>
  spawnSync(cmd, args, { stdio: o.capture ? ["ignore", "pipe", "pipe"] : "inherit", encoding: "utf8", cwd: ROOT, ...o });

if (argv.includes("--stop")) {
  run("docker", ["rm", "-f", NAME], { capture: true });
  console.log(`[serve-docker] stopped ${NAME}`);
  process.exit(0);
}

const info = run("docker", ["info", "--format", "{{.OSType}}"], { capture: true });
if (info.status !== 0) {
  console.error("✗ Docker daemon is not reachable — start Docker Desktop. (The CLI alone is not enough.)");
  process.exit(2);
}

/*
 * 🛑 `--rebuild` HAD NO HANDLER, and the consequence was a silent wrong answer.
 *
 * The image carries a SNAPSHOT of the source (`COPY . .`), so re-running
 * `npm run build` inside the existing image rebuilds the snapshot — not your
 * edits. This script's own header says *"a source edit needs a rebuild
 * (`--rebuild`), not a save"*, and `--rebuild` was matched nowhere in the file:
 * it fell through to the default path, printed a full Next build, served on
 * :3000 and answered from code that was minutes or hours old.
 *
 * Measured the hard way: three batches of committed work verified green by
 * every gate, and the container returned 404 for a route that existed and the
 * OLD breadcrumb markup for a page that had been rewritten. A verification
 * surface that lies is worse than no verification surface, because the answer
 * is confident.
 *
 * So `--rebuild` is now exactly `--build` + serve, which is what it always
 * claimed to be.
 */
if (argv.includes("--build") || argv.includes("--rebuild")) {
  if (!existsSync(resolve(ROOT, "docker/build-probe.Dockerfile"))) {
    console.error("✗ missing docker/build-probe.Dockerfile");
    process.exit(2);
  }
  console.log(
    "[serve-docker] building the IMAGE so the container sees your current source
" +
      "               (first run installs deps — several minutes; later runs reuse the layers)",
  );
  const b = run("docker", ["build", "-f", "docker/build-probe.Dockerfile", "-t", IMAGE, "."], {
    env: { ...process.env, DOCKER_BUILDKIT: "1" },
  });
  if (b.status !== 0) {
    console.error("✗ image build failed");
    process.exit(1);
  }
}

const envArgs = dockerEnvArgs(ROOT);
if (!envArgs.length) {
  console.error(
    "✗ no .env.local. The build's prerender phase makes real Firestore reads and will fail,\n" +
      "  and the served app cannot authenticate. This is not optional.",
  );
  process.exit(2);
}

if (argv.includes("--cold")) {
  run("docker", ["volume", "rm", "-f", CACHE_VOLUME], { capture: true });
  console.log("[serve-docker] build cache discarded");
}

/* Say which build is coming, because the difference is 4 GB and 3 minutes and
 * an unexplained 5-minute wait reads as a hang. */
const volumes = run("docker", ["volume", "ls", "--format", "{{.Name}}"], { capture: true });
const warm = String(volumes.stdout ?? "").split(/\r?\n/).includes(CACHE_VOLUME);
console.log(
  warm
    ? "[serve-docker] build cache present — WARM build (~4.4 GB, ~2 min)"
    : "[serve-docker] no build cache — COLD build (~8.1 GB, ~5 min). It needs the swap\n" +
      "               allowance to complete on this VM; every build after it is warm.",
);

/* A stale container holding the port is the commonest failure here, and its
 * error ("port is already allocated") does not say which container. */
run("docker", ["rm", "-f", NAME], { capture: true });

console.log(
  `[serve-docker] building + serving on http://localhost:${PORT} · ` +
    `--memory=${MEMORY} --memory-swap=${MEMORY_SWAP}\n` +
    "  🛑 Firestore/Auth/Storage are the LIVE project — this isolates memory, not data.\n",
);

/*
 * Build and serve in ONE container so the build output is on the same
 * filesystem `next start` reads. Splitting them would need the whole .next tree
 * in a volume, and a half-written .next served to a tester is worse than a slow
 * start.
 *
 * 🛑 `-H 0.0.0.0` is required. `next start` binds localhost by default, which
 * inside a container means the container's own loopback — the published port
 * accepts the connection and nothing is listening on it, so `curl` reports a
 * reset rather than a refusal and it reads like an app fault.
 */
const r = run("docker", [
  "run", "--rm",
  "--name", NAME,
  `--memory=${MEMORY}`,
  `--memory-swap=${MEMORY_SWAP}`,
  "-p", `${PORT}:${PORT}`,
  "-v", `${CACHE_VOLUME}:/app/.next/cache`,
  ...envArgs,
  IMAGE,
  "sh", "-lc",
  `NODE_OPTIONS='--max-old-space-size=4096' npm run build && ` +
    `echo '--- build done, serving ---' && ` +
    `npx next start -H 0.0.0.0 -p ${PORT}`,
]);

process.exit(r.status ?? 1);
