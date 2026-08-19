import { withProviders } from "@/providers.config";
import type { JsonValue } from "@mohasinac/appkit";
import {
  ROLES_ADMIN_MOD,
  STORE_FIELDS,
} from "@/constants";
import { z } from "zod";
import {
  storeRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

const updateStoreSchema = z.object({
  storeStatus: z.enum(Object.values(STORE_FIELDS.STATUS_VALUES) as [string, ...string[]]).optional(),
  [STORE_FIELDS.ADMIN_NOTES]: z.string().optional(),
  [STORE_FIELDS.IS_FEATURED]: z.boolean().optional(),
  [STORE_FIELDS.IS_VERIFIED]: z.boolean().optional(),
  [STORE_FIELDS.SUSPENSION_REASON]: z.string().optional(),
  [STORE_FIELDS.CAPABILITIES]: z.array(z.string()).optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
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
    roles: [...ROLES_ADMIN_MOD],
    schema: updateStoreSchema,
    handler: async ({ body, params }) => {
      const storeId = (params as { uid: string }).uid;
      const store = await storeRepository.findById(storeId);
      if (!store) return errorResponse("Store not found", 404);

      const update: Record<string, JsonValue> = {};
      const { adminNotes, isFeatured, isVerified, suspensionReason, capabilities } = body!;
      if (body!.storeStatus !== undefined) update[STORE_FIELDS.STATUS] = body!.storeStatus;
      if (adminNotes !== undefined) update[STORE_FIELDS.ADMIN_NOTES] = adminNotes;
      if (isFeatured !== undefined) update[STORE_FIELDS.IS_FEATURED] = isFeatured;
      if (isVerified !== undefined) update[STORE_FIELDS.IS_VERIFIED] = isVerified;
      if (suspensionReason !== undefined) update[STORE_FIELDS.SUSPENSION_REASON] = suspensionReason;
      if (capabilities !== undefined) update[STORE_FIELDS.CAPABILITIES] = capabilities;

      if (Object.keys(update).length > 0) {
        await storeRepository.update(storeId, update as any);
      }

      return successResponse({ storeId, ...body }, "Store updated");
    },
  }),
);
