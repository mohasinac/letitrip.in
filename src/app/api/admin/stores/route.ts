import "@/providers.config";
/**
 * GET /api/admin/stores
 *
 * Admin endpoint — paginated list of all stores, filterable by status.
 * Uses storeRepository (stores collection) as the source of truth.
 */

import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { successResponse } from "@mohasinac/appkit/next";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit/next";
import { storeRepository } from "@/repositories";
import type { StoreDocument } from "@/db/schema";
import type { SieveModel } from "@/lib/query/firebase-sieve";

export const GET = createRouteHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 25, {
      min: 1,
      max: 100,
    });
    const sorts = getStringParam(searchParams, "sorts") || "-createdAt";

    const filtersArr: string[] = [];
    const statusFilter = getStringParam(searchParams, "storeStatus");
    if (statusFilter && statusFilter !== "all") {
      filtersArr.push(`status==${statusFilter}`);
    }
    const extraFilters = getStringParam(searchParams, "filters");
    if (extraFilters) filtersArr.push(extraFilters);
    const q = getStringParam(searchParams, "q");
    if (q) filtersArr.push(`storeName_=${q}`);

    const model: SieveModel = {
      filters: filtersArr.join(",") || undefined,
      sorts,
      page,
      pageSize,
    };

    const result = await storeRepository.listAllStores(model);

    const stores = result.items.map((store: StoreDocument) => ({
      id: store.id,
      storeSlug: store.storeSlug,
      ownerId: store.ownerId,
      storeName: store.storeName,
      storeDescription: store.storeDescription,
      storeCategory: store.storeCategory,
      storeLogoURL: store.storeLogoURL,
      storeBannerURL: store.storeBannerURL,
      status: store.status,
      isPublic: store.isPublic,
      isVacationMode: store.isVacationMode,
      returnPolicy: store.returnPolicy,
      shippingPolicy: store.shippingPolicy,
      bio: store.bio,
      location: store.location,
      stats: store.stats ?? null,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    }));

    return successResponse({ ...result, items: stores });
  },
});
