/**
 * Download an image and crop it to an exact slot aspect.
 *
 * WHY THIS EXISTS: three fetchers each hand-rolled this.
 * `fetch-editorial-images.mjs` has its own `download()` plus an inline
 * `sharp().resize(w, h, { fit: "cover" })`; `fetch-product-images.mjs`
 * re-declares the Fandom header block rather than importing the one in
 * `wiki-images.mjs`, with a comment acknowledging it is the same mechanism.
 * Adding Openverse would have made a fourth copy.
 *
 * 🛑 This is NOT `wiki-images.mjs`'s `downloadAsWebp`, and the two must not be
 * merged. That one resizes by WIDTH ONLY and flattens onto white, which is
 * correct for a transparent product PNG — a `fit: cover` crop to 1200x630
 * would slice the top and bottom off the item. This one crops to an exact
 * box, which is correct for an editorial slot whose layout reserves a fixed
 * aspect. Different contracts; the right one depends on the subject.
 *
 * @tag layer:script
 * @tag access:node-only
 */

import fs from "node:fs";
import path from "node:path";

/**
 * Fetch bytes with a timeout and an explicit header set.
 *
 * 🛑 `headers` is a REQUIRED argument with no default, because the correct
 * value is per-source and getting it wrong is silent:
 *
 *   - Wikimedia asks for a descriptive contactable bot UA and rate-limits a
 *     generic one.
 *   - `static.wikia.nocookie.net` checks `Referer`, not User-Agent — measured,
 *     a browser UA alone gets 403 text/html and the identical request with the
 *     right Referer gets 200 image/webp.
 *   - Openverse serves bytes from THIRD-PARTY CDNs (Flickr, SmugMug, museum
 *     hosts). A Fandom Referer there is wrong and can itself be refused.
 *
 * A default would quietly be wrong for two of the three.
 */
export async function fetchBytes(url, headers, { timeoutMs = 30_000 } = {}) {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
  }
  const type = res.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) {
    // A hotlink-protected host answers 200 with an HTML "please don't" page,
    // which sharp would reject later with a far less obvious message.
    throw new Error(`expected an image, got ${type || "no content-type"} for ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Download, crop to `width` x `height`, encode WebP, write to `destPath`.
 *
 * `position: "attention"` is sharp's saliency crop — it keeps the busiest
 * region rather than the centre, which matters because a 1920x860 hero taken
 * from a 4:3 original otherwise cuts the subject in half.
 *
 * @returns {Promise<number>} bytes written
 */
export async function downloadCropped(
  src,
  destPath,
  { width, height, quality = 82, headers, timeoutMs = 30_000 },
) {
  if (!width || !height) {
    throw new Error("downloadCropped needs both width and height — that is the whole point of it");
  }
  // Required at the call site rather than at module load: a script that only
  // reads the manifest should not pay for sharp's native binary.
  const sharp = (await import("sharp")).default;

  const raw = await fetchBytes(src, headers, { timeoutMs });
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  await sharp(raw)
    .resize(width, height, { fit: "cover", position: "attention" })
    .webp({ quality })
    .toFile(destPath);

  return fs.statSync(destPath).size;
}
