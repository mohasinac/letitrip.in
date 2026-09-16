import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  couponsRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const updateCouponSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  discount: z.object({
    value: z.number().min(0),
    maxDiscount: z.number().optional(),
    minPurchase: z.number().optional(),
  }).optional(),
  usage: z.object({
    totalLimit: z.number().optional(),
    perUserLimit: z.number().optional(),
  }).optional(),
  validity: z.object({
    startDate: z.string().transform((v) => new Date(v)).optional(),
    endDate: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
    isActive: z.boolean().optional(),
  }).optional(),
  restrictions: z.object({
    applicableProducts: z.array(z.string()).optional(),
    applicableCategories: z.array(z.string()).optional(),
    applicableSellers: z.array(z.string()).optional(),
    excludeProducts: z.array(z.string()).optional(),
    excludeCategories: z.array(z.string()).optional(),
    firstTimeUserOnly: z.boolean().optional(),
  }).optional(),
  action: z.enum(["activate", "deactivate"]).optional(),
});

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
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const existing = await couponsRepository.findById(id);
      if (!existing) return errorResponse("Coupon not found", 404);

      const { action, validity, restrictions, ...updateData } = body!;

      // Guard: percentage coupons cannot have discount.value > 100
      if (updateData.discount?.value !== undefined && existing.type === "percentage" && updateData.discount.value > 100) {
        return errorResponse("Percentage discount cannot exceed 100%", 422);
      }

      if (action === "deactivate") {
        await couponsRepository.deactivateCoupon(id);
        return successResponse(null, "Coupon deactivated");
      }
      if (action === "activate") {
        await couponsRepository.reactivateCoupon(id);
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
