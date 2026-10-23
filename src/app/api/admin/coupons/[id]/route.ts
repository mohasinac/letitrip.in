import { withProviders } from "@/providers.config";
/*
 * 🛑 No `import { z } from "zod"` here any more, and that absence is the
 * point: this route must not construct consumer-zod schemas around appkit
 * ones. See the note on `updateCouponSchema` below.
 */
import { couponsRepository } from "@mohasinac/appkit/features/promotions/repository/coupons.repository";
import { recordAdminAction } from "@mohasinac/appkit";
import { AdminAuditActionValues } from "@mohasinac/appkit/features/audit-log/schemas/firestore";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { couponUpdateBodySchema } from "@mohasinac/appkit/features/promotions/schemas/index";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

/*
 * 🛑 DEFINED IN APPKIT, NOT HERE, AND THE REASON IS A RUNTIME ONE.
 *
 * This body embeds `bxgyConfigSchema`, which is a ZOD 3 schema (appkit pins
 * ^3.24 while the consumer root is on zod 4). Composing a zod-3 schema into
 * a consumer `z.object({...})` does not merely infer `unknown` — zod 4
 * THROWS "Invalid element at key ...: expected a Zod schema", so every PATCH
 * to this route would have failed outright. The sibling POST route hit
 * exactly this and was moved for the same reason.
 *
 * `tiers` and `bxgy` both live in the shared schema now, so the two routes
 * cannot drift on either field again.
 */
const updateCouponSchema = couponUpdateBodySchema;

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      /*
       * 🛑 `findById` FIRST. This route received a DOC ID and called
       * `getCouponByCode`, which upper-cases its argument and matches on the
       * `code` field — so `/api/admin/coupons/coupon-arena25` looked for a
       * coupon whose code is "COUPON-ARENA25", found nothing, and 404'd.
       *
       * The editor seeds itself from this response and returns early when it
       * is absent, so the form stayed at its defaults and its validator
       * reported three "required" issues on a record the admin had not
       * touched — including "A discount value is required" on a coupon that
       * has one. The sibling PATCH twenty lines below has always used
       * `findById`, which is why saving worked while opening did not.
       *
       * The by-code lookup is kept as a FALLBACK rather than deleted: the
       * route's own param is named `id`, but a human-typed code is the obvious
       * thing to paste into this URL, and answering both costs one read only
       * when the first misses.
       */
      const coupon =
        (await couponsRepository.findById(id)) ??
        (await couponsRepository.getCouponByCode(id));
      if (!coupon) return errorResponse("Coupon not found", 404);
      return successResponse(coupon);
    },
  }),
);

const __PATCH__g = withProviders(
  createRouteHandler<(typeof updateCouponSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: updateCouponSchema,
    handler: async ({ body, params, user }) => {
      const id = (params as { id: string }).id;
      const existing = await couponsRepository.findById(id);
      if (!existing) return errorResponse("Coupon not found", 404);

      const { action, validity, restrictions, ...updateData } = body!;

      // Guard: percentage coupons cannot have discount.value > 100
      if (updateData.discount?.value !== undefined && existing.type === "percentage" && updateData.discount.value > 100) {
        return errorResponse("Percentage discount cannot exceed 100%", 422);
      }

      /*
       * 🛑 Every branch logs, including the two that only flip a flag.
       *
       * `COUPON_UPDATE` has existed with a writer since the audit log was
       * built — in `adminUpdateCoupon`, which THIS ROUTE DOES NOT CALL. It
       * goes straight to the repository, so every admin coupon edit has been
       * unlogged while the action value sat there looking instrumented.
       * Found by `audit-privileged-write-unlogged`, not by reading.
       *
       * Logged here rather than by switching to `adminUpdateCoupon`: this
       * handler carries the nested-merge discipline Root Cause #40 installed
       * after a caller sending `validity: {isActive:false}` would have wiped
       * the coupon's real dates, and moving the write is a bigger change than
       * the gap warrants.
       */
      const logCoupon = (what: string) =>
        void recordAdminAction({
          actorUid: user!.uid,
          actorName: user!.name,
          action: AdminAuditActionValues.COUPON_UPDATE,
          targetType: "coupon",
          targetId: id,
          targetLabel: existing.code ?? id,
          metadata: { change: what },
        });

      if (action === "deactivate") {
        await couponsRepository.deactivateCoupon(id);
        logCoupon("deactivated");
        return successResponse(null, "Coupon deactivated");
      }
      if (action === "activate") {
        await couponsRepository.reactivateCoupon(id);
        logCoupon("reactivated");
        return successResponse(null, "Coupon reactivated");
      }

      // Merge nested objects rather than replacing them wholesale — a caller
      // sending only `validity: {isActive: false}` must not wipe the coupon's
      // real startDate/endDate, same reasoning as the restrictions merge.
      const mergedValidity = validity ? { ...existing.validity, ...validity } : undefined;
      const mergedRestrictions = restrictions ? { ...existing.restrictions, ...restrictions } : undefined;
      const updated = await couponsRepository.update(id, {
        ...updateData,
        ...(mergedValidity ? { validity: mergedValidity } : {}),
        ...(mergedRestrictions ? { restrictions: mergedRestrictions } : {}),
        updatedAt: new Date(),
      } as any);
      logCoupon("edited");
      return successResponse(updated, "Coupon updated");
    },
  }),
);

const __DELETE__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:coupons:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      await couponsRepository.deactivateCoupon(id);
      return successResponse(null, "Coupon deleted");
    },
  }),
);

export const GET = __GET__g;
export const PATCH = __PATCH__g;
export const DELETE = __DELETE__g;
