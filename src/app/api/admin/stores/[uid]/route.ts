import { withProviders } from "@/providers.config";
import { STORE_FIELDS } from "@/constants";
import { z } from "zod";
import {
  storeRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

const updateStoreSchema = z.object({
  storeStatus: z.enum(Object.values(STORE_FIELDS.STATUS_VALUES) as [string, ...string[]]).optional(),
  adminNotes: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  suspensionReason: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    permission: "admin:stores:read",
    handler: async ({ params }) => {
      const storeId = (params as { uid: string }).uid;
      const store = await storeRepository.findById(storeId);
      if (!store) return errorResponse("Store not found", 404);
      return successResponse(store);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateStoreSchema)["_output"]>({
    auth: true,
    roles: ["admin", "moderator"],
    permission: "admin:stores:write",
    schema: updateStoreSchema,
    handler: async ({ body, params }) => {
      const storeId = (params as { uid: string }).uid;
      const store = await storeRepository.findById(storeId);
      if (!store) return errorResponse("Store not found", 404);

      const update: Record<string, unknown> = {};
      if (body!.storeStatus !== undefined) update.status = body!.storeStatus;
      if (body!.adminNotes !== undefined) update.adminNotes = body!.adminNotes;
      if (body!.isFeatured !== undefined) update.isFeatured = body!.isFeatured;
      if (body!.isVerified !== undefined) update.isVerified = body!.isVerified;
      if (body!.suspensionReason !== undefined) update.suspensionReason = body!.suspensionReason;
      if (body!.capabilities !== undefined) update.capabilities = body!.capabilities;

      if (Object.keys(update).length > 0) {
        await storeRepository.update(storeId, update as any);
      }

      return successResponse({ storeId, ...body }, "Store updated");
    },
  }),
);
