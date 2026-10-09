#!/usr/bin/env node
/**
 * audit-media-proxy-hosts — strict zero.
 *
 * ## Why this exists
 *
 * On 2026-10-09 this project was suspended by Vercel (HTTP 402) for exceeding
 * the Hobby caps, with Fast Origin Transfer at 52.52 GB against a 10 GB
 * allowance and Function Invocations at 1.7M against 1M. Against **11 monthly
 * active users**.
 *
 * The cause was that every seeded image was persisted as
 * `/api/media/ext?url=https://placehold.co/…`, so rendering one meant invoking a
 * Node lambda that fetched a third party (up to 2 × 4 s) and ran a full sharp
 * decode/watermark/encode. The homepage referenced **160** of them. Dividing the
 * billed transfer by the 49.5 KB measured per image gives ~1.06M proxy responses
 * in a week.
 *
 * Two rules, both guarding the fix:
 *
 *   R1 NEW_PLACEHOLDER_HOST — a placeholder-image host named in seed data.
 *      Placeholders are synthetic, so there is nothing to fetch: they belong in
 *      `public/images/seed-tiles/` as static files.
 *
 *   R2 EXT_URL_OUTSIDE_RESOLVER — a `MEDIA_ENDPOINTS.EXT_URL(...)` call outside
 *      the one resolver allowed to make that decision. Every such call site is a
 *      path that bypasses `resolveMediaUrl`'s placeholder bypass, which is the
 *      thing that keeps ~400 already-stored URLs from reaching the proxy.
 *
 * Suppression: `// audit-media-proxy-hosts-ok: <reason>` on the line or the one
 * above it. Reserve it for a genuinely external asset that must be watermarked.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");

const SKIP_DIRS = new Set(["node_modules", ".next", "dist", ".git", "coverage", "__tests__"]);
const EXTS = new Set([".ts", ".tsx"]);

/** Same recursive walk the other audits use (see audit-theme-invariant-hover). */
function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(join(dir, e.name), out);
    } else if (EXTS.has(extname(e.name))) {
      out.push(join(dir, e.name));
    }
  }
  return out;
}
const MARKER = "audit-media-proxy-hosts-ok";

/** Hosts that only ever serve synthetic placeholder imagery. */
const PLACEHOLDER_HOSTS = [
  "placehold.co",
  "placeholder.com",
  "picsum.photos",
  "placekitten.com",
  "loremflickr.com",
  "dummyimage.com",
];

/** The only files permitted to name a placeholder host or build an EXT url. */
const ALLOWED = [
  // The resolver itself — it names the hosts in order to AVOID them.
  join("appkit", "src", "utils", "media-url.ts"),
  // The route's own belt-and-braces denylist, deliberately a second copy.
  join("src", "app", "api", "media", "ext", "route.ts"),
  // The endpoint constant's own definition.
  join("appkit", "src", "constants", "api-endpoints.ts"),
  // `seedExtMedia` is the seed-side counterpart of the resolver: it exists so a
  // GENUINELY external seed asset (the Wikimedia video thumbnail, an unsplash
  // photo) is wrapped exactly once and idempotently. It is not how placeholder
  // imagery is produced any more — `seedPhoto` returns a local tile and no
  // longer calls it — so permitting the wrapper here does not reopen the hole.
  join("appkit", "src", "seed", "_helpers", "media.ts"),
  // This audit.
  join("scripts", "audit-media-proxy-hosts.mjs"),
];

const SCAN_ROOTS = [join("appkit", "src"), join("src")];

function isAllowed(rel) {
  return ALLOWED.some((a) => rel === a || rel.endsWith(sep + a));
}

/**
 * Blank out block AND line comments, preserving line numbers.
 *
 * A host named in prose — an explanatory comment, or a tester-case description
 * recording what the bug USED to be — is history, not a live URL. Flagging it
 * would make the audit un-passable without deleting the very explanation that
 * stops someone reintroducing the problem.
 */
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

const violations = [];

for (const root of SCAN_ROOTS) {
  for (const file of walk(join(REPO, root))) {
    const rel = relative(REPO, file);
    if (isAllowed(rel)) continue;
    const raw = readFileSync(file, "utf8");
    const lines = stripComments(raw).split("\n");
    const rawLines = raw.split("\n");

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const suppressed =
        (rawLines[i] ?? "").includes(MARKER) || (rawLines[i - 1] ?? "").includes(MARKER);
      if (suppressed) continue;

      for (const host of PLACEHOLDER_HOSTS) {
        if (line.includes(host)) {
          violations.push({
            rule: "NEW_PLACEHOLDER_HOST",
            file: rel,
            line: i + 1,
            detail: `names the placeholder host "${host}" — use public/images/seed-tiles/ instead`,
          });
        }
      }

      if (/MEDIA_ENDPOINTS\s*\.\s*EXT_URL\s*\(/.test(line)) {
        violations.push({
          rule: "EXT_URL_OUTSIDE_RESOLVER",
          file: rel,
          line: i + 1,
          detail:
            "builds an /api/media/ext URL directly — route it through resolveMediaUrl() so the placeholder bypass applies",
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.error(`audit-media-proxy-hosts: ${violations.length} violation(s) found.\n`);
  console.error(
    "Every image served through /api/media/ext is one Node lambda plus one\n" +
      "third-party fetch plus a sharp re-encode. That is what blew the Hobby\n" +
      "caps on 2026-10-09 (52.52 GB origin transfer, 1.7M invocations).\n",
  );
  for (const v of violations) {
    console.error(`  ${v.rule} — ${v.file}:${v.line}`);
    console.error(`    ${v.detail}`);
  }
  console.error(`\n  Suppression (rare, needs a reason): // ${MARKER}: <why>`);
  process.exit(1);
}

console.log("audit-media-proxy-hosts: clean ✓");
