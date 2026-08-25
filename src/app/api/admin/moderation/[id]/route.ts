import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  createRouteHandler,
  moderationQueueRepository,
  moderationReviewUpdateSchema,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const doc = await moderationQueueRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      return successResponse(doc);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof moderationReviewUpdateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: moderationReviewUpdateSchema,
    handler: async ({ params, user, body }) => {
      const id = (params as { id: string }).id;
      const doc = await moderationQueueRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");

      // `reviewerId` and `reviewedAt` are set here, never accepted from the
      // body — otherwise a caller could attribute the review to somebody else
      // or backdate it. The schema does not declare either field, so a body
      // carrying them is a 400 rather than a silent overwrite.
      const updated = await moderationQueueRepository.update(id, {
        status: body!.status,
        reason: body!.reason,
        reviewerId: user!.uid,
        reviewedAt: new Date(),
      });
      return successResponse(updated, "Reviewed");
    },
  }),
);
