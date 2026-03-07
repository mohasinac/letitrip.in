import { successResponse } from "@/lib/api-response";
import { storeRepository } from "@/repositories";
import { createApiHandler } from "@/lib/api/api-handler";
import type { SieveModel } from "@/lib/query/firebase-sieve";
import type { StoreDocument } from "@/db/schema";

export const GET = createApiHandler({
  handler: async ({ request }) => {
    const { searchParams } = request.nextUrl;

    const model: SieveModel = {
      filters: searchParams.get("filters") ?? undefined,
      sorts: searchParams.get("sorts") ?? "-createdAt",
      page: searchParams.get("page") ?? "1",
      pageSize: searchParams.get("pageSize") ?? "24",
    };

    const filtersArr: string[] = [];
    const q = searchParams.get("q");
    if (q) filtersArr.push(`storeName_=${q}`);
    if (model.filters) filtersArr.push(model.filters);
    model.filters = filtersArr.join(",") || undefined;

    const result = await storeRepository.listStores(model);

    const items = result.items.map((store: StoreDocument) => ({
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
      totalProducts: store.stats?.totalProducts ?? 0,
      itemsSold: store.stats?.itemsSold ?? 0,
      totalReviews: store.stats?.totalReviews ?? 0,
      averageRating: store.stats?.averageRating,
      createdAt: store.createdAt,
    }));

    return successResponse({ ...result, items });
  },
});
