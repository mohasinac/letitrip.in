import { withProviders } from "@/providers.config";
/**
 * Admin Coupons API Route
 * GET  /api/admin/coupons â€” Delegated to @mohasinac/feat-admin
 * POST /api/admin/coupons â€” Create a new coupon (admin, local)
 */

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { toApiIssues } from "@mohasinac/appkit/errors/error-envelope";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { couponsRepository } from "@mohasinac/appkit/features/promotions/repository/coupons.repository";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";
import type { CouponCreateInput } from "@mohasinac/appkit/features/promotions/schemas/firestore";
import { z } from "zod";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const couponCreateSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(1),
  description: z.string().default(""),
  type: z.enum(["percentage", "fixed", "free_shipping", "buy_x_get_y"]),
  /*
   * 🛑 Tiered discounts. ABSENT FROM BOTH ROUTES until now, which is the same
   * silent-strip trap the category PATCH schema just had: `z.object()` drops
   * unknown keys, so a coupon editor sending tiers would get a 200 and no
   * write. Worth stating because the field has been on `CouponDocument` since
   * the collection shipped — the gap was never the storage.
   *
   * `discountValue` is a PERCENTAGE for a percentage coupon and decimal
   * RUPEES for a fixed one, per the field's own contract, so it cannot be
   * bounded tighter than >= 0 here without knowing the type.
   */
  tiers: z
    .array(
      z.object({
        minAmount: z.number().min(0),
        discountValue: z.number().min(0),
      }),
    )
    .max(6)
    .optional(),
  discount: z.object({
    value: z.number().min(0),
    maxDiscount: z.number().optional(),
    minPurchase: z.number().optional(),
  }),
  usage: z.object({
    totalLimit: z.number().optional(),
    perUserLimit: z.number().optional(),
    currentUsage: z.number().default(0),
  }),
  validity: z.object({
    startDate: z.string().transform((v) => new Date(v)),
    endDate: z
      .string()
      .optional()
      .transform((v) => (v ? new Date(v) : undefined)),
    isActive: z.boolean().default(false),
  }),
  restrictions: z
    .object({
      applicableProducts: z.array(z.string()).optional(),
      applicableCategories: z.array(z.string()).optional(),
      applicableSellers: z.array(z.string()).optional(),
      excludeProducts: z.array(z.string()).optional(),
      excludeCategories: z.array(z.string()).optional(),
      firstTimeUserOnly: z.boolean().default(false),
    })
    .default({
      firstTimeUserOnly: false,
    }),
  createdBy: z.string().optional().default("admin"),
}).superRefine((data, ctx) => {
  if (data.type === "percentage" && data.discount.value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Percentage discount cannot exceed 100%",
      path: ["discount", "value"],
    });
  }
});

/**
 * GET /api/admin/coupons
 */
const __GET__g = withProviders(createRouteHandler({
  roles: [...ROLES_ADMIN_MOD],
  handler: async ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, Number(url.searchParams.get("pageSize")) || 50),
    );
    const filters = url.searchParams.get("filters") ?? undefined;
    const sorts =
      url.searchParams.get("sorts") ??
      url.searchParams.get("sort") ??
      "-createdAt";
    const searchTerm = url.searchParams.get("q")?.trim() || undefined;
    const result = await couponsRepository.list(
      { filters, sorts, page, pageSize },
      // Token search rides OUTSIDE `filters` — array-contains is not
      // expressible in Sieve, so it travels as an opt.
      searchTerm ? { search: searchTerm } : undefined,
    );
    return successResponse({
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    });
  },
}));

/**
 * POST /api/admin/coupons
 */
const __POST__g = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_ONLY],
  permission: "admin:coupons:write",
  handler: async ({ request, user }) => {
    const body = await request.json();

    const validation = couponCreateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(ERROR_MESSAGES.VALIDATION.FAILED, 400, {
        issues: toApiIssues(validation.error.issues),
      });
    }

    const input: CouponCreateInput = {
      ...validation.data,
      createdBy: user!.uid,
      scope: "admin",
    };

    // Check for duplicate code
    const existing = await couponsRepository.getCouponByCode(input.code);
    if (existing) {
      return errorResponse(ERROR_MESSAGES.COUPON.DUPLICATE_CODE, 409);
    }

    const created = await couponsRepository.create(input);

    serverLogger.info("Admin coupon created", {
      couponId: created.id,
      code: created.code,
      adminUid: user!.uid,
    });

    return successResponse(created, SUCCESS_MESSAGES.COUPON.CREATED);
  },
}));

export const GET = __GET__g;
export const POST = __POST__g;
