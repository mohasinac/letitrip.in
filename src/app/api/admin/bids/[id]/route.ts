import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  bidRepository,
} from "@mohasinac/appkit";


const updateBidSchema = z.object({
  status: z.enum(["cancelled"]),
  reason: z.string().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const bid = await bidRepository.findById(id);
      if (!bid) return errorResponse("Bid not found", 404);
      return successResponse(bid);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateBidSchema)["_output"]>({
    auth: true,
    roles: ["admin"],
    schema: updateBidSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const bid = await bidRepository.findById(id);
      if (!bid) return errorResponse("Bid not found", 404);
      await bidRepository.adminUpdateBid(id, {
        status: body!.status,
        updatedAt: new Date(),
      } as any);
      return successResponse(null, "Bid cancelled");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const bid = await bidRepository.findById(id);
      if (!bid) return errorResponse("Bid not found", 404);
      await bidRepository.delete(id);
      return successResponse(null, "Bid deleted");
    },
  }),
);
