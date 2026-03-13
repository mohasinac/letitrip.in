/**
 * GET /api/seller/store — Get the authenticated seller's StoreDocument
 *
 * Store data lives in the `stores` Firestore collection as a separate document.
 * UserDocument keeps storeId + storeSlug as indexed convenience fields.
 *
 * Mutations (create/update) use Server Actions: createStoreAction / updateStoreAction.
 */

import { storeRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";

// ─── GET ─────────────────────────────────────────────────────────────────────

export const GET = createApiHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    return successResponse({ store: store ?? null });
  },
});
