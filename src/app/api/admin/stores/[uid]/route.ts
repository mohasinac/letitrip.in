import { withProviders } from "@/providers.config";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
import {
  ROLES_ADMIN_MOD,
  STORE_FIELDS,
} from "@/constants";
import { z } from "zod";
import { ALL_STORE_CAPABILITIES } from "@mohasinac/appkit/features/auth/permissions/constants";
import { AdminAuditActionValues } from "@mohasinac/appkit/features/audit-log/schemas/firestore";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { recordAdminAction } from "@mohasinac/appkit";

const updateStoreSchema = z.object({
  storeStatus: z.enum(Object.values(STORE_FIELDS.STATUS_VALUES) as [string, ...string[]]).optional(),
  [STORE_FIELDS.ADMIN_NOTES]: z.string().optional(),
  [STORE_FIELDS.IS_FEATURED]: z.boolean().optional(),
  [STORE_FIELDS.IS_VERIFIED]: z.boolean().optional(),
  [STORE_FIELDS.SUSPENSION_REASON]: z.string().optional(),
  /*
   * Pay this store at SHIPPING instead of at delivery. A risk transfer, not a
   * badge — see the field's own header and `STORE_TRUST_CHANGE`.
   */
  [STORE_FIELDS.TRUSTED_SELLER]: z.boolean().optional(),
  /*
   * 🛑 z.enum, not z.array(z.string()). This is the schema that guards the
   * actual write, and it accepted ANY string — so an admin could save a
   * misspelled capability, see a success toast, and the gate that capability
   * was meant to open would never open. There is no error for an unrecognised
   * capability; it is indistinguishable from one that was never granted.
   *
   * Derived from ALL_STORE_CAPABILITIES, which is backed by a
   * Record<StoreCapability, true>, so a new capability cannot be added to the
   * union without becoming valid here too.
   */
  [STORE_FIELDS.CAPABILITIES]: z
    .array(z.enum(ALL_STORE_CAPABILITIES as [string, ...string[]]))
    .optional(),
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
      const { adminNotes, isFeatured, isVerified, suspensionReason, capabilities, trustedSeller } =
        body!;
      if (adminNotes !== undefined) update[STORE_FIELDS.ADMIN_NOTES] = adminNotes;
      if (isFeatured !== undefined) update[STORE_FIELDS.IS_FEATURED] = isFeatured;
      if (isVerified !== undefined) update[STORE_FIELDS.IS_VERIFIED] = isVerified;
      if (suspensionReason !== undefined) update[STORE_FIELDS.SUSPENSION_REASON] = suspensionReason;
      if (capabilities !== undefined) update[STORE_FIELDS.CAPABILITIES] = capabilities;
      /*
       * 🛑 `trustedSeller` means we pay this store BEFORE the parcel is
       * delivered, so the platform carries a lost parcel and a non-delivery
       * dispute with the money already gone. It is a risk decision, logged
       * below in its own audit row rather than folded into the status one —
       * "what changed about this store" and "who accepted this risk" are
       * different questions and only the second has a date somebody will be
       * asked about.
       */
      if (trustedSeller !== undefined) update[STORE_FIELDS.TRUSTED_SELLER] = trustedSeller;

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

      if (trustedSeller !== undefined && trustedSeller !== (store.trustedSeller ?? false)) {
        /*
         * Logged on a REAL change only. Re-saving an unrelated field on an
         * already-trusted store would otherwise write an audit row describing
         * a decision nobody made — and a log of non-events is how a log stops
         * being read. Same rule as `dispute_reason_create`, which records a
         * creation and not a no-op re-add.
         */
        void recordAdminAction({
          actorUid: user!.uid,
          action: AdminAuditActionValues.STORE_TRUST_CHANGE,
          targetType: "store",
          targetId: storeId,
          targetLabel: store.storeName ?? storeId,
          reason: suspensionReason,
          metadata: { trustedSeller, previous: store.trustedSeller ?? false },
        });
      }

      // The stored document, not an echo of the request — echoing is what hid
      // the dropped payout UTR for as long as it was hidden.
      const updated = await storeRepository.findById(storeId);
      return successResponse(updated, "Store updated");
    },
  }),
);
