#!/usr/bin/env node
/*
 * Does the build fit in Vercel Hobby's container? Answered in a Linux cgroup.
 *
 * 🛑 WHY NOT probe-build-memory.mjs: on Windows it cannot answer this. Three
 * cold builds of a byte-identical config measured private commit
 * 6900 / 7338 / 9064 MB — a 2,164 MB spread that tracked FREE RAM almost
 * monotonically (5.94 GB -> 6900, 6.56 -> 7338, 7.06 -> 9064), because Windows
 * trims working sets under pressure so the low readings under-report.
 * summarize-build-memory.mjs puts the noise floor at 1,490 MB, which is wider
 * than the effect. No number from that harness can settle an 8,192 MB question.
 *
 * A cgroup does not trim. `--memory=8g --cpus=2` makes the answer BINARY: the
 * build completes, or the kernel OOM-kills it (exit 137). There is no noise
 * floor on "did the process survive".
 *
 * 🛑 AND IT IS STILL NOT A DEPLOY. This answers "does the build fit", nothing
 * else. Root Cause #69's class — ERR_REQUIRE_ESM at Lambda module load — needs
 * a real Lambda and the post-deploy smoke test in scripts/deploy.mjs. A green
 * run here is necessary and not sufficient.
 *
 * Usage:
 *   node scripts/probe-build-docker.mjs --build          build the image first
 *   node scripts/probe-build-docker.mjs --memory 8g --cpus 2 --runs 3
 *   node scripts/probe-build-docker.mjs --memory 4g      find the real floor
 *
 * @tag domain:build
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:runs docker
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};

const MEMORY = opt("memory", "8g");
const CPUS = opt("cpus", "2");
const RUNS = Number(opt("runs", "3"));
const DO_BUILD = argv.includes("--build");
const IMAGE = "letitrip-build-probe";
const ROOT = process.cwd();

/*
 * ── MATCHING VERCEL ON ALL FOUR AXES ────────────────────────────────────────
 *
 * CPU     `--cpus` caps the quota but lets the scheduler spread the work over
 *         all 16 host cores, which is not what a 2-vCPU machine feels like.
 *         `--cpuset-cpus` pins it to exactly two. Both are set.
 *
 *         🛑 Neither changes what Node SEES. libuv reads /proc/cpuinfo, so
 *         `os.cpus()` still reports the host's 16 inside the container — the
 *         same trap as Root Cause #95, where Vercel's 2-vCPU container asked
 *         for 31 workers because os.cpus() reported the HOST. next.config.js
 *         pins `cpus: 2` explicitly, which is why that is already handled; do
 *         not remove it on the theory that the container bounds it.
 *
 * RAM     `--memory` plus `--memory-swap` equal, so there is no swap to hide a
 *         peak that should have been an OOM.
 *
 * CACHE   Vercel RESTORES a build cache on most deploys — that is why its
 *         compile is 23.7s where a cold one is 70-122s. Both states matter and
 *         neither alone is "the" answer: cold is the worst case (and what an
 *         appkit version bump forces), warm is the common one. `--warm` keeps
 *         .next/cache in a named volume between runs.
 *
 * DISK    🛑 NOT ENFORCED, and saying so beats faking it. A hard quota needs
 *         `--storage-opt size=`, which requires devicemapper/btrfs/zfs or xfs
 *         with pquota; this daemon runs overlayfs via the containerd
 *         snapshotter, where the flag is rejected. So instead of pretending,
 *         the probe MEASURES the build's disk footprint and prints it — if it
 *         lands far under Vercel's build-container allowance, the missing cap
 *         is moot, and if it does not, that is itself the finding.
 */
const CPUSET = opt("cpuset", "0,1");
const WARM = argv.includes("--warm");
const CACHE_VOLUME = "letitrip-build-probe-cache";

function run(cmd, args, { capture = false, env } = {}) {
  return spawnSync(cmd, args, {
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
    cwd: ROOT,
    ...(env ? { env } : {}),
  });
}

/* Daemon reachable? The CLI being installed proves nothing — Docker Desktop
 * can be stopped, which is exactly the state this was written in. */
const info = run("docker", ["info", "--format", "{{.OSType}}/{{.NCPU}}"], { capture: true });
if (info.status !== 0) {
  console.error(
    "✗ Docker daemon is not reachable.\n" +
      "  Start Docker Desktop and retry. (The CLI alone is not enough.)\n" +
      `  ${String(info.stderr ?? "").trim().split("\n")[0]}`,
  );
  process.exit(2);
}
const [osType] = String(info.stdout).trim().split("/");
if (osType !== "linux") {
  console.error(
    `✗ Docker is in ${osType} container mode. This probe needs LINUX containers —\n` +
      "  cgroup memory accounting is the entire point. Switch in Docker Desktop.",
  );
  process.exit(2);
}

if (DO_BUILD) {
  const dockerfile = resolve(ROOT, "docker/build-probe.Dockerfile");
  if (!existsSync(dockerfile)) {
    console.error(`✗ missing ${dockerfile}`);
    process.exit(2);
  }
  console.log(`[probe-docker] building image ${IMAGE} (first run installs deps — several minutes)`);
  /* The exclude list lives at docker/build-probe.Dockerfile.dockerignore —
   * BuildKit's per-Dockerfile convention. A root .dockerignore would be the
   * alternative, but this repo has none and adding one risks surprising other
   * tooling. Requires BuildKit, which is the default in Docker 23+. */
  const b = run("docker", [
    "build",
    "-f", "docker/build-probe.Dockerfile",
    "-t", IMAGE,
    ".",
  ], { env: { ...process.env, DOCKER_BUILDKIT: "1" } });
  if (b.status !== 0) {
    console.error("✗ image build failed — fix that before measuring anything.");
    process.exit(1);
  }
}

/* .env.local is gitignored and excluded from the image, but the prerender
 * phase makes real Firestore reads and the build dies without credentials. */
const envFile = resolve(ROOT, ".env.local");
const envArgs = existsSync(envFile) ? ["--env-file", envFile] : [];
if (!envArgs.length) {
  console.warn(
    "⚠ no .env.local — the prerender phase makes Firestore reads and will fail.\n" +
      "  That failure is environmental, not a memory result.",
  );
}

/*
 * A warm run needs the cache to SURVIVE the container, so .next/cache lives in
 * a named volume. A cold run must not see it — and must not inherit a previous
 * warm run's either, which is why the volume is removed rather than just
 * unmounted.
 */
if (!WARM) {
  run("docker", ["volume", "rm", "-f", CACHE_VOLUME], { capture: true });
}
const cacheArgs = WARM ? ["-v", `${CACHE_VOLUME}:/app/.next/cache`] : [];

console.log(
  `\n[probe-docker] ${RUNS} run(s) · --memory=${MEMORY} --memory-swap=${MEMORY} ` +
    `--cpus=${CPUS} --cpuset-cpus=${CPUSET} · ${WARM ? "WARM cache" : "COLD cache"}`,
);
console.log("  Hobby's fixed machine is 2 vCPU / 8 GB. SIGKILL / 137 = OOM-killed by the kernel.");
console.log("  Disk is measured, not capped — overlayfs rejects --storage-opt size.\n");

const results = [];
for (let i = 1; i <= RUNS; i += 1) {
  const started = Date.now();
  /* CAPTURED, not inherited — the SIGKILL probe below reads the output, and
   * with `stdio: inherit` r.stdout is null so the check silently never fires.
   * The tail is printed on failure. */
  const r = run("docker", [
    "run", "--rm",
    `--memory=${MEMORY}`,
    /* No swap headroom: --memory alone lets the container swap and survive a
     * peak it should not have survived, which would turn a real OOM into a
     * slow pass and report a fit that Vercel will not reproduce. */
    `--memory-swap=${MEMORY}`,
    `--cpus=${CPUS}`,
    `--cpuset-cpus=${CPUSET}`,
    ...cacheArgs,
    ...envArgs,
    IMAGE,
    /* Report the build's disk footprint, since it cannot be capped here. */
    "sh", "-lc",
    "NODE_OPTIONS='--max-old-space-size=4096' npm run build; rc=$?; " +
      "echo \"PROBE_DISK_NEXT=$(du -sm .next 2>/dev/null | cut -f1)\"; " +
      "echo \"PROBE_DISK_NM=$(du -sm node_modules 2>/dev/null | cut -f1)\"; " +
      "echo \"PROBE_DISK_TOTAL=$(du -sm . 2>/dev/null | cut -f1)\"; exit $rc",
  ], { capture: true });
  const secs = Math.round((Date.now() - started) / 1000);
  /*
   * 🛑 An OOM kill does NOT reliably surface as exit 137 here. The container's
   * CMD is `npm run build`, and npm CATCHES the child's SIGKILL, prints
   * "npm error signal SIGKILL", and exits 1 itself. Checking only 137 reported
   * the first real OOM as a generic failure — which would have sent me hunting
   * a build bug that did not exist. Treat either signal as the kill.
   */
  const oom = r.status === 137 || /signal SIGKILL/.test(`${r.stdout ?? ""}${r.stderr ?? ""}`);
  results.push({ run: i, status: r.status, secs, oom });
  console.log(
    `  run ${i}: ${r.status === 0 ? "✓ completed" : oom ? "✗ OOM-KILLED" : `✗ exit ${r.status}`} in ${secs}s`,
  );
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const disk = (key) => (new RegExp(`PROBE_DISK_${key}=(\\d+)`).exec(out) ?? [])[1];
  const next = disk("NEXT");
  const total = disk("TOTAL");
  if (next || total) {
    console.log(
      `        disk: .next ${next ?? "?"} MB · node_modules ${disk("NM") ?? "?"} MB · total ${total ?? "?"} MB`,
    );
  }
  if (r.status !== 0) {
    const tail = out.trim().split("\n").filter((l) => !l.startsWith("PROBE_DISK_")).slice(-5);
    for (const line of tail) console.log(`        ${line}`);
  }
}

const ok = results.filter((r) => r.status === 0).length;
const oomed = results.filter((r) => r.oom).length;

console.log(`\n── ${ok}/${RUNS} completed · ${oomed} OOM-killed ──`);
if (ok === RUNS) {
  const times = results.map((r) => r.secs).sort((a, b) => a - b);
  console.log(`✓ the build FITS in ${MEMORY} on ${CPUS} vCPU. median ${times[Math.floor(times.length / 2)]}s`);
  console.log("  Next: confirm on a real deploy — a fitting build is not a working one (#69).");
  process.exit(0);
}
console.error(`✗ does NOT fit in ${MEMORY} on ${CPUS} vCPU.`);
process.exit(1);
