import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
import { userRepository, productRepository } from "@/repositories";
import type { SieveModel } from "@/lib/query/firebase-sieve";

/**
 * GET /api/stores/[storeSlug]/products
 * Returns published (non-auction) products for a store, paginated via Sieve.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ storeSlug: string }> },
) {
  try {
    const { storeSlug } = await context.params;

    if (!storeSlug) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.FAILED);
    }

    const seller = await userRepository.findByStoreSlug(storeSlug);
    if (
      !seller ||
      (seller.role !== "seller" && seller.role !== "admin") ||
      seller.storeStatus !== "approved"
    ) {
      throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    const { searchParams } = request.nextUrl;
    const model: SieveModel = {
      filters: undefined,
      sorts: searchParams.get("sorts") ?? "-createdAt",
      page: searchParams.get("page") ?? "1",
      pageSize: searchParams.get("pageSize") ?? "24",
    };

    // Build filter: published non-auction products for this seller
    const filtersArr = [
      `sellerId==${seller.uid}`,
      "status==published",
      "isAuction==false",
    ];
    const extraFilters = searchParams.get("filters");
    if (extraFilters) filtersArr.push(extraFilters);
    model.filters = filtersArr.join(",");

    const result = await productRepository.list(model, {
      sellerId: seller.uid,
      status: "published",
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
