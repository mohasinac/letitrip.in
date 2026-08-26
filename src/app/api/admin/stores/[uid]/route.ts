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
  recordAdminAction,
  AdminAuditActionValues,
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
    handler: async ({ body, params, user }) => {
      const storeId = (params as { uid: string }).uid;
      const store = await storeRepository.findById(storeId);
      if (!store) return errorResponse("Store not found", 404);

      const update: Record<string, JsonValue> = {};
      const { adminNotes, isFeatured, isVerified, suspensionReason, capabilities } = body!;
      if (adminNotes !== undefined) update[STORE_FIELDS.ADMIN_NOTES] = adminNotes;
      if (isFeatured !== undefined) update[STORE_FIELDS.IS_FEATURED] = isFeatured;
      if (isVerified !== undefined) update[STORE_FIELDS.IS_VERIFIED] = isVerified;
      if (suspensionReason !== undefined) update[STORE_FIELDS.SUSPENSION_REASON] = suspensionReason;
      if (capabilities !== undefined) update[STORE_FIELDS.CAPABILITIES] = capabilities;

      /*
       * 🛑 A status change goes through `setStatus`, never a bare `update`.
       *
       * `status` and `isPublic` are two distinct fields, and every public
       * visibility check gates on `isPublic`. This handler wrote `status`
       * directly and never touched `isPublic`, so approving a pending store
       * left it active AND invisible, with no error anywhere. `setStatus`
       * syncs them; `store` is threaded in as `prior` so the timeline entry
       * costs no second read.
       */
      const ctx = {
        actor: { role: "admin" as const, uid: user!.uid },
        trigger: "adminStorePatch",
        reason: suspensionReason,
      };
      if (body!.storeStatus !== undefined) {
        await storeRepository.setStatus(
          storeId,
          body!.storeStatus as never,
          update as never,
          ctx,
          store,
        );
      } else if (Object.keys(update).length > 0) {
        await storeRepository.adminUpdate(storeId, update as never, ctx, store);
      }

      if (body!.storeStatus !== undefined || isVerified !== undefined) {
        void recordAdminAction({
          actorUid: user!.uid,
          action: AdminAuditActionValues.STORE_STATUS_CHANGE,
          targetType: "store",
          targetId: storeId,
          targetLabel: store.storeName ?? storeId,
          reason: suspensionReason,
          metadata: { storeStatus: body!.storeStatus ?? null, isVerified: isVerified ?? null },
        });
      }

      // The stored document, not an echo of the request — echoing is what hid
      // the dropped payout UTR for as long as it was hidden.
      const updated = await storeRepository.findById(storeId);
      return successResponse(updated, "Store updated");
    },
  }),
);
