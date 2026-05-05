import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  reviewRepository,
} from "@mohasinac/appkit";

const updateReviewSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  featured: z.boolean().optional(),
  adminReply: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const review = await reviewRepository.findById(id);
      if (!review) return errorResponse("Review not found", 404);
      return successResponse(review);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateReviewSchema)["_output"]>({
    auth: true,
    roles: ["admin", "moderator"],
    schema: updateReviewSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const existing = await reviewRepository.findById(id);
      if (!existing) return errorResponse("Review not found", 404);
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
    roles: ["admin"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await reviewRepository.findById(id);
      if (!existing) return errorResponse("Review not found", 404);
      await reviewRepository.delete(id);
      return successResponse(null, "Review deleted");
    },
  }),
);
