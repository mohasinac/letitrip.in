import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  isAdminUser,
  couponsRepository,
  storeRepository,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

const MSG_COUPON_NOT_FOUND = "Coupon not found.";

const updateCouponSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  discount: z
    .object({
      value: z.number().min(0),
      maxDiscount: z.number().optional(),
      minPurchase: z.number().optional(),
    })
    .optional(),
  usage: z
    .object({
      totalLimit: z.number().optional(),
      perUserLimit: z.number().optional(),
    })
    .optional(),
  validity: z
    .object({
      startDate: z
        .string()
        .transform((v) => new Date(v))
        .optional(),
      endDate: z
        .string()
        .optional()
        .transform((v) => (v ? new Date(v) : undefined)),
      isActive: z.boolean().optional(),
    })
    .optional(),
  restrictions: z
    .object({
      applicableProducts: z.array(z.string()).optional(),
      applicableCategories: z.array(z.string()).optional(),
      firstTimeUserOnly: z.boolean().optional(),
      combineWithSellerCoupons: z.boolean().optional(),
    })
    .optional(),
  action: z.enum(["activate", "deactivate"]).optional(),
});

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const coupon = await couponsRepository.findById(id);
      if (!coupon) return errorResponse(MSG_COUPON_NOT_FOUND, 404);
      if (!isAdminUser(user)) {
        const store = await storeRepository.findByOwnerId(user!.uid);
        if (!store || coupon.storeId !== store.id) {
          return errorResponse(MSG_COUPON_NOT_FOUND, 404);
        }
      }
      return successResponse(coupon);
    },
  }),
);

const __PATCH__g = withProviders(
  createRouteHandler<(typeof updateCouponSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    schema: updateCouponSchema,
    handler: async ({ user, body, params }) => {
      const id = (params as { id: string }).id;
      const existing = await couponsRepository.findById(id);
      if (!existing) return errorResponse(MSG_COUPON_NOT_FOUND, 404);
      if (!isAdminUser(user)) {
        const store = await storeRepository.findByOwnerId(user!.uid);
        if (!store || existing.storeId !== store.id) {
          return errorResponse(MSG_COUPON_NOT_FOUND, 404);
        }
      }
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
        return successResponse(null, "Coupon activated");
      }
      const mergedRestrictions = restrictions
        ? { ...existing.restrictions, ...restrictions }
        : undefined;
      // Merge validity rather than replacing wholesale — a caller sending
      // only `validity: {isActive: false}` must not wipe startDate/endDate.
      const mergedValidity = validity ? { ...existing.validity, ...validity } : undefined;
      // Mirror create's rounding for "fixed"-type coupons (POST /api/store/coupons)
      // so editing discount.value/minPurchase/maxDiscount can't drift in unrounded
      // floats create would never have allowed in the first place.
      const mergedDiscount =
        updateData.discount && existing.type === "fixed"
          ? {
              ...updateData.discount,
              value: Math.round(updateData.discount.value * 100) / 100,
              ...(updateData.discount.minPurchase !== undefined && {
                minPurchase: Math.round(updateData.discount.minPurchase * 100) / 100,
              }),
              ...(updateData.discount.maxDiscount !== undefined && {
                maxDiscount: Math.round(updateData.discount.maxDiscount * 100) / 100,
              }),
            }
          : updateData.discount;
      const updated = await couponsRepository.update(id, {
        ...updateData,
        ...(mergedDiscount ? { discount: mergedDiscount } : {}),
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
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const existing = await couponsRepository.findById(id);
      if (!existing) return errorResponse(MSG_COUPON_NOT_FOUND, 404);
      if (!isAdminUser(user)) {
        const store = await storeRepository.findByOwnerId(user!.uid);
        if (!store || existing.storeId !== store.id) {
          return errorResponse(MSG_COUPON_NOT_FOUND, 404);
        }
      }
      await couponsRepository.delete(id);
      return successResponse(null, "Coupon deleted");
    },
  }),
);

export const GET = withFeatureGuard("COUPONS", __GET__g);
export const PATCH = withFeatureGuard("COUPONS", __PATCH__g);
export const DELETE = withFeatureGuard("COUPONS", __DELETE__g);
