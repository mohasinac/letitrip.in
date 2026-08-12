import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  reviewRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const MSG_REVIEW_NOT_FOUND = "Review not found.";

const updateReviewSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  featured: z.boolean().optional(),
  adminReply: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:reviews:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const review = await reviewRepository.findById(id);
      if (!review) return errorResponse(MSG_REVIEW_NOT_FOUND, 404);
      return successResponse(review);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateReviewSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:reviews:write",
    schema: updateReviewSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const existing = await reviewRepository.findById(id);
      if (!existing) return errorResponse(MSG_REVIEW_NOT_FOUND, 404);
      const updated = await reviewRepository.update(id, {
        ...body,
        updatedAt: new Date(),
      } as any);
      return successResponse(updated, "Review updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:reviews:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await reviewRepository.findById(id);
      if (!existing) return errorResponse(MSG_REVIEW_NOT_FOUND, 404);
      await reviewRepository.delete(id);
      return successResponse(null, "Review deleted");
    },
  }),
);
