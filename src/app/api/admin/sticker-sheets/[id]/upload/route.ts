import { withProviders } from "@/providers.config";
/**
 * Finalize a scan upload: verify the bytes, record them on the sheet.
 *
 * POST /api/admin/sticker-sheets/{id}/upload
 *
 * The SIGN half lives on `POST /api/admin/sticker-sheets` — it has to, because
 * the path contains a sheet id that does not exist until the row is created.
 * So unlike `/api/store/products/{id}/codes/upload`, which carries a
 * `step: "sign" | "finalize"` discriminator, this endpoint only finalizes.
 *
 * 🛑 The declared content type is not evidence. `attachStickerSheetScan` reads
 * the first 4 KB and checks magic bytes, and DELETES the object on a mismatch —
 * leaving it would mean an arbitrary file sitting at a path our own code will
 * later mint a signed URL for.
 *
 * 🛑 `widthPx`/`heightPx` come from the CLIENT, and that is not laziness. appkit
 * cannot decode an image — the codec is injected so the core stays bundler-safe
 * (Root Cause #24) — and the browser has already decoded this exact file for
 * live tuning. The alternative is downloading up to 100 MB into a Vercel
 * function to read a header, which is the egress mistake this tree exists to
 * avoid. Nothing security-relevant hangs off them; they drive the canvas and
 * the mm conversion, and a wrong value is visibly wrong on the first render.
 */
import { errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { attachStickerSheetScan } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { z } from "zod";

const bodySchema = z.object({
  assetPath: z.string().min(1).max(500),
  widthPx: z.number().int().positive(),
  heightPx: z.number().int().positive(),
  /*
   * 🛑 No default. An absent dpi is the documented signal that millimetre
   * output is WITHHELD (`bboxMm: null`) — five of the nine reference scans
   * declare 72 or 96, a number their encoder wrote rather than anything about
   * the scanner, so a default here would manufacture confident mm figures from
   * nothing. A fabricated millimetre on a cut file is a physical production
   * error, not a cosmetic one.
   */
  dpi: z.number().int().positive().max(4800).optional(),
  dpiSource: z.enum(["embedded", "manual", "calibrated"]).optional(),
  scanType: z.enum(["auto", "paper", "art"]).optional(),
  /** A dedupe hint only — see `StoredAsset.sha256` for why it is never trusted. */
  sha256: z.string().length(64).optional(),
});

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:products:write",
    schema: bodySchema,
    handler: async ({ params, body }) => {
      const sheetId = (params as { id: string }).id;

      const result = await attachStickerSheetScan({
        sheetId,
        assetPath: body!.assetPath,
        widthPx: body!.widthPx,
        heightPx: body!.heightPx,
        dpi: body!.dpi,
        dpiSource: body!.dpiSource,
        scanType: body!.scanType,
        sha256: body!.sha256,
      });

      if (!result.ok) {
        /*
         * 422 with the structured code, matching `/api/media/finalize`. A
         * magic-byte mismatch is not a malformed request — the request was
         * perfectly well formed and the BYTES were not what they claimed — so
         * `MIME_MISMATCH` is distinguishable from a 400 by the client, which is
         * what lets it say "that file isn't an image" rather than "bad request".
         */
        return errorResponse(result.message, 422, { code: result.code });
      }

      return successResponse(result, "Scan attached");
    },
  }),
);
