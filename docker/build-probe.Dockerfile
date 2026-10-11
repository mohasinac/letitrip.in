# Reproduce Vercel's build container so build memory can be MEASURED rather
# than inferred.
#
# 🛑 WHY: every local measurement on Windows was unusable. Three cold builds of
# byte-identical config gave private commit 6900 / 7338 / 9064 MB — a 2,164 MB
# spread that tracked FREE RAM almost monotonically (5.94 GB -> 6900,
# 6.56 -> 7338, 7.06 -> 9064). Windows trims working sets under pressure, so
# the low readings UNDER-report. summarize-build-memory.mjs puts the noise
# floor at 1,490 MB, wider than the effect. No number from that harness can
# settle an 8,192 MB question.
#
# A Linux cgroup does not trim. `--memory=8g --memory-swap=8g --cpus=2` makes
# the answer BINARY: the build completes, or the kernel OOM-kills it (137).
#
# ── FIDELITY TO VERCEL ──────────────────────────────────────────────────────
# Matched deliberately, each verified against the live project rather than
# assumed:
#   OS              Amazon Linux 2023      (Vercel's current build image)
#   Node            24.x                   (project `nodeVersion`, read from
#                                           the Vercel API — note the local
#                                           .vercel/project.json says 22.x and
#                                           is a stale link-time snapshot)
#   install         npm ci --legacy-peer-deps        (vercel.json)
#   build           NODE_OPTIONS=--max-old-space-size=4096 npm run build
#                                                    (vercel.json)
#   env             VERCEL / VERCEL_ENV / CI, as the platform sets them
#
# 🛑 NOT a deploy. This answers "does the build fit in 8 GB on 2 vCPU" and
# nothing else. Root Cause #69's class (ERR_REQUIRE_ESM at Lambda module load)
# needs a real Lambda and scripts/deploy.mjs's post-deploy smoke test — Vercel
# once reported readyState READY while every route 500'd.

FROM public.ecr.aws/amazonlinux/amazonlinux:2023

# AL2023 ships nodejs20; the project is on 24, and the Node major is the one
# thing here that genuinely moves V8/Turbopack memory behaviour.
RUN dnf -y install --allowerasing tar gzip git python3 make gcc-c++ findutils \
 && curl -fsSL https://rpm.nodesource.com/setup_24.x | bash - \
 && dnf -y install nodejs \
 && dnf clean all \
 && node --version && npm --version

# Vercel sets these during a build; next.config.js and the app read some of
# them (COMMIT_SHA for the footer stamp, CI for non-interactive installs).
ENV VERCEL=1 \
    VERCEL_ENV=production \
    CI=1 \
    NEXT_TELEMETRY_DISABLED=1 \
    npm_config_cache=/npm-cache

WORKDIR /app

# ── source, then install ────────────────────────────────────────────────────
#
# 🛑 SOURCE FIRST, deliberately — and this is also what Vercel does. The
# manifest-only layer that would normally come first does not work here:
# package.json declares `postinstall: node scripts/sync-appkit.mjs`, which
# imports scripts/lib/sync-appkit-dist.mjs, so `npm ci` dies with
# MODULE_NOT_FOUND before installing anything. `--ignore-scripts` is not the
# answer either — it would also skip the native builds (@parcel/watcher, swc)
# that genuinely need theirs.
#
# The usual cost of copying first is losing layer caching on the install. The
# BuildKit cache mount below removes that: a source edit re-runs `npm ci` but
# re-downloads nothing.
#
# 🛑 node_modules is NEVER copied from the host — see the .dockerignore beside
# this file. The Windows tree carries platform-specific binaries that are wrong
# here, and a half-working native module fails in ways that look like code bugs.
COPY . .

# Exactly vercel.json's installCommand. The cache is a MOUNT, not a layer —
# nothing from it ships in the image.
RUN --mount=type=cache,target=/npm-cache,sharing=locked \
    npm ci --legacy-peer-deps

# appkit compiles against its OWN zod (3.25.76) while the root has 4.4.3.
# Without this, tsc emits ~40 bogus Zod-v4 type errors that read as real
# breakage — it cost an hour in the worktree before being diagnosed.
RUN --mount=type=cache,target=/npm-cache,sharing=locked \
    npm --prefix ./appkit install --legacy-peer-deps

# 🛑 The consumer pins @mohasinac/appkit from the REGISTRY (^4.43.0), and the
# published tarball contains none of this branch's appkit work. Build the local
# source and overlay its dist, or the measurement is of the old package.
RUN npm --prefix ./appkit run build \
 && rm -rf node_modules/@mohasinac/appkit/dist \
 && cp -r appkit/dist node_modules/@mohasinac/appkit/dist \
 && cp appkit/package.json node_modules/@mohasinac/appkit/package.json

# globals.compiled.css is generated and gitignored; layout.tsx imports it, so
# the build hard-fails on a missing module without this. Vercel regenerates it
# the same way via the build script chain.
RUN npm run build:css

# The build is the MEASURED step, so it runs at `docker run` time under the
# cgroup limits. Exactly vercel.json's buildCommand, including the heap cap —
# which is itself worth measuring, since Turbopack's arena sits outside the V8
# heap and the flag was never the binding constraint.
CMD ["sh", "-lc", "NODE_OPTIONS='--max-old-space-size=4096' npm run build"]
