import { withProviders } from "@/providers.config";
/**
 * One sheet — the currently-accepted result and its parts.
 *
 * GET /api/admin/sticker-sheets/{id}
 *
 * 🛑 JSON only. The parts list carries bounding boxes and names; the IMAGES are
 * fetched from `./asset`, which returns a signed GCS URL. See that route for
 * why no binary ever traverses Vercel here.
 *
 * 🛑 There is deliberately NO DELETE yet. Deleting a sheet means cascading
 * every object under `private/sticker-sheets/{sheetId}/` as well as the row,
 * and a half-implemented delete that removes the document and orphans the
 * bucket is strictly worse than no delete: the objects become unreachable AND
 * unmeterable, costing storage forever with nothing in any UI to remove them
 * from. `deleteSheetTree` exists for it; the route lands with the delete
 * affordance rather than ahead of it.
 */
import { ApiErrors, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { stickerSheetsRepository } from "@mohasinac/appkit/features/sticker-trace/repository/sticker-sheets.repository";
import { toClientStickerSheet } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:products:write",
    handler: async ({ params }) => {
      const sheetId = (params as { id: string }).id;
      const sheet = await stickerSheetsRepository.findById(sheetId);
      if (!sheet) return ApiErrors.notFound("Sheet not found");

      /*
       * 🛑 Projected, never spread. `sourceScan.assetPath` and every
       * `artifacts.*Path` are raw private Storage paths — the one class of field
       * that must not reach a client, because the asset endpoint's safety rests
       * on it accepting a kind and resolving the path itself. A deny-list
       * projection publishes whatever nobody thought to delete (Root Cause #70).
       */
      return successResponse({ sheet: toClientStickerSheet(sheet) });
    },
  }),
);
