import { withProviders } from "@/providers.config";
import { reportsRepository } from "@mohasinac/appkit/features/store-extensions/repository/store-extensions.repositories";
import { REPORT_TERMINAL_STATUSES, reportReviewUpdateSchema } from "@mohasinac/appkit/features/store-extensions/schemas/report-review-form";
import { ApiErrors, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const doc = await reportsRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      return successResponse(doc);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof reportReviewUpdateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: reportReviewUpdateSchema,
    handler: async ({ params, user, body }) => {
      const id = (params as { id: string }).id;
      const doc = await reportsRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");

      // `resolvedAt` is stamped HERE, from the server clock — the clients used
      // to send `new Date()`, which `JSON.stringify` turns into a string, and
      // the old raw spread wrote that string into a `Date` field. The schema
      // no longer accepts the key at all, so that shape split cannot recur.
      const closing = (REPORT_TERMINAL_STATUSES as readonly string[]).includes(body!.status);

      const updated = await reportsRepository.update(id, {
        status: body!.status,
        resolution: body!.resolution,
        assignedTo: user!.uid,
        ...(closing ? { resolvedAt: new Date() } : {}),
      });
      return successResponse(updated, "Updated");
    },
  }),
);
