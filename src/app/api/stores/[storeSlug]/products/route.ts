import { successResponse } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
import { storeRepository, productRepository } from "@/repositories";
import type { SieveModel } from "@/lib/query/firebase-sieve";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

/**
 * GET /api/stores/[storeSlug]/products
 * Returns published (non-auction) products for a store, paginated via Sieve.
 */
export const GET = createApiHandler<never, { storeSlug: string }>({
  rateLimit: RateLimitPresets.API,
  handler: async ({ params, request }) => {
    const { storeSlug } = params!;

    const storeDoc = await storeRepository.findBySlug(storeSlug);
    if (!storeDoc || storeDoc.status !== "active" || !storeDoc.isPublic) {
      throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    const { searchParams } = request.nextUrl;
    const model: SieveModel = {
      filters: undefined,
      sorts: searchParams.get("sorts") ?? "-createdAt",
      page: searchParams.get("page") ?? "1",
      pageSize: searchParams.get("pageSize") ?? "24",
    };

    const filtersArr = [
      `sellerId==${storeDoc.ownerId}`,
      "status==published",
      "isAuction==false",
    ];
    const extraFilters = searchParams.get("filters");
    if (extraFilters) filtersArr.push(extraFilters);
    model.filters = filtersArr.join(",");

    const result = await productRepository.list(model, {
      sellerId: storeDoc.ownerId,
      status: "published",
    });

    return successResponse(result);
  },
});
