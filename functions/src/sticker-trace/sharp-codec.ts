/*
 * WHY: The tracing core is pure maths over a DecodedRaster and must never know
 *      what decoded it — that is what lets the browser tune a scan live and a
 *      Function re-run the identical algorithm at full resolution.
 * WHAT: The server half of the ImageCodec seam, on sharp.
 *
 * 🛑 `maxLongEdge` IS ENFORCED INSIDE decode, which the seam's own docstring
 * calls its single most important line. sharp downscales in NATIVE code during
 * decode, so a 34 MP source never materialises as a JS buffer. Decoding full
 * size and resizing afterwards would allocate ~136 MB per Float32Array
 * downstream and blow the 2 GiB coordinator — the failure looks like an OOM in
 * the maths, nowhere near the cause.
 *
 * 🛑 `limitInputPixels: false` on every sharp() call. sharp defaults to
 * refusing images above ~268 MP, and `@ShayBlader Scan 18` is 34 MP — fine
 * today, but a flatbed at 1200 dpi reaches the cap, and the error reads as a
 * corrupt file rather than a deliberate guard.
 *
 * EXPORTS: sharpCodec
 *
 * @tag domain:sticker-trace
 * @tag layer:server
 * @tag pattern:adapter
 * @tag access:server
 * @tag consumers:coordinator,shard
 * @tag sideEffects:none
 */

import sharp, { type Sharp, type OverlayOptions } from "sharp";
import type {
  DecodeOptions,
  DecodedRaster,
  EncodedImage,
  ImageCodec,
  PreviewOptions,
  ProbeResult,
  StickerRect as Rect,
} from "@mohasinac/appkit/server";

/** Every sharp entry point gets this — see the header on limitInputPixels. */
const OPEN = { limitInputPixels: false } as const;

/**
 * A declared density below this is an encoder default, not a measurement.
 *
 * Five of the nine reference scans say 72 or 96. The seam returns the raw value
 * and tells the caller to treat it as a suggestion; this threshold is where
 * that judgement is actually made, once, rather than at each call site.
 */
const MIN_TRUSTWORTHY_DPI = 150;

/** RGBA, exactly `width * height * 4`, which is what DecodedRaster promises. */
async function toRaster(
  pipeline: Sharp,
  dpi: number | undefined,
): Promise<DecodedRaster> {
  /*
   * removeAlpha().ensureAlpha() rather than ensureAlpha() alone: a source with
   * a partially transparent layer would otherwise carry its alpha into the
   * luminance the ridge detector reads, and a soft edge in the alpha channel
   * registers as a cut line that is not there.
   */
  const { data, info } = await pipeline
    .removeAlpha()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    width: info.width,
    height: info.height,
    data: new Uint8Array(data),
    ...(dpi !== undefined ? { dpi } : {}),
  };
}

export const sharpCodec: ImageCodec = {
  async probe(source: Uint8Array): Promise<ProbeResult> {
    // Header only — this runs on the full upload, so it must not decode pixels.
    const m = await sharp(Buffer.from(source), OPEN).metadata();
    return {
      width: m.width ?? 0,
      height: m.height ?? 0,
      ...(m.density ? { declaredDpi: m.density } : {}),
    };
  },

  async decode(source: Uint8Array, opts: DecodeOptions): Promise<DecodedRaster> {
    const buf = Buffer.from(source);
    const m = await sharp(buf, OPEN).metadata();

    /*
     * `withoutEnlargement` matters: a 503x640 scan asked for a 5000px long
     * edge must stay 503x640. Upscaling would invent sub-pixel detail the
     * ridge detector would then happily find cut lines in.
     */
    const pipeline = sharp(buf, OPEN).resize({
      width: opts.maxLongEdge,
      height: opts.maxLongEdge,
      fit: "inside",
      withoutEnlargement: true,
    });

    /*
     * 🛑 The dpi must be SCALED by the actual resize ratio, not passed through.
     * Every mm-denominated parameter downstream (minPartAreaMm2, bridgeMm,
     * smoothMm, simplifyMm, clusterGapMm) converts through px-per-mm, so a
     * 1200 dpi source decoded to a third of its width has 400 effective dpi —
     * handing the core 1200 would make every one of those five mean a third of
     * what it says, silently.
     */
    const declared = m.density;
    let dpi: number | undefined;
    if (declared && declared >= MIN_TRUSTWORTHY_DPI && m.width) {
      const probe = await pipeline.clone().metadata();
      const scale = (probe.width ?? m.width) / m.width;
      dpi = declared * scale;
    }

    return toRaster(pipeline, dpi);
  },

  async decodeTile(source: Uint8Array, tile: Rect): Promise<DecodedRaster> {
    /*
     * No resize — a tile is already bounded by the caller, and the `max` tier
     * tiles precisely so it can read native pixels. Resizing here would defeat
     * the only reason that tier exists.
     *
     * dpi is deliberately NOT derived: a tile's resolution is the source's, and
     * the caller already knows it. Re-deriving per tile is a second place for
     * the number to be wrong.
     */
    return toRaster(
      sharp(Buffer.from(source), OPEN).extract({
        left: tile.x,
        top: tile.y,
        width: tile.width,
        height: tile.height,
      }),
      undefined,
    );
  },

  async encodePng(raster: DecodedRaster): Promise<EncodedImage> {
    const out = await sharp(Buffer.from(raster.data), {
      raw: { width: raster.width, height: raster.height, channels: 4 },
      ...OPEN,
    })
      .png({ compressionLevel: 9 })
      .toBuffer();
    return { bytes: new Uint8Array(out), contentType: "image/png" };
  },

  async encodePngRegion(
    source: Uint8Array,
    region: Rect,
    alpha: Uint8Array,
  ): Promise<EncodedImage> {
    /*
     * Reads ONLY this part's bbox out of the full-resolution source, then
     * applies the rasterised alpha. That is what lets a shard render part 37
     * without ever seeing parts 1-36, and why the geometry is carried as
     * vectors rather than as an upscaled mask.
     */
    const cropped = await sharp(Buffer.from(source), OPEN)
      .extract({
        left: region.x,
        top: region.y,
        width: region.width,
        height: region.height,
      })
      .removeAlpha()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const px = cropped.data;
    const expected = region.width * region.height;
    if (alpha.length !== expected) {
      // Loud, because a silent mismatch produces a part with a plausible
      // outline and the wrong transparency — invisible until it is cut.
      throw new Error(
        `alpha mask is ${alpha.length} px, expected ${expected} for ${region.width}x${region.height}`,
      );
    }
    for (let i = 0; i < expected; i++) px[i * 4 + 3] = alpha[i]!;

    const out = await sharp(px, {
      raw: { width: region.width, height: region.height, channels: 4 },
      ...OPEN,
    })
      .png({ compressionLevel: 9 })
      .toBuffer();
    return { bytes: new Uint8Array(out), contentType: "image/png" };
  },

  async encodePreview(
    source: Uint8Array,
    opts: PreviewOptions,
  ): Promise<EncodedImage> {
    const pipeline = sharp(Buffer.from(source), OPEN).resize({
      width: opts.maxLongEdge,
      height: opts.maxLongEdge,
      fit: "inside",
      withoutEnlargement: true,
    });
    const out =
      opts.format === "webp"
        ? await pipeline.webp({ quality: 82 }).toBuffer()
        : await pipeline.png({ compressionLevel: 9 }).toBuffer();
    return {
      bytes: new Uint8Array(out),
      contentType: opts.format === "webp" ? "image/webp" : "image/png",
    };
  },

  async encodeAtlas(
    tiles: readonly { readonly raster: DecodedRaster; readonly ordinal: number }[],
    opts: { readonly maxLongEdge: number },
  ): Promise<{ image: EncodedImage; frames: Record<number, Rect> }> {
    if (tiles.length === 0) {
      // A run with zero parts is a real outcome (an empty sheet, or the
      // montage case), so this returns a valid 1x1 atlas rather than throwing.
      // A caller reading `frames` finds nothing, which is the truth.
      const empty = await sharp({
        create: { width: 1, height: 1, channels: 4, background: "#0000" },
      })
        .png()
        .toBuffer();
      return { image: { bytes: new Uint8Array(empty), contentType: "image/png" }, frames: {} };
    }

    /*
     * A square-ish grid of uniform cells, sized to the largest tile.
     *
     * Uniform rather than shrink-wrapped on purpose: the client slices by
     * `frames`, so a tighter pack would save bytes the 30-day immutable cache
     * already makes irrelevant while adding a bin-packing bug surface to the
     * one artifact the review UI cannot render without.
     */
    const cols = Math.ceil(Math.sqrt(tiles.length));
    const rows = Math.ceil(tiles.length / cols);
    const cell = Math.max(
      1,
      Math.min(
        Math.floor(opts.maxLongEdge / cols),
        ...tiles.map((t) => Math.max(t.raster.width, t.raster.height)),
      ),
    );

    const frames: Record<number, Rect> = {};
    const composites: OverlayOptions[] = [];

    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i]!;
      const left = (i % cols) * cell;
      const top = Math.floor(i / cols) * cell;
      const resized = await sharp(Buffer.from(t.raster.data), {
        raw: { width: t.raster.width, height: t.raster.height, channels: 4 },
        ...OPEN,
      })
        .resize({ width: cell, height: cell, fit: "inside", withoutEnlargement: true })
        .png()
        .toBuffer({ resolveWithObject: true });

      composites.push({ input: resized.data, left, top });
      /*
       * The frame records the tile's ACTUAL size, not the cell — `fit: inside`
       * preserves aspect ratio, so a wide sticker does not fill a square cell
       * and a client slicing by `cell` would include its neighbours' padding.
       */
      frames[t.ordinal] = {
        x: left,
        y: top,
        width: resized.info.width,
        height: resized.info.height,
      };
    }

    const out = await sharp({
      create: {
        width: cols * cell,
        height: rows * cell,
        channels: 4,
        background: "#0000",
      },
    })
      .composite(composites)
      .png({ compressionLevel: 9 })
      .toBuffer();

    return { image: { bytes: new Uint8Array(out), contentType: "image/png" }, frames };
  },
};
