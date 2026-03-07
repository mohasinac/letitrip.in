import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
import { storeRepository, productRepository } from "@/repositories";
import type { SieveModel } from "@/lib/query/firebase-sieve";

/**
 * GET /api/stores/[storeSlug]/auctions
 * Returns published auction listings for a store, paginated via Sieve.
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

    // Build filter: published auction products for this store's owner
    const filtersArr = [
      `sellerId==${storeDoc.ownerId}`,
      "status==published",
      "isAuction==true",
    ];
    const extraFilters = searchParams.get("filters");
    if (extraFilters) filtersArr.push(extraFilters);
    model.filters = filtersArr.join(",");

    const result = await productRepository.list(model, {
      sellerId: storeDoc.ownerId,
      status: "published",
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
