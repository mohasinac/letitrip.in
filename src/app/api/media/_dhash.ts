/**
 * Perceptual hash of an uploaded image — plan A7.
 *
 * Lives here rather than in appkit because it needs `sharp`, which is a native
 * binary this project keeps in the Next.js app only (CLAUDE.md flags adding it
 * to the Firebase Functions runtime as an unverified deploy). The pure half —
 * the flag vocabulary, the filename heuristics and the Hamming comparison —
 * is in `@mohasinac/appkit/features/media/trust-signals`.
 *
 * ## dHash, not an average hash and not a cryptographic one
 *
 * A SHA of the bytes answers "is this the identical file", which a single
 * re-save in any editor defeats. dHash compares each pixel to its right-hand
 * neighbour on a 9x8 greyscale downscale, so it answers "is this the same
 * PHOTOGRAPH" — stable across re-encoding, resizing and quality changes, which
 * is what someone lifting a product shot from another listing actually does.
 *
 * 64 comparisons → 64 bits → 16 hex chars.
 */
import sharp from "sharp";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";

/** 9 wide so there are 8 left-to-right comparisons per row. */
const DHASH_WIDTH = 9;
const DHASH_HEIGHT = 8;

/**
 * 16-char hex dHash, or `undefined` when it cannot be computed.
 *
 * 🛑 NEVER throws. This runs inside the media finalize route, where the
 * upload has already succeeded and the bytes are already stored — failing the
 * request because a provenance heuristic could not run would turn an advisory
 * signal into an outage. A missing hash simply means no duplicate check for
 * this asset, which is the pre-A7 behaviour.
 */
export async function computeDHash(buffer: Buffer): Promise<string | undefined> {
  try {
    const raw = await sharp(buffer)
      .greyscale()
      // `fit: "fill"` on purpose — aspect ratio must NOT be preserved here, or
      // the same photo cropped to a different shape hashes differently and the
      // duplicate check misses exactly the case it exists for.
      .resize(DHASH_WIDTH, DHASH_HEIGHT, { fit: "fill" })
      .raw()
      .toBuffer();

    let bits = "";
    for (let y = 0; y < DHASH_HEIGHT; y += 1) {
      for (let x = 0; x < DHASH_WIDTH - 1; x += 1) {
        const left = raw[y * DHASH_WIDTH + x] ?? 0;
        const right = raw[y * DHASH_WIDTH + x + 1] ?? 0;
        bits += left > right ? "1" : "0";
      }
    }

    let hex = "";
    for (let i = 0; i < bits.length; i += 4) {
      hex += Number.parseInt(bits.slice(i, i + 4), 2).toString(16);
    }
    return hex;
  } catch (err) {
    void normalizeError(err);
    serverLogger.warn("dHash computation failed; asset stored without one", {
      error: err instanceof Error ? err.message : String(err),
    });
    return undefined;
  }
}
