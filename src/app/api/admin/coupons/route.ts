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
import {
  couponCreateBodySchema,
  type CouponCreateBody,
} from "@mohasinac/appkit/features/promotions/schemas/index";
import { z } from "zod";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

/*
 * 🛑 Imported from appkit, not declared here — a zod schema cannot cross the
 * version boundary. This body schema composed appkit's `bxgyConfigSchema`
 * (zod 3) into a consumer `z.object({...})` (zod 4), and zod 4 THROWS on that:
 * "Invalid element at key ...: expected a Zod schema". Every POST to this
 * route failed, and the only signal was a type error that reads as cosmetic.
 */
const couponCreateSchema = couponCreateBodySchema;

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
