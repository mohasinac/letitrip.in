/**
 * The A4 (or any page) PDF mosaic — promoted parts laid out at TRUE PHYSICAL
 * SCALE for printing.
 *
 * Lives in `functions/` rather than appkit because `pdfkit` is a Node-only
 * dependency and the shared tracer core must stay bundler-safe (Root Cause
 * #24). The LAYOUT is not duplicated here — `nestParts` from the shared export
 * suite decides placement, so the print modal's preview and this file cannot
 * disagree about where a sticker lands.
 *
 * 🛑 TRUE PHYSICAL SCALE IS THE WHOLE POINT, AND PDF USES POINTS. 1 pt = 1/72
 * inch, so mm → pt is `mm * 72 / 25.4`. Getting this wrong produces a document
 * that looks completely correct on screen and prints at the wrong size — the
 * single most expensive failure in this feature, because it is only detectable
 * against a ruler after the paper and vinyl are spent.
 *
 * 🛑 PRINT AT 100%. A PDF carries its page size, but "Fit to page" silently
 * rescales it — which is exactly the error this file exists to avoid. The
 * footer says so on every sheet, because the person printing is often not the
 * person who exported.
 */

import PDFDocument from "pdfkit";
import type { CallableHandler } from "@mohasinac/appkit/jobs";
import {
  collectMosaicInputs,
  type PrintPageSizeId,
} from "@mohasinac/appkit/features/sticker-trace/server";

/** 1 point = 1/72 inch. */
const PT_PER_INCH = 72;
const MM_PER_INCH = 25.4;

/** The one conversion in this file. Everything else is in millimetres. */
function mmToPt(mm: number): number {
  return (mm * PT_PER_INCH) / MM_PER_INCH;
}

export interface MosaicPlacedPart {
  ordinal: number;
  name: string;
  page: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  rotated: boolean;
  /** The promoted full-resolution PNG. */
  png: Buffer;
}

export interface MosaicOptions {
  pageWidthMm: number;
  pageHeightMm: number;
  pageCount: number;
  title: string;
  /** Draw a 1mm minor / 10mm major grid under the artwork. */
  showGrid?: boolean;
  /** Outline each part's bounding box, so a cut line is visible on the proof. */
  showCutLines?: boolean;
}

/** Grid lines are hairlines; anything thicker reads as artwork. */
const GRID_MINOR_PT = 0.12;
const GRID_MAJOR_PT = 0.3;

/**
 * Draw the measuring grid.
 *
 * 🛑 Drawn FIRST, under everything. A grid over the artwork is a grid that
 * gets printed onto the stickers — this is a measuring aid for the proof, not
 * a design element, and it must not survive onto the cut article. The caller
 * can switch it off entirely for the final print.
 */
function drawGrid(
  doc: PDFKit.PDFDocument,
  widthMm: number,
  heightMm: number,
): void {
  doc.save();
  for (let x = 0; x <= widthMm; x += 1) {
    const major = x % 10 === 0;
    doc
      .moveTo(mmToPt(x), 0)
      .lineTo(mmToPt(x), mmToPt(heightMm))
      .lineWidth(major ? GRID_MAJOR_PT : GRID_MINOR_PT)
      .strokeOpacity(major ? 0.25 : 0.12)
      .stroke();
  }
  for (let y = 0; y <= heightMm; y += 1) {
    const major = y % 10 === 0;
    doc
      .moveTo(0, mmToPt(y))
      .lineTo(mmToPt(widthMm), mmToPt(y))
      .lineWidth(major ? GRID_MAJOR_PT : GRID_MINOR_PT)
      .strokeOpacity(major ? 0.25 : 0.12)
      .stroke();
  }
  doc.restore();
}

/**
 * Build the mosaic.
 *
 * Returns a Buffer rather than streaming: the caller writes it to Storage as a
 * single artifact, and a sheet's mosaic is a few MB at most — well inside a
 * Function's memory, and simpler than plumbing a stream through the artifact
 * writer.
 */
export function buildMosaicPdf(
  parts: readonly MosaicPlacedPart[],
  opts: MosaicOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [mmToPt(opts.pageWidthMm), mmToPt(opts.pageHeightMm)],
      /*
       * 🛑 Zero margin. The nester has ALREADY applied the page's own margin
       * when it placed each part, so a pdfkit margin would apply it a second
       * time and shift every sticker inward by exactly that amount — a
       * uniformly wrong layout, which is the kind that looks deliberate.
       */
      margin: 0,
      info: { Title: opts.title },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    for (let page = 0; page < Math.max(1, opts.pageCount); page++) {
      if (page > 0) doc.addPage();

      if (opts.showGrid) drawGrid(doc, opts.pageWidthMm, opts.pageHeightMm);

      for (const part of parts.filter((p) => p.page === page)) {
        /*
         * A rotated part is placed by its top-left corner, so the rotation has
         * to carry it back into that box: rotate about the origin, then shift
         * right by its own height. Same arithmetic as the SVG writer, and it
         * has to match — a part rotated one way here and the other way there
         * would cut along an outline that is not where the ink is.
         */
        doc.save();
        if (part.rotated) {
          doc.translate(mmToPt(part.xMm + part.heightMm), mmToPt(part.yMm));
          doc.rotate(90, { origin: [0, 0] });
        } else {
          doc.translate(mmToPt(part.xMm), mmToPt(part.yMm));
        }

        doc.image(part.png, 0, 0, {
          width: mmToPt(part.widthMm),
          height: mmToPt(part.heightMm),
        });

        if (opts.showCutLines) {
          doc
            .rect(0, 0, mmToPt(part.widthMm), mmToPt(part.heightMm))
            .lineWidth(0.25)
            .strokeOpacity(0.5)
            .stroke();
        }
        doc.restore();
      }

      /*
       * The scale warning, on every page. "Fit to page" is the default in
       * several print dialogs and it silently destroys the one property this
       * document exists to carry.
       */
      doc
        .fontSize(6)
        .fillOpacity(0.55)
        .text(
          `${opts.title} — page ${page + 1} of ${Math.max(1, opts.pageCount)} · PRINT AT 100% (no "fit to page") or the stickers will be the wrong size`,
          mmToPt(4),
          mmToPt(opts.pageHeightMm - 5),
          { width: mmToPt(opts.pageWidthMm - 8), lineBreak: false },
        )
        .fillOpacity(1);
    }

    doc.end();
  });
}

export interface MosaicPdfInput {
  sheetId: string;
  pageSizeId?: PrintPageSizeId;
  showGrid?: boolean;
  showCutLines?: boolean;
}

export interface MosaicPdfOutput {
  /** Empty string when `refusedReason` is set — never a valid-but-blank PDF. */
  pdfBase64: string;
  pageCount: number;
  /** Parts left off the sheet, named. Empty when everything was placed. */
  unplaceable: Array<{ ordinal: number; name: string }>;
  /** Why no mosaic could be produced, verbatim for the UI. */
  refusedReason: string | null;
}

/**
 * HTTPS entry, base64 like the invoice generator.
 *
 * The shared `bindHttps` adapter always responds with `res.json(output)`, so a
 * raw binary stream would need a shared-adapter change affecting every other
 * HTTPS function. The calling route decodes and streams it as application/pdf.
 */
export const stickerMosaicPdfHandler: CallableHandler<
  MosaicPdfInput,
  MosaicPdfOutput
> = async (input) => {
  const inputs = await collectMosaicInputs(input.sheetId, {
    pageSizeId: input.pageSizeId ?? "a4",
  });

  /*
   * 🛑 A refusal returns an EMPTY string and the reason, never a valid-but-blank
   * PDF. A downloadable empty page looks like a tracer bug and hides the real
   * cause — usually an unconfirmed DPI or a run that was never promoted, both
   * of which the operator can actually fix once told.
   */
  if (inputs.refusedReason) {
    return {
      pdfBase64: "",
      pageCount: 0,
      unplaceable: inputs.unplaceable,
      refusedReason: inputs.refusedReason,
    };
  }

  const pdf = await buildMosaicPdf(
    inputs.parts.map((p) => ({ ...p, png: Buffer.from(p.png) })),
    {
      pageWidthMm: inputs.pageWidthMm,
      pageHeightMm: inputs.pageHeightMm,
      pageCount: inputs.pageCount,
      title: inputs.title,
      showGrid: input.showGrid ?? false,
      showCutLines: input.showCutLines ?? true,
    },
  );

  return {
    pdfBase64: pdf.toString("base64"),
    pageCount: inputs.pageCount,
    unplaceable: inputs.unplaceable,
    refusedReason: null,
  };
};
