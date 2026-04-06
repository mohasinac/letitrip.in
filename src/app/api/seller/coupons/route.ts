import "@/providers.config";
/**
 * Seller Coupons API Route
 * GET /api/seller/coupons — Returns all coupons owned by the authenticated seller
 */
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { couponsRepository } from "@/repositories";

export const GET = createApiHandler({
  roles: ["seller", "admin", "moderator"],
  handler: async ({ request, user }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      200,
      Math.max(1, Number(url.searchParams.get("pageSize")) || 100),
    );
    const sorts =
      url.searchParams.get("sorts") ??
      url.searchParams.get("sort") ??
      "-createdAt";

    const result = await couponsRepository.list({
      filters: `sellerId==${user!.uid}`,
      sorts,
      page,
      pageSize,
    });

    return successResponse({ coupons: result.items, total: result.total });
  },
});
