#!/usr/bin/env node
/**
 * resync-appkit — make the consumer see local appkit changes WITHOUT publishing.
 *
 * ## Why this exists rather than `file:./appkit`
 *
 * CLAUDE.md documents `file:./appkit` as the local-dev mode. On THIS machine it
 * does not work: `npm install` leaves `node_modules/@mohasinac/appkit` as a real
 * directory copied from the registry tarball, not a symlink, and re-running
 * install does not relink it (Root Cause #28 / project_windows_appkit_symlink_gotcha).
 * Verified again this session — the pin read `file:./appkit` while the lockfile
 * still resolved `registry/@mohasinac/appkit-4.30.15.tgz`.
 *
 * ## Why not a tsconfig `paths` redirect either
 *
 * Mapping `@mohasinac/appkit` -> `appkit/src/index.ts` would typecheck against a
 * DIFFERENT module than production resolves: the package's `exports["."]` points
 * at `server-entry.ts`, not `index.ts`, and those two export different
 * `ValidationError` classes (Root Cause #53). A redirect would quietly validate
 * code against the wrong entry point — inventing errors and, worse, hiding real
 * ones.
 *
 * ## So: build, then copy dist over the installed copy
 *
 * Resolution semantics stay byte-identical to production — same entry points,
 * same `exports` map, same subpaths — and only the compiled output is newer.
 *
 * 🛑 `npm install` clobbers this. Re-run after any install, and note that until
 * the release the lockfile claims a version whose dist is NOT what is on disk.
 * Phase 4's publish + repin restores that truth.
 */
import { execSync } from "node:child_process";
import { cpSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "appkit", "dist");
const DEST = join(ROOT, "node_modules", "@mohasinac", "appkit", "dist");

if (!existsSync(join(ROOT, "appkit", "package.json"))) {
  console.error("resync-appkit: run from the consumer repo root.");
  process.exit(1);
}

const skipBuild = process.argv.includes("--no-build");
if (!skipBuild) {
  console.log("resync-appkit: building appkit…");
  execSync("npm --prefix ./appkit run build", { stdio: "inherit" });
}

if (!existsSync(SRC)) {
  console.error(`resync-appkit: ${SRC} missing — build failed?`);
  process.exit(1);
}

rmSync(DEST, { recursive: true, force: true });
cpSync(SRC, DEST, { recursive: true });
console.log(`resync-appkit: dist -> node_modules ✓`);
