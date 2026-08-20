// sync-appkit-dist.mjs — closes Root Cause Pattern #28 (CLAUDE.md): on this
// Windows setup, `node_modules/@mohasinac/appkit` is a real directory copy,
// not a symlink/junction, so `npm install` does not reliably resync it with
// `appkit/dist/` or `appkit/scripts/` after a local rebuild. Any script that
// resolves the package through node_modules (Next.js's bundler, `npx appkit-*`
// CLIs) can silently keep running stale code. `tsc --noEmit` is NOT affected
// (tsconfig.json's `file:` pin mode includes appkit/src/** directly), so this
// class of drift is invisible to `npm run check`.
import { existsSync, lstatSync, readdirSync, rmSync, cpSync, readFileSync, statSync } from "fs";
import { createHash } from "crypto";
import path from "path";

const SYNCED_DIRS = ["dist", "scripts"];

export function isLocalAppkitPin(rootDir) {
  const pkg = JSON.parse(readFileSync(path.join(rootDir, "package.json"), "utf8"));
  return pkg.dependencies?.["@mohasinac/appkit"] === "file:./appkit";
}

function hashDir(dir) {
  const hash = createHash("sha1");
  function walk(current) {
    const entries = readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        const stat = statSync(full);
        hash.update(path.relative(dir, full));
        hash.update(String(stat.size));
      }
    }
  }
  if (existsSync(dir)) walk(dir);
  return hash.digest("hex");
}

/**
 * Resync appkit/{dist,scripts} into node_modules/@mohasinac/appkit/{dist,scripts}
 * when the consumer is pinned to "file:./appkit" and the node_modules copy is
 * a real directory (not a symlink/junction — those stay live automatically).
 *
 * @param {string} rootDir - consumer project root (contains package.json + appkit/)
 * @param {{ check?: boolean }} [opts] - check: report staleness without copying
 * @returns {{ skipped: boolean, reason?: string, synced: string[], alreadyFresh: string[] }}
 */
export function syncAppkitLocal(rootDir, { check = false } = {}) {
  const result = { skipped: false, synced: [], alreadyFresh: [] };

  if (!isLocalAppkitPin(rootDir)) {
    return { ...result, skipped: true, reason: "not pinned to file:./appkit" };
  }

  const srcRoot = path.join(rootDir, "appkit");
  const destRoot = path.join(rootDir, "node_modules", "@mohasinac", "appkit");

  if (!existsSync(destRoot)) {
    return { ...result, skipped: true, reason: "node_modules/@mohasinac/appkit not installed yet" };
  }

  if (lstatSync(destRoot).isSymbolicLink()) {
    return { ...result, skipped: true, reason: "node_modules copy is a real symlink — stays live automatically" };
  }

  for (const dir of SYNCED_DIRS) {
    const srcDir = path.join(srcRoot, dir);
    const destDir = path.join(destRoot, dir);
    if (!existsSync(srcDir)) continue;

    const same = hashDir(srcDir) === hashDir(destDir);
    if (same) {
      result.alreadyFresh.push(dir);
      continue;
    }

    result.synced.push(dir);
    if (!check) {
      rmSync(destDir, { recursive: true, force: true });
      cpSync(srcDir, destDir, { recursive: true });
    }
  }

  return result;
}
