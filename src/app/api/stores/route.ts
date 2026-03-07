import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-response";
import { userRepository } from "@/repositories";
import { USER_FIELDS } from "@/db/schema";
import { createApiHandler } from "@/lib/api/api-handler";
import type { SieveModel } from "@/lib/query/firebase-sieve";
import type { UserDocument } from "@/db/schema";

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
    if (q) filtersArr.push(`displayName_=${q}`);
    if (model.filters) filtersArr.push(model.filters);
    model.filters = filtersArr.join(",") || undefined;

    const result = await userRepository.listSellers(model);

    const stores = result.items.map((user: UserDocument) => ({
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      avatarMetadata: user.avatarMetadata,
      role: user.role,
      createdAt: user.createdAt,
      storeSlug: user.storeSlug,
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
          }
        : undefined,
      stats: user.stats,
    }));

    return successResponse({ ...result, items: stores });
  },
});
