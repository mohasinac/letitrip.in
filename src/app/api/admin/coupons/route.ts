/**
 * Admin Coupons API Route
 * GET  /api/admin/coupons — List all coupons
 * POST /api/admin/coupons — Create a new coupon (admin)
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { couponsRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import type { CouponCreateInput } from "@/db/schema";
import { z } from "zod";

const couponCreateSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(1),
  description: z.string().default(""),
  type: z.enum(["percentage", "fixed", "free_shipping", "buy_x_get_y"]),
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
      combineWithSellerCoupons: z.boolean().default(false),
    })
    .default({
      firstTimeUserOnly: false,
      combineWithSellerCoupons: false,
    }),
  createdBy: z.string().optional().default("admin"),
});

/**
 * GET /api/admin/coupons
 */
export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async (_: { request: NextRequest }) => {
    serverLogger.info("Admin coupons list requested");

    const coupons = await couponsRepository.findAll();

    return successResponse({
      coupons,
      meta: { total: coupons.length },
    });
  },
});

/**
 * POST /api/admin/coupons
 */
export const POST = createApiHandler({
  auth: true,
  roles: ["admin"],
  handler: async ({ request, user }: { request: NextRequest; user?: any }) => {
    const body = await request.json();

    const validation = couponCreateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(ERROR_MESSAGES.VALIDATION.FAILED, 400);
    }

    const input: CouponCreateInput = {
      ...validation.data,
      createdBy: user.uid,
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
      adminUid: user.uid,
    });

    return successResponse(created, SUCCESS_MESSAGES.COUPON.CREATED);
  },
});
