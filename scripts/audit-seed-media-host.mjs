#!/usr/bin/env node
/**
 * audit-seed-media-host.mjs — a seed file names no image host.
 *
 * ## What this is actually protecting against
 *
 * On 2026-08-31 picsum.photos went down — 503 from its origin AND from its own
 * Fastly CDN. The seed catalogue had its URL written out **409 times across 30
 * files**, so virtually every image on the production site broke at once, and
 * there was no single edit that could move them.
 *
 * The outage was not the defect. A third party going down is not preventable.
 * Being unable to react in one line is, and that is what a host repeated 409
 * times costs you.
 *
 * So: image URLs in seed data go through `seedPhoto()`, which names the host
 * once. A raw host literal is the thing being blocked.
 *
 * ## What is deliberately still allowed
 *
 * `seedExtMedia()` with a raw URL for **non-image** media, because the image
 * proxy is image-only and 400s on anything else (Root Cause #27):
 *
 *   - raw `.mp4` video URLs, which must reach a `<video>` element unwrapped
 *   - `youtube.com` / `youtu.be` watch URLs, rendered as an iframe embed
 *   - `wa.me`, social profile links, brand websites — not media at all
 *
 * Those have no `seedPhoto()` equivalent and no shared-host risk: a dead
 * YouTube link degrades to one dead embed, not to every card on the site.
 *
 * Strict-zero. Suppression: `// audit-seed-media-host-ok: <reason>`.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MARKER = "audit-seed-media-host-ok";

const SEED_ROOTS = [
  "appkit/src/seed",
  "appkit/src/features/tester/seed-data",
];

/** The file that is ALLOWED to name a host — that is its whole job. */
const HOST_OWNER = "appkit/src/seed/_helpers/media.ts";

/**
 * Hosts that serve IMAGES. A literal pointing at one of these in seed data is
 * the pattern being blocked; the list is open-ended by design — see
 * `looksLikeImageUrl` for the shape-based catch.
 */
const IMAGE_HOSTS = [
  "picsum.photos",
  "placehold.co",
  "placekitten.com",
  "loremflickr.com",
  "dummyimage.com",
  "via.placeholder.com",
  "images.unsplash.com",
  "source.unsplash.com",
  "cloudinary.com",
  "imgur.com",
];

/** A URL that ends in an image extension, whatever the host. */
function looksLikeImageUrl(url) {
  return /\.(png|jpe?g|webp|gif|avif|bmp)(\?|$)/i.test(url);
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

const violations = [];

for (const root of SEED_ROOTS) {
  for (const file of walk(join(ROOT, root))) {
    const rel = file.slice(ROOT.length + 1).replace(/\\/g, "/");
    if (rel === HOST_OWNER) continue;

    const raw = readFileSync(file, "utf8");
    const lines = stripComments(raw).split(/\r?\n/);
    const rawLines = raw.split(/\r?\n/);

    lines.forEach((line, i) => {
      if (
        (rawLines[i] ?? "").includes(MARKER) ||
        (rawLines[i - 1] ?? "").includes(MARKER)
      ) return;

      for (const m of line.matchAll(/https:\/\/[^\s"'`)]+/g)) {
        const url = m[0];
        const host = IMAGE_HOSTS.find((h) => url.includes(h));
        if (!host && !looksLikeImageUrl(url)) continue;
        violations.push({
          file: rel,
          line: i + 1,
          detail: host
            ? `Raw image host "${host}". Use seedPhoto(seed, w, h) — the host is named once, in ${HOST_OWNER}, so an outage is a one-line fix rather than a ${"409"}-literal sweep.`
            : `Raw image URL "${url.slice(0, 70)}". Use seedPhoto(seed, w, h), or add the marker if this is genuinely non-image media the proxy must not touch.`,
        });
      }
    });
  }
}

if (violations.length === 0) {
  console.log("[audit-seed-media-host] OK — 0 violations (no seed file names an image host)");
  process.exit(0);
}

console.error(`[audit-seed-media-host] ${violations.length} violation(s).\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`    ${v.detail}\n`);
}
console.error(`Suppress a genuine non-image exception with: // ${MARKER}: <reason>`);
process.exit(1);
