import { withProviders } from "@/providers.config";
/**
 * GET /api/admin/stores
 *
 * Admin endpoint — paginated list of all stores, filterable by status.
 * Uses storeRepository (stores collection) as the source of truth.
 */

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { getNumberParam, getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import type { StoreDocument } from "@mohasinac/appkit/features/stores/schemas/firestore";
import type { SieveModel } from "@mohasinac/appkit/providers/db-firebase/sieve";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { STORE_FIELDS } from "@mohasinac/appkit/features/stores/schemas/firestore";
import { ROLES_ADMIN_MOD } from "@/constants";

const DEFAULT_SORTS = sortBy(STORE_FIELDS.CREATED_AT);

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 25, {
      min: 1,
      max: 50,
    });
    const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;

    const filtersArr: string[] = [];
    const statusFilter = getStringParam(searchParams, "storeStatus");
    if (statusFilter && statusFilter !== "all") {
      filtersArr.push(`status==${statusFilter}`);
    }
    const extraFilters = getStringParam(searchParams, "filters");
    if (extraFilters) filtersArr.push(extraFilters);
    /*
     * `searchTxt`, not `storeName_=`.
     *
     * `stores` has been fully searchTxt-migrated — name, description and
     * category, prefix-expanded — and `listStores` implements the query. This
     * route pushed `storeName_=${q}` instead: a STARTS-WITH match on the name
     * alone, so an admin looking for "Beyblade Arena" found nothing by typing
     * "arena", and nothing by typing any word from its description.
     */
    const q = getStringParam(searchParams, "q");

    const model: SieveModel = {
      filters: filtersArr.join(",") || undefined,
      sorts,
      page,
      pageSize,
    };

    const result = await storeRepository.listAllStores(model, { search: q || undefined });

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
      [STORE_FIELDS.ADMIN_NOTES]: store.adminNotes,
      [STORE_FIELDS.IS_FEATURED]: Boolean(store.isFeatured),
      [STORE_FIELDS.IS_VERIFIED]: Boolean(store.isVerified),
      /*
       * 🛑 Returned because the editor is SEEDED FROM THE LIST ROW and its
       * save handler re-sends every field unconditionally. Omitted here, the
       * row carries `undefined`, the editor defaults to false, and saving ANY
       * unrelated field silently REVOKES trust — Root Cause #38, which is the
       * exact shape that once un-verified stores and reset their capabilities.
       *
       * Safe to return: this is the admin list, not a public projection.
       * `trustedSeller` stays in PRIVATE_STORE_FIELDS for the buyer-facing
       * one, which is a different adapter.
       */
      [STORE_FIELDS.TRUSTED_SELLER]: Boolean(store.trustedSeller),
      [STORE_FIELDS.SUSPENSION_REASON]: store.suspensionReason,
      [STORE_FIELDS.CAPABILITIES]: store.capabilities ?? [],
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    }));

    return successResponse({ ...result, items: stores });
  },
}));

