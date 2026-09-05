#!/usr/bin/env node
/**
 * audit-seed-external-urls — blocks raw 3rd-party media URLs in seed data.
 *
 * Rule: any image/video URL written in appkit/src/seed/** MUST be routed
 * through our media proxy:
 *   - `/media/<path>`          (Firebase Storage / signed-upload assets)
 *   - `/api/media/ext?url=...` (watermarked external proxy)
 *
 * Raw https://images.ygoprodeck.com/... or https://images.unsplash.com/...
 * URLs bypass watermarking, hot-link a 3rd party CDN from prod, and
 * surface as broken-image icons whenever the upstream rate-limits or
 * blocks Vercel egress. Seed writers must call /api/media/ext or import
 * `seedExtMedia()` (see appkit/src/seed/_helpers/media.ts).
 *
 * Detection
 *   A line is flagged when it contains a literal https?:// URL that EITHER
 *     (a) hits a known image/video CDN host (ygoprodeck, unsplash, picsum,
 *         imgur, discord cdn, …), OR
 *     (b) ends in a media extension (jpg/jpeg/png/webp/gif/svg/avif/mp4/webm/mov).
 *
 *   Exemptions:
 *     - URL already starts with /media/ or /api/media/ext  (already proxied).
 *     - URL is the *encoded value* inside ?url=... of an /api/media/ext call.
 *     - Line carries `// audit-seed-external-url-ok` marker with a reason.
 *
 * Exits 0 — clean
 * Exits 1 — one or more raw 3rd-party media URLs found
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SEED_DIR = join(ROOT, "appkit", "src", "seed");

const SCAN_EXTS = new Set([".ts", ".tsx", ".mjs", ".js"]);
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", ".git"]);

const MEDIA_HOSTS = [
  "images.ygoprodeck.com",
  "images.unsplash.com",
  "picsum.photos",
  "i.imgur.com",
  "cdn.discordapp.com",
  "media.discordapp.net",
  "cdn.example-ads.com",
];

const MEDIA_EXT_RE = /\.(jpg|jpeg|png|webp|gif|svg|avif|mp4|webm|mov|m4v|mp3|wav|pdf)(\?|$|#|"|')/i;
const URL_RE = /https?:\/\/[^\s"'`)<>\\]+/g;
const SUPPRESS_RE = /\/\/\s*audit-seed-external-url-ok\b/;

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (SCAN_EXTS.has(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function isMediaUrl(url) {
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    return false;
  }
  if (MEDIA_HOSTS.includes(host)) return true;
  if (MEDIA_EXT_RE.test(url)) return true;
  return false;
}

function isAlreadyProxied(url, line, prevLine) {
  // The URL itself — never; it's an absolute https URL by construction.
  // But it may appear as the *value* of ?url=... in an /api/media/ext call.
  // In that case the literal occurrence of the raw URL is intentional
  // (it's encoded inside our wrapper) — skip.
  if (line.includes("/api/media/ext?url=") || line.includes("MEDIA_ENDPOINTS.EXT_URL")) {
    return true;
  }
  if (line.includes("seedExtMedia(") || line.includes("resolveMediaUrl(")) {
    return true;
  }
  // Multi-line wrappers — the previous line opens the call, this line carries the URL.
  if (prevLine && /seedExtMedia\(\s*$|resolveMediaUrl\(\s*$/.test(prevLine)) {
    return true;
  }
  return false;
}

const violations = [];

for (const file of walk(SEED_DIR)) {
  // The helper file itself is allowed to reference the proxy path.
  if (file.endsWith(join("_helpers", "media.ts"))) continue;
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (SUPPRESS_RE.test(line)) continue;
    const matches = line.match(URL_RE);
    if (!matches) continue;
    if (isAlreadyProxied(undefined, line, i > 0 ? lines[i - 1] : undefined)) continue;
    for (const url of matches) {
      if (!isMediaUrl(url)) continue;
      violations.push({
        file: relative(ROOT, file),
        line: i + 1,
        url,
        snippet: line.trim().slice(0, 140),
      });
    }
  }
}

/**
 * 🛑 The catalogue seed may not reach into the QA fixture directory.
 *
 * `public/test-media/` holds upload fixtures for the tester — deliberately garish
 * images plus files that are BROKEN ON PURPOSE (zero-length, text bytes named .png)
 * so the 422 path can be exercised. Its own README says nothing in it should be
 * mistakable for real product media.
 *
 * The catalogue seed is real demo content. When it points at that directory, the
 * homepage carousel plays a QA fixture as merchandise, and anyone who later prunes
 * the fixture folder — reasonably believing it is test-only — silently breaks the
 * live catalogue. That is exactly what happened on 2026-09-05: the Google sample
 * bucket started 403ing, every seeded video was repointed at the nearest local file,
 * and the nearest local file was the QA fixture set.
 *
 * Catalogue content lives in `public/demo-media/`. Same bytes today, separate
 * ownership, and this is the rule that keeps them separate.
 */
for (const file of walk(SEED_DIR)) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (SUPPRESS_RE.test(lines[i])) continue;
    if (!/["'`]\/test-media\//.test(lines[i])) continue;
    violations.push({
      file: relative(ROOT, file),
      line: i + 1,
      url: "/test-media/… — QA upload fixtures; catalogue content belongs in /demo-media/",
      snippet: lines[i].trim().slice(0, 140),
    });
  }
}

if (violations.length === 0) {
  console.log("audit-seed-external-urls: clean");
  process.exit(0);
}

console.error(
  `audit-seed-external-urls: ${violations.length} raw 3rd-party media URL(s) found in appkit/src/seed/.`,
);
console.error("");
console.error("Every image/video URL in seed data must be routed through our proxy.");
console.error("Fix by wrapping with one of:");
console.error('  - seedExtMedia("https://...")   // helper that emits /api/media/ext?url=<encoded>');
console.error('  - MEDIA_ENDPOINTS.EXT_URL("https://...")  // same, from constants/api-endpoints');
console.error('  - resolveMediaUrl("https://...")  // runtime normalizer (returns string | undefined)');
console.error("");
console.error("Or move the asset to Firebase Storage and reference it as `/media/<slug>`.");
console.error("");
console.error("Per-line exemption (use sparingly, add a reason):");
console.error("  url: \"https://example.com/legit-fallback.jpg\", // audit-seed-external-url-ok: ...");
console.error("");
console.error("Violations:");
const byFile = new Map();
for (const v of violations) {
  if (!byFile.has(v.file)) byFile.set(v.file, []);
  byFile.get(v.file).push(v);
}
for (const [file, list] of byFile) {
  console.error(`  ${file}  (${list.length})`);
  for (const v of list.slice(0, 5)) {
    console.error(`    L${v.line}: ${v.url}`);
  }
  if (list.length > 5) console.error(`    … +${list.length - 5} more`);
}
process.exit(1);
