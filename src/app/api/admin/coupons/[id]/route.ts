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
    combineWithSellerCoupons: z.boolean().optional(),
  }).optional(),
  action: z.enum(["activate", "deactivate"]).optional(),
});

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:coupons:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const coupon = await couponsRepository.getCouponByCode(id).catch(() => null);
      if (!coupon) return errorResponse("Coupon not found", 404);
      return successResponse(coupon);
    },
  }),
);

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const PATCH = withProviders(
  createRouteHandler<(typeof updateCouponSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:coupons:write",
    schema: updateCouponSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const { action, validity, ...updateData } = body!;

      // Guard: percentage coupons cannot have discount.value > 100
      if (updateData.discount?.value !== undefined) {
        const existing = await couponsRepository.findById(id);
        if (existing?.type === "percentage" && updateData.discount.value > 100) {
          return errorResponse("Percentage discount cannot exceed 100%", 422);
        }
      }

      if (action === "deactivate") {
        await couponsRepository.deactivateCoupon(id);
        return successResponse(null, "Coupon deactivated");
      }
      if (action === "activate") {
        await couponsRepository.reactivateCoupon(id);
        return successResponse(null, "Coupon reactivated");
      }
      if (validity?.isActive === false) {
        await couponsRepository.deactivateCoupon(id);
      } else if (validity?.isActive === true) {
        await couponsRepository.reactivateCoupon(id);
      }
      return successResponse({ id, ...updateData }, "Coupon updated");
    },
  }),
);

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const DELETE = withProviders(
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
