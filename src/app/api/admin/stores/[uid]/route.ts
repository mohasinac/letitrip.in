import { withProviders } from "@/providers.config";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
import { ROLES_ADMIN_MOD } from "@/constants/api-roles";
/*
 * 🛑 The SCHEMA's `STORE_FIELDS`, not the one `@/constants` re-exports.
 *
 * There are TWO constants of that name — `constants/field-names.ts` and
 * `features/stores/schemas/firestore.ts` — and only the schema one declares
 * `TRUSTED_SELLER`. Reaching the wrong one is Root Cause #36's shape, and
 * going through the `@/constants` barrel is separately the 401 dual-registry
 * trap (it re-exports navigation.tsx → the "use client" entry).
 */
import { STORE_FIELDS } from "@mohasinac/appkit/features/stores/schemas/firestore";
import { z } from "zod";
import { ALL_STORE_CAPABILITIES } from "@mohasinac/appkit/features/auth/permissions/constants";
import { AdminAuditActionValues } from "@mohasinac/appkit/features/audit-log/schemas/firestore";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
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
   * The admin override for the EARNED tier.
   *
   * 🛑 Setting this by hand also PINS it: the monthly rollup skips any store
   * whose `standing.tierLockedByAdmin` is true. Without the pin the override
   * would silently expire at the next month-end, which is worse than having
   * no override — an admin would grant a tier, watch it work, and find it
   * reverted weeks later with nothing saying why.
   *
   * It carries `trustedSeller` with it, because that is what the tier MEANS
   * here (the owner's decision: reaching the tier grants early payout). An
   * admin who wants one without the other sets `trustedSeller` directly,
   * which is still accepted above.
   */
  [STORE_FIELDS.SELLER_TIER]: z.enum(["seller", "trusted"]).optional(),
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
      const {
        adminNotes,
        isFeatured,
        isVerified,
        suspensionReason,
        capabilities,
        trustedSeller,
        sellerTier,
      } = body!;
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
      if (sellerTier !== undefined) {
        update[STORE_FIELDS.SELLER_TIER] = sellerTier;
        /*
         * Carries early payout with it, and PINS the decision so the monthly
         * rollup leaves it alone. A top-level field, not a key inside
         * `standing`: that object is rebuilt wholesale every month, so a pin
         * stored in it would be erased by the next recompute — which is the
         * one thing a pin must survive.
         */
        update[STORE_FIELDS.TIER_LOCKED_BY_ADMIN] = true;
        if (trustedSeller === undefined) {
          update[STORE_FIELDS.TRUSTED_SELLER] = sellerTier === "trusted";
        }
      }

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

      /*
       * 🛑 Keep the USER-level `storeStatus` mirror in step with the store.
       *
       * `UserDocument.storeStatus` ("pending" | "approved" | "rejected") is a
       * denormalised mirror of the owner's application outcome, and its only
       * other writer — `adminUpdateStoreStatus` — has no UI caller, so before
       * 2026-10-24 it could never leave "pending" for a real applicant while
       * the store beside it went active. Two fields describing one decision,
       * disagreeing, with the one a human reads being the wrong one (Root
       * Cause #42). Writing both here means the approve action keeps them
       * consistent by construction rather than by discipline.
       *
       * `suspended` deliberately maps to nothing: the OWNER was approved, and
       * only their store is suspended. Overwriting the mirror would rewrite
       * the application history to say they were never accepted.
       */
      const MIRROR_BY_STORE_STATUS: Record<string, "pending" | "approved" | "rejected"> = {
        active: "approved",
        rejected: "rejected",
        pending: "pending",
      };
      const mirror =
        body!.storeStatus !== undefined
          ? MIRROR_BY_STORE_STATUS[body!.storeStatus as string]
          : undefined;
      if (mirror && store.ownerId) {
        /*
         * Best-effort: a failed mirror write must not fail an approval that
         * has already published the store. It is reported rather than
         * swallowed, so a drift has a trace (Root Cause #59).
         */
        try {
          await userRepository.updateStoreApproval(store.ownerId, mirror);
        } catch (err) {
          const e = normalizeError(err);
          serverLogger.warn("admin store PATCH: storeStatus mirror write failed", {
            storeId,
            ownerId: store.ownerId,
            mirror,
            error: e.message,
          });
        }
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

      /*
       * Fires for EITHER half of the trust decision changing. `sellerTier` is
       * included because it now carries `trustedSeller` with it — an admin
       * promoting a store to "trusted" moves money, and an audit row keyed
       * only on the explicit `trustedSeller` field would miss exactly that
       * case while looking correct.
       */
      const effectiveTrusted =
        update[STORE_FIELDS.TRUSTED_SELLER] as boolean | undefined;
      const trustChanged =
        effectiveTrusted !== undefined &&
        effectiveTrusted !== (store.trustedSeller ?? false);
      const tierChanged =
        sellerTier !== undefined && sellerTier !== (store.sellerTier ?? "seller");
      if (trustChanged || tierChanged) {
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
          metadata: {
            trustedSeller: effectiveTrusted ?? (store.trustedSeller ?? false),
            previous: store.trustedSeller ?? false,
            sellerTier: sellerTier ?? (store.sellerTier ?? "seller"),
            previousTier: store.sellerTier ?? "seller",
            lockedByAdmin: sellerTier !== undefined,
          },
        });
      }

      // The stored document, not an echo of the request — echoing is what hid
      // the dropped payout UTR for as long as it was hidden.
      const updated = await storeRepository.findById(storeId);
      return successResponse(updated, "Store updated");
    },
  }),
);
