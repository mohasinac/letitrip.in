/**
 * GET /api/admin/stores
 *
 * Admin endpoint — paginated list of all sellers with store data,
 * filterable by storeStatus (pending | approved | rejected).
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { userRepository } from "@/repositories";
import type { UserDocument } from "@/db/schema";
import type { SieveModel } from "@/lib/query/firebase-sieve";

export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request }: { request: NextRequest }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 25, {
      min: 1,
      max: 100,
    });
    const sorts = getStringParam(searchParams, "sorts") || "-createdAt";

    // Build Sieve filter — always scoped to sellers, optional storeStatus filter
    const filtersArr: string[] = [];
    const storeStatus = getStringParam(searchParams, "storeStatus");
    if (storeStatus && storeStatus !== "all") {
      filtersArr.push(`storeStatus==${storeStatus}`);
    }
    const extraFilters = getStringParam(searchParams, "filters");
    if (extraFilters) filtersArr.push(extraFilters);
    const q = getStringParam(searchParams, "q");
    if (q) filtersArr.push(`displayName_=${q}`);

    const model: SieveModel = {
      filters: filtersArr.join(",") || undefined,
      sorts,
      page,
      pageSize,
    };

    const result = await userRepository.listSellersForAdmin(model);

    // Strip sensitive fields — expose only store-relevant data
    const stores = result.items.map((user: UserDocument) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      avatarMetadata: user.avatarMetadata,
      role: user.role,
      disabled: user.disabled,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      storeSlug: user.storeSlug ?? null,
      storeStatus: user.storeStatus ?? "pending",
      publicProfile: user.publicProfile
        ? {
            isPublic: user.publicProfile.isPublic,
            bio: user.publicProfile.bio,
            location: user.publicProfile.location,
            storeName: user.publicProfile.storeName,
            storeDescription: user.publicProfile.storeDescription,
            storeCategory: user.publicProfile.storeCategory,
            storeLogoURL: user.publicProfile.storeLogoURL,
            storeBannerURL: user.publicProfile.storeBannerURL,
            storeReturnPolicy: user.publicProfile.storeReturnPolicy,
            storeShippingPolicy: user.publicProfile.storeShippingPolicy,
            isVacationMode: user.publicProfile.isVacationMode,
          }
        : null,
      stats: user.stats ?? null,
    }));

    return successResponse({ ...result, items: stores });
  },
});
