import { withProviders } from "@/providers.config";
import { moderationQueueRepository } from "@mohasinac/appkit/features/store-extensions/repository/store-extensions.repositories";
import { moderationReviewUpdateSchema } from "@mohasinac/appkit/features/store-extensions/schemas/moderation-review-form";
import { ApiErrors, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
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
      /*
       * `reviewerId` on the row answers "who reviewed THIS report". This
       * answers "what has this moderator been deciding lately", which is
       * the question asked when a pattern is suspected rather than a
       * single decision queried.
       */
      void recordAdminAction({
        actorUid: user!.uid,
        actorName: user!.name,
        action: AdminAuditActionValues.MODERATION_DECISION,
        targetType: "moderationItem",
        targetId: id,
        reason: body!.reason,
        metadata: { status: body!.status ?? null },
      });
      return successResponse(updated, "Reviewed");
    },
  }),
);
