# Reproduce Vercel Hobby's build container so build memory can be MEASURED
# rather than inferred.
#
# 🛑 WHY THIS EXISTS: every local measurement on Windows was unusable. Three
# cold builds of byte-identical config gave private commit 6900 / 7338 / 9064
# MB — a 2,164 MB spread that tracked FREE RAM almost monotonically
# (5.94 GB -> 6900, 6.56 -> 7338, 7.06 -> 9064). That is Windows trimming
# working sets under pressure, so the low readings under-report and the whole
# comparison is noise. summarize-build-memory.mjs puts the floor at 1,490 MB,
# wider than the effect being measured.
#
# A Linux cgroup does not trim. `docker run --memory=8g --cpus=2` gives a
# BINARY answer with no noise floor: the build completes, or the kernel
# OOM-kills it. That is also the right accounting model — Vercel's container
# kills on something close to private commit, which is what memory.max enforces.
#
# 🛑 WHAT THIS DOES NOT PROVE: it is not a deploy. Root Cause #69's failure
# class (ERR_REQUIRE_ESM at Lambda module load) needs a real Lambda and the
# post-deploy smoke test in scripts/deploy.mjs. This answers "does the build
# fit in 8 GB on 2 vCPU", and nothing else.

# Match Vercel's project nodeVersion (24.x, measured from the API). appkit's
# engines floor is >=22, so 24 satisfies both.
FROM node:24-bookworm-slim

# git: the repo has submodules and some tooling shells out to it.
# python3/make/g++: @parcel/watcher and swc build from source on some platforms.
RUN apt-get update \
 && apt-get install -y --no-install-recommends git python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── dependency layer ────────────────────────────────────────────────────────
# Copied first so a source edit does not re-run two npm installs.
#
# 🛑 node_modules is NEVER copied from the host. The Windows tree carries
# platform-specific binaries (@parcel/watcher, swc, sharp) that are wrong here,
# and a half-working native module fails in ways that look like code bugs.
COPY package.json package-lock.json ./
COPY appkit/package.json appkit/package-lock.json ./appkit/

RUN npm ci --legacy-peer-deps

# appkit compiles against its OWN zod (3.25.76) while the root has 4.4.3.
# Without this, tsc emits ~40 bogus Zod-v4 type errors that read as real
# breakage — it cost an hour in the worktree before being diagnosed.
RUN npm --prefix ./appkit install --legacy-peer-deps

# ── source ──────────────────────────────────────────────────────────────────
COPY . .

# 🛑 The consumer pins @mohasinac/appkit from the REGISTRY (^4.43.0), and the
# published tarball does not contain this branch's appkit changes. Build the
# local source and overlay its dist, or the measurement is of the old package.
RUN npm --prefix ./appkit run build \
 && rm -rf node_modules/@mohasinac/appkit/dist \
 && cp -r appkit/dist node_modules/@mohasinac/appkit/dist \
 && cp appkit/package.json node_modules/@mohasinac/appkit/package.json

# globals.compiled.css is generated and gitignored; layout.tsx imports it, so
# the build hard-fails on a missing module without this.
RUN npm run build:css

# The build is the MEASURED step, so it runs at `docker run` time under the
# cgroup limits — not here, where limits would not apply the same way.
CMD ["npx", "next", "build"]
