#!/usr/bin/env node
/**
 * audit-ssr-in-appkit — keep SSR code in appkit, route files as thin shims.
 *
 * Enforces the "Guiding Principle" from ssr-arch-tracker.md (CC-11):
 *   1. Next.js route files (opengraph-image, sitemap, robots, manifest, page, layout,
 *      route, generateMetadata) in src/app/** should be thin shims that delegate to
 *      appkit `_internal/server/features/<feature>/` helpers.
 *   2. No `_transform.ts` / `_adapter.ts` / `_helpers.ts` sidecars next to API routes —
 *      lift them into appkit `_internal/server/features/<feature>/adapters.ts` so they
 *      can be shared with SSR pages.
 *   3. No hardcoded consumer-specific strings (brand name, domain) inside
 *      `appkit/src/_internal/**` — they must flow through config / labels / opts so
 *      consumers can override. (Encapsulation + Override Contract.)
 *
 * The script flags violations with file path, line count, and the rule that fired.
 * Exits 0 on clean, 1 on violations. Use `--fix-suggest` for migration hints.
 */

import { readdir, readFile, stat } from "fs/promises";
import { join, relative, basename, dirname, extname } from "path";
import { fileURLToPath } from "url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const APP_DIR = join(ROOT, "src", "app");
const APPKIT_INTERNAL = join(ROOT, "appkit", "src", "_internal");

// A route file is a "shim" if it stays under this many non-blank, non-comment lines.
// Counting tightly: imports + a generate function + a thin call into appkit.
const SHIM_THRESHOLDS = {
  "opengraph-image.tsx": 40,
  "twitter-image.tsx": 40,
  "sitemap.ts": 30,
  "robots.ts": 20,
  "manifest.ts": 30,
};

// Sidecar files next to API routes that should live in appkit instead.
const FORBIDDEN_SIDECAR_PATTERNS = [
  /^_transform\.ts$/,
  /^_adapter\.ts$/,
  /^_adapters\.ts$/,
  /^_mapper\.ts$/,
  /^_helpers\.ts$/,
  /^_shape\.ts$/,
];

async function walk(dir) {
  let out = [];
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".next") continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) out = out.concat(await walk(full));
    else out.push(full);
  }
  return out;
}

function countSignificantLines(src) {
  return src
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//") && !l.startsWith("*") && !l.startsWith("/*")).length;
}

function importsAppkitServer(src) {
  return /from\s+["']@mohasinac\/appkit\/server["']/.test(src);
}

const violations = [];

const files = await walk(APP_DIR);

for (const file of files) {
  const name = basename(file);
  const rel = relative(ROOT, file);

  // Rule 1 — fat route shim files
  const threshold = SHIM_THRESHOLDS[name];
  if (threshold !== undefined) {
    const src = await readFile(file, "utf8");
    const lines = countSignificantLines(src);
    if (lines > threshold) {
      violations.push({
        file: rel,
        rule: `${name} exceeds shim threshold (${lines} > ${threshold} significant lines)`,
        hint: `Extract renderer/builder into appkit \`_internal/server/features/<feature>/\` and reduce this file to a thin shim that calls it.`,
      });
    }
    // Bonus check: shim should import from appkit server entry
    if (!importsAppkitServer(src) && lines > 10) {
      violations.push({
        file: rel,
        rule: `${name} does not import from "@mohasinac/appkit/server"`,
        hint: `If this file fetches data or builds SSR output, it should delegate to an appkit server helper.`,
      });
    }
  }

  // Rule 2 — forbidden sidecar files under src/app/api/**
  if (rel.includes(`${"src"}${"/"}app${"/"}api`) || rel.includes(`src\\app\\api`)) {
    if (FORBIDDEN_SIDECAR_PATTERNS.some((re) => re.test(name))) {
      violations.push({
        file: rel,
        rule: `forbidden sidecar \`${name}\` next to API route`,
        hint: `Move into appkit \`_internal/server/features/<feature>/adapters.ts\` so SSR pages + API routes share one source of truth.`,
      });
    }
  }
}

// Rule 3 — hardcoded consumer-specific strings inside appkit `_internal/`
// Encapsulation contract: appkit ships generic building blocks. Brand name,
// domain, and currency literals belong in `appkit.config.js` / `LabelsProvider`.
const HARDCODED_PATTERNS = [
  { pattern: /LetItRip/i, label: "hardcoded brand name 'LetItRip'" },
  { pattern: /letitrip\.in/i, label: "hardcoded domain 'letitrip.in'" },
];

const appkitFiles = await walk(APPKIT_INTERNAL);
for (const file of appkitFiles) {
  if (![".ts", ".tsx"].includes(extname(file))) continue;
  const rel = relative(ROOT, file);
  const src = await readFile(file, "utf8");
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("//") || line.trim().startsWith("*")) continue;
    for (const { pattern, label } of HARDCODED_PATTERNS) {
      if (pattern.test(line)) {
        violations.push({
          file: `${rel}:${i + 1}`,
          rule: `${label} inside appkit/_internal/`,
          hint: `Route through appkit.config.js, LabelsProvider, or function opts so consumers can override.`,
        });
      }
    }
  }
}

if (violations.length === 0) {
  console.log("audit-ssr-in-appkit: clean ✓");
  process.exit(0);
}

console.error(`audit-ssr-in-appkit: ${violations.length} violation(s) found.\n`);
for (const v of violations) {
  console.error(`[VIOLATION] ${v.rule}`);
  console.error(`  file: ${v.file}`);
  console.error(`  hint: ${v.hint}\n`);
}
process.exit(1);
