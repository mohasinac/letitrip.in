import { withProviders } from "@/providers.config";
import { z } from "zod";
import { createRouteHandler, successResponse, ApiErrors } from "@mohasinac/appkit";
import { couponsRepository, storeRepository } from "@mohasinac/appkit";
import { sortBy, COUPON_FIELDS } from "@mohasinac/appkit";
import { ROLES_STORE_READ, ROLES_STORE_WRITE } from "@/constants";

const DEFAULT_SORTS = sortBy(COUPON_FIELDS.CREATED_AT);

const createCouponSchema = z.object({
  code: z.string().min(2).max(30).transform((v) => v.toUpperCase().replace(/\s+/g, "")),
  type: z.enum(["percentage", "fixed", "free_shipping"]),
  value: z.number().min(0).default(0),
  minPurchase: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  totalLimit: z.number().min(0).default(0),
  perUserLimit: z.number().min(0).default(0),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  isActive: z.boolean().default(true),
});

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_STORE_READ],
  handler: async ({ request, user }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get("pageSize")) || 100));
    const sorts = url.searchParams.get("sorts") ?? url.searchParams.get("sort") ?? DEFAULT_SORTS;
    const filters = url.searchParams.get("filters") ?? undefined;

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const storeFilter = `storeId==${store.id}`;
    const combined = filters ? `${storeFilter},${filters}` : storeFilter;

    const result = await couponsRepository.list({ filters: combined, sorts, page, pageSize });
    return successResponse({ coupons: result.items, total: result.total });
  },
}));

export const POST = withProviders(createRouteHandler<(typeof createCouponSchema)["_output"]>({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
  schema: createCouponSchema,
  handler: async ({ body, user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const { code, type, value, minPurchase, maxDiscount, totalLimit, perUserLimit, startDate, endDate, isActive } = body!;

    if (type === "percentage" && value > 100) {
      return ApiErrors.badRequest("Percentage discount cannot exceed 100%");
    }

    const discountValue = type === "fixed" ? Math.round(value * 100) : value;
    const minPurchasePaise = minPurchase ? Math.round(minPurchase * 100) : undefined;
    const maxDiscountPaise = maxDiscount ? Math.round(maxDiscount * 100) : undefined;

    const existing = await couponsRepository.getCouponByCode(code);
    if (existing) return ApiErrors.badRequest("A coupon with this code already exists");

    const coupon = await couponsRepository.create({
      code,
      name: code,
      description: "",
      type,
      scope: "seller",
      storeId: store.id,
      createdBy: user!.uid,
      discount: { value: discountValue, ...(minPurchasePaise !== undefined && { minPurchase: minPurchasePaise }), ...(maxDiscountPaise !== undefined && { maxDiscount: maxDiscountPaise }) },
      usage: { totalLimit, perUserLimit, currentUsage: 0 },
      validity: { startDate: new Date(startDate), endDate: new Date(endDate), isActive },
      restrictions: { firstTimeUserOnly: false, combineWithSellerCoupons: false },
    } as Parameters<typeof couponsRepository.create>[0]);

    return successResponse(coupon, "Coupon created");
  },
}));

